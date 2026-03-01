# Deployment

This repository uses **Firebase App Hosting** for the Next.js web app (including dynamic routes like `/sign/[token]`) and **Cloud Functions** for server-authoritative signature APIs.

## Deploy

1. Install dependencies:
   ```bash
   npm ci
   ```
2. Build and verify locally:
   ```bash
   npm run lint
   npm run test
   npm run build
   ```
3. Deploy Firebase resources:
   ```bash
   firebase deploy
   ```

## Notes

- Do not configure static hosting with `public: ./out`; this app expects SSR/dynamic route support through App Hosting.
- Signature submissions are processed by `submitSignature` Cloud Function.
