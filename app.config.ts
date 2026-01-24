import type { ExpoConfig } from 'expo/config';

// Expo config with runtime-injected secrets for local/dev.
// NOTE: This is a temporary approach until we add a proper backend proxy.

export default ({ config }: { config: ExpoConfig }): ExpoConfig => {
  return {
    ...config,
    name: config.name ?? 'medminder',
    slug: config.slug ?? 'medminder',
    extra: {
      ...(config.extra ?? {}),
      // Provided via environment variable in local/dev runtime.
      openaiApiKey: process.env.OPENAI_API_KEY,
    },
  };
};
