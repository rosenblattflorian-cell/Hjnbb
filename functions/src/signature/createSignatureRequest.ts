import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { DEFAULT_TTL_SECONDS, generateToken, hashToken } from './helpers.js';

interface CreateSignatureRequestInput {
  docId: string;
  fieldName?: string;
  ttlSeconds?: number;
}

export const createSignatureRequest = onCall<CreateSignatureRequestInput>(async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Authentication required');
  }

  const { docId, fieldName = 'customerSignature', ttlSeconds = DEFAULT_TTL_SECONDS } = request.data;
  if (!docId) {
    throw new HttpsError('invalid-argument', 'docId is required');
  }

  const db = getFirestore();
  const docRef = db.collection('documents').doc(docId);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    throw new HttpsError('not-found', 'Document not found');
  }

  const docData = docSnap.data();
  if (!docData?.storagePath || typeof docData.storagePath !== 'string') {
    throw new HttpsError('failed-precondition', 'Document is missing a source storagePath');
  }

  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAtMs = Date.now() + Math.max(60, ttlSeconds) * 1000;

  const requestRef = db.collection('signatureRequests').doc();
  await requestRef.set({
    docId,
    tokenHash,
    status: 'PENDING',
    expiresAt: Timestamp.fromMillis(expiresAtMs),
    usedAt: null,
    createdAt: Timestamp.now(),
    createdBy: request.auth.uid,
    fieldName
  });

  return {
    requestId: requestRef.id,
    token,
    docId,
    expiresAtMs
  };
});
