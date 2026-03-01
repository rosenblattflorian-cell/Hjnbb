import { initializeApp, getApps } from 'firebase-admin/app';
import { createSignatureRequest } from './signature/createSignatureRequest.js';
import { submitSignature } from './signature/submitSignature.js';

if (getApps().length === 0) {
  initializeApp();
}

export { createSignatureRequest, submitSignature };
