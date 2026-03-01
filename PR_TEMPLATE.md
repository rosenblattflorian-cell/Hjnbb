## What was broken
- Hosting config assumed static output and rewrites to a non-existent `app` function.
- Signature flow lacked a complete server-authoritative implementation for token validation, one-time use, and PDF embedding.

## What changed
- Aligned deployment with Firebase App Hosting + Cloud Functions.
- Implemented `createSignatureRequest` and completed `submitSignature` flow with token hashing, expiry checks, transactional one-time use, PDF signing, versioning, and signed URL response.
- Added public `/sign/[token]` UI and an internal `CreateSignatureRequestButton` component.
- Tightened Firestore/Storage rules for server-only writes to signature requests and document versions.

## How to run
```bash
npm ci
npm run lint
npm run test
npm run build
```

## Known limitations
- Signature placement currently uses a simple field-name map and defaults to a fixed location on the last PDF page.
