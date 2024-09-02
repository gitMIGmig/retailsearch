export const mustGetEnv = (key: string) => {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable ${key}`);
  }
  return process.env[key];
};

export const PROJECT_NUMBER = mustGetEnv("PROJECT_NUMBER");
export const SERVICE_ACCOUNT_PATH = mustGetEnv("SERVICE_ACCOUNT_PATH");
export const CATALOG = `projects/${PROJECT_NUMBER}/locations/global/catalogs/default_catalog`;
export const PLACEMENT = `projects/${PROJECT_NUMBER}/locations/global/catalogs/default_catalog/placements/default_search`;
export const BRANCH = `projects/${PROJECT_NUMBER}/locations/global/catalogs/default_catalog/branches/0`;
