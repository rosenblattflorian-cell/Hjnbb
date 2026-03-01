import fs from 'node:fs';

const required = [
  'firebase.json',
  'apphosting.yaml',
  'functions/src/index.ts',
  'functions/src/signature/helpers.ts',
  'functions/src/signature/createSignatureRequest.ts',
  'functions/src/signature/submitSignature.ts',
  'src/app/sign/[token]/page.tsx',
  'src/app/sign/[token]/sign-client.tsx',
  'src/components/signature/CreateSignatureRequestButton.tsx'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required file: ${file}`);
    process.exit(1);
  }
}

JSON.parse(fs.readFileSync('firebase.json', 'utf8'));
console.log('Lint checks passed.');
