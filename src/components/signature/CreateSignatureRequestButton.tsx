'use client';

import { useState } from 'react';
import QRCode from 'qrcode';

type CreateSignatureResponse = {
  result: {
    requestId: string;
    token: string;
    docId: string;
    expiresAtMs: number;
  };
};

export default function CreateSignatureRequestButton({ docId }: { docId: string }) {
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createRequest = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/__/functions/createSignatureRequest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { docId } })
      });

      const payload = (await response.json()) as CreateSignatureResponse;
      const token = payload?.result?.token;
      if (!response.ok || !token) {
        throw new Error('Failed to create signature request');
      }

      const customerLink = `${window.location.origin}/sign/${token}`;
      setLink(customerLink);
      setQrDataUrl(await QRCode.toDataURL(customerLink));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to create signature request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button type="button" onClick={createRequest} disabled={loading}>
        {loading ? 'Creating…' : 'Create Signature Request'}
      </button>
      {link ? <p>Customer Link: {link}</p> : null}
      {qrDataUrl ? <img src={qrDataUrl} alt="Signature request QR code" /> : null}
      {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
    </div>
  );
}
