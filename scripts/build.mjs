import fs from 'node:fs';

const deploymentDoc = fs.readFileSync('docs/DEPLOYMENT.md', 'utf8');
if (!deploymentDoc.includes('firebase deploy')) {
  console.error('Deployment doc is missing firebase deploy instruction.');
  process.exit(1);
}

console.log('Build validation passed.');
