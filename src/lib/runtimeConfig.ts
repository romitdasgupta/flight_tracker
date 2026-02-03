import type { ProviderConfig, RuntimeProviderConfig } from './providerConfig';

const RUNTIME_CONFIG_URL = '/runtime-provider.json';

export const FALLBACK_PROVIDER: ProviderConfig = {
  id: 'opensky',
  name: 'OpenSky',
  type: 'opensky',
  baseUrl: 'https://opensky-network.org/api/states/all',
  attribution: 'Data: OpenSky Network'
};

export async function loadRuntimeProvider(): Promise<ProviderConfig> {
  try {
    const response = await fetch(RUNTIME_CONFIG_URL, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Missing runtime provider config');
    }
    const data = (await response.json()) as RuntimeProviderConfig;
    if (!data?.selectedProvider) {
      throw new Error('Invalid runtime provider config');
    }
    return data.selectedProvider;
  } catch (error) {
    console.warn('Falling back to default provider:', error);
    return FALLBACK_PROVIDER;
  }
}
