import "dotenv/config";
import { getPreprocessedProducts, importProductsInChunks } from "./products";
import { RetailSearchClient } from "./search";
import { PROJECT_NUMBER, SERVICE_ACCOUNT_PATH } from "./constants";

export const mustGetEnv = (key: string) => {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable ${key}`);
  }
  return process.env[key];
};

process.env.GOOGLE_APPLICATION_CREDENTIALS = SERVICE_ACCOUNT_PATH;

console.log("PROJECT_NUMBER:", PROJECT_NUMBER);
console.log("SERVICE_ACCOUNT_PATH:", SERVICE_ACCOUNT_PATH);

const searchExample = async () => {
  const client = new RetailSearchClient();
  const res = await client.search("airmax", "visitor1");
};

const importProductsExample = async () => {
  const products = getPreprocessedProducts();
  await importProductsInChunks(products);
};
