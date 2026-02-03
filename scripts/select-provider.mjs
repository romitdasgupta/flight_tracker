import fs from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const providersPath = path.join(rootDir, 'config', 'providers.json');
const runtimePath = path.join(rootDir, 'public', 'runtime-provider.json');

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function readProviders() {
  const raw = await fs.readFile(providersPath, 'utf8');
  const data = JSON.parse(raw);
  if (!data || !Array.isArray(data.providers) || data.providers.length === 0) {
    throw new Error('No providers found in config/providers.json');
  }
  return data.providers;
}

async function readRuntimeSelection() {
  try {
    const raw = await fs.readFile(runtimePath, 'utf8');
    const data = JSON.parse(raw);
    return data?.selectedProviderId ?? null;
  } catch {
    return null;
  }
}

async function promptSelection(providers, currentId) {
  if (providers.length === 1) {
    return providers[0];
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const menu = providers
    .map((provider, index) => {
      const current = provider.id === currentId ? ' (current)' : '';
      return `  ${index + 1}. ${provider.name}${current}`;
    })
    .join('\n');

  const promptText = [
    '\nSelect a flight data provider:',
    menu,
    currentId
      ? `\nEnter number to switch (press Enter to keep "${currentId}"):`
      : '\nEnter number:'
  ].join('\n');

  const answer = await new Promise((resolve) => {
    rl.question(`${promptText} `, (value) => resolve(value));
  });

  rl.close();

  if (!answer && currentId) {
    const current = providers.find((provider) => provider.id === currentId);
    if (current) return current;
  }

  const index = toNumber(answer, NaN) - 1;
  const selected = providers[index];
  if (!selected) {
    throw new Error('Invalid provider selection');
  }
  return selected;
}

async function writeRuntimeConfig(provider) {
  const payload = {
    selectedProviderId: provider.id,
    selectedProvider: provider,
    updatedAt: new Date().toISOString()
  };

  await fs.mkdir(path.dirname(runtimePath), { recursive: true });
  await fs.writeFile(runtimePath, JSON.stringify(payload, null, 2));
}

async function main() {
  try {
    const providers = await readProviders();
    const currentId = await readRuntimeSelection();

    // In E2E mode, skip interactive prompt and use existing or first provider
    if (process.env.VITE_E2E) {
      const provider = currentId
        ? providers.find((p) => p.id === currentId) ?? providers[0]
        : providers[0];
      await writeRuntimeConfig(provider);
      process.stdout.write(`\nUsing provider (E2E): ${provider.name}\n`);
      return;
    }

    const selected = await promptSelection(providers, currentId);
    await writeRuntimeConfig(selected);
    process.stdout.write(`\nUsing provider: ${selected.name}\n`);
  } catch (error) {
    console.error('\nProvider selection failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
