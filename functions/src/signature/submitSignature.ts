import { getStorage } from 'firebase-admin/storage';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { onRequest } from 'firebase-functions/v2/https';
import { PDFDocument } from 'pdf-lib';
import { assertNotExpired, hashToken, parsePngDataUrl } from './helpers.js';

interface SubmitSignatureBody {
  token: string;
  signatureDataUrl: string;
}

function signaturePosition(fieldName: string) {
  if (fieldName === 'customerSignature') {
    return { x: 340, y: 80, width: 180, height: 64 };
  }
  return { x: 340, y: 80, width: 180, height: 64 };
}

export const submitSignature = onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { token, signatureDataUrl } = (req.body || {}) as SubmitSignatureBody;
  if (!token || !signatureDataUrl) {
    res.status(400).json({ error: 'token and signatureDataUrl are required' });
    return;
  }

  try {
    const db = getFirestore();
    const tokenHash = hashToken(token);
    const requestSnap = await db
      .collection('signatureRequests')
      .where('tokenHash', '==', tokenHash)
      .limit(1)
      .get();

    if (requestSnap.empty) {
      res.status(404).json({ error: 'Signature request not found' });
      return;
    }

    const requestRef = requestSnap.docs[0].ref;
    const requestData = requestSnap.docs[0].data();

    let finalized: { docId: string; version: number; sourcePath: string; fieldName: string } | null = null;

    await db.runTransaction(async (tx) => {
      const latestReq = await tx.get(requestRef);
      const data = latestReq.data();
      if (!data) {
        throw new Error('Signature request missing');
      }
      if (data.status !== 'PENDING') {
        throw new Error('Signature request already used');
      }

      const expiresAtMs = (data.expiresAt as Timestamp).toMillis();
      assertNotExpired(expiresAtMs);

      const docRef = db.collection('documents').doc(data.docId);
      const docSnap = await tx.get(docRef);
      const docData = docSnap.data();
      if (!docSnap.exists || !docData?.storagePath) {
        throw new Error('Source document is missing');
      }

      const nextVersion = Number(docData.currentVersion ?? 0) + 1;
      tx.update(requestRef, {
        status: 'USED',
        usedAt: FieldValue.serverTimestamp()
      });
      tx.update(docRef, {
        currentVersion: nextVersion,
        updatedAt: FieldValue.serverTimestamp()
      });

      finalized = {
        docId: data.docId as string,
        version: nextVersion,
        sourcePath: docData.storagePath as string,
        fieldName: (data.fieldName as string) || 'customerSignature'
      };
    });

    if (!finalized) {
      throw new Error('Failed to finalize signature request');
    }

    const pngBytes = parsePngDataUrl(signatureDataUrl);
    const bucket = getStorage().bucket();
    const [pdfBytes] = await bucket.file(finalized.sourcePath).download();
    const pdf = await PDFDocument.load(pdfBytes);
    const png = await pdf.embedPng(pngBytes);

    const pages = pdf.getPages();
    const targetPage = pages[pages.length - 1];
    const pos = signaturePosition(finalized.fieldName);
    targetPage.drawImage(png, pos);

    const signedPdf = await pdf.save();
    const signedStoragePath = `documents/${finalized.docId}/versions/${finalized.version}.pdf`;
    await bucket.file(signedStoragePath).save(Buffer.from(signedPdf), {
      contentType: 'application/pdf'
    });

    const docRef = db.collection('documents').doc(finalized.docId);
    const versionRef = docRef.collection('versions').doc(String(finalized.version));
    await Promise.all([
      docRef.update({ currentSignedStoragePath: signedStoragePath }),
      versionRef.set({
        version: finalized.version,
        signed: true,
        storagePath: signedStoragePath,
        signatureRequestId: requestRef.id,
        createdAt: FieldValue.serverTimestamp()
      })
    ]);

    const [url] = await bucket.file(signedStoragePath).getSignedUrl({
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000
    });

    res.json({
      success: true,
      docId: finalized.docId,
      version: finalized.version,
      pdfUrl: url
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('expired')) {
      res.status(410).json({ error: message });
      return;
    }

    res.status(400).json({ error: message, requestStatus: requestData?.status ?? null });
  }
});
