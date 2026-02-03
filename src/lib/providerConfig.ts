export type ProviderParams = {
  limit?: number;
};

export type ProviderConfig = {
  id: string;
  name: string;
  type: 'opensky' | 'aviation-edge';
  baseUrl: string;
  attribution: string;
  apiKeyEnv?: string;
  params?: ProviderParams;
};

export type RuntimeProviderConfig = {
  selectedProviderId: string;
  selectedProvider: ProviderConfig;
  updatedAt: string;
};
