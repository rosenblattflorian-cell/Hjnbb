'use client';

import { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

type SubmitResult = {
  success: true;
  docId: string;
  version: number;
  pdfUrl: string;
};

export default function SignClient({ token }: { token: string }) {
  const canvasRef = useRef<SignatureCanvas | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clear = () => canvasRef.current?.clear();

  const submit = async () => {
    if (!canvasRef.current || canvasRef.current.isEmpty()) {
      setError('Please provide a signature first.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const signatureDataUrl = canvasRef.current.toDataURL('image/png');
      const response = await fetch('/__/functions/submitSignature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, signatureDataUrl })
      });

      const json = (await response.json()) as SubmitResult | { error: string };
      if (!response.ok || 'error' in json) {
        throw new Error('error' in json ? json.error : 'Unable to submit signature');
      }

      setResult(json);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to submit signature');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main style={{ maxWidth: 720, margin: '2rem auto', padding: '1rem' }}>
      <h1>Sign Document</h1>
      {result ? (
        <section>
          <p>Signature complete.</p>
          <a href={result.pdfUrl} target="_blank" rel="noreferrer">
            Download signed PDF (v{result.version})
          </a>
        </section>
      ) : (
        <section>
          <SignatureCanvas
            ref={canvasRef}
            penColor="black"
            canvasProps={{ width: 680, height: 240, style: { border: '1px solid #ddd' } }}
          />
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
            <button type="button" onClick={clear}>
              Clear
            </button>
            <button type="button" disabled={isSubmitting} onClick={submit}>
              {isSubmitting ? 'Submitting…' : 'Submit Signature'}
            </button>
          </div>
          {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
        </section>
      )}
    </main>
  );
}
