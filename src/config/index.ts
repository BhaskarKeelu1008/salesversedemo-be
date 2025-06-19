import { developmentConfig } from './environments/development';
import { productionConfig } from './environments/production';
import { uatConfig } from './environments/uat';
import { localConfig } from './environments/local';

type Environment = 'development' | 'production' | 'uat' | 'local';

interface Config {
  apiUrl: string;
  environment: Environment;
}

const configs: Record<Environment, Config> = {
  development: developmentConfig,
  production: productionConfig,
  uat: uatConfig,
  local: localConfig,
};

const getEnvironment = (): Environment => {
  const env = import.meta.env.VITE_APP_ENV || 'development';
  return env as Environment;
};

export const config: Config = configs[getEnvironment()];

// Helper function to get API URL with optional path
export const getApiUrl = (path: string = ''): string => {
  const baseUrl = config.apiUrl.replace(/\/$/, ''); // Remove trailing slash if present
  const cleanPath = path.replace(/^\//, ''); // Remove leading slash if present
  return `${baseUrl}/${cleanPath}`;
};
