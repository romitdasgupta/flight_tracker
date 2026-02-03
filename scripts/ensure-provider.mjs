import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const providersPath = path.join(rootDir, 'config', 'providers.json');
const runtimePath = path.join(rootDir, 'public', 'runtime-provider.json');

async function main() {
  // Check if runtime-provider.json already exists
  try {
    await fs.access(runtimePath);
    console.log('runtime-provider.json already exists, skipping.');
    return;
  } catch {
    // File doesn't exist, create it with the first provider
  }

  const raw = await fs.readFile(providersPath, 'utf8');
  const data = JSON.parse(raw);
  const provider = data.providers[0];

  const payload = {
    selectedProviderId: provider.id,
    selectedProvider: provider,
    updatedAt: new Date().toISOString()
  };

  await fs.mkdir(path.dirname(runtimePath), { recursive: true });
  await fs.writeFile(runtimePath, JSON.stringify(payload, null, 2));
  console.log(`Created runtime-provider.json with default provider: ${provider.name}`);
}

main().catch((error) => {
  console.error('Failed to ensure provider config:', error.message);
  process.exit(1);
});
