import { readFileSync, writeFileSync } from "fs";
import { ProductServiceClient } from "@google-cloud/retail";
import { SERVICE_ACCOUNT_PATH, PROJECT_NUMBER } from "./constants";

process.env.GOOGLE_APPLICATION_CREDENTIALS = SERVICE_ACCOUNT_PATH;

const readJSON = (path: string): any => {
  const content = readFileSync(path, "utf-8");
  return JSON.parse(content);
};

export const writeJSON = (contents: any, path: string): void => {
  writeFileSync(path, JSON.stringify(contents, null, 2));
};

export const getPreprocessedProducts = () => {
  const products: Array<any> = readJSON("./all_products.json");
  for (const product of products) {
    product["availability"] = "IN_STOCK";
    // iterate through keys in attributes, for every key if the value contains
    // an empty value ([]) drop the key
    for (const key in product.attributes) {
      if (product.attributes[key]["text"]?.length === 0) {
        delete product.attributes[key]["text"];
      }
      if (product.attributes[key]["numbers"]?.length === 0) {
        delete product.attributes[key]["numbers"];
      }
      // check if any "text" contains empty string
      if (product.attributes[key]["text"]?.includes("")) {
        delete product.attributes[key];
      }
    }
  }

  return products;
};

export async function importProductsInChunks(products: any[], chunkSize = 50) {
  const productClient = new ProductServiceClient();

  // Function to handle the import of a single chunk
  const importChunk = async (chunk: any[], index: number) => {
    console.info(
      `Importing products ${index * chunkSize} to ${(index + 1) * chunkSize}`,
    );
    try {
      const [operation] = await productClient.importProducts({
        parent: `projects/${PROJECT_NUMBER}/locations/global/catalogs/default_catalog/branches/0`,
        inputConfig: {
          productInlineSource: {
            products: chunk,
          },
        },
      });
      const res = await operation.promise();
      console.debug(`Chunk ${index} result:`);
      console.debug(res);
      if (res[0].errorSamples) console.warn(res[0].errorSamples);
    } catch (error) {
      console.error(`Error importing chunk ${index}:`, error);
    }
  };
  // Split products into chunks
  const chunks = [];
  for (let i = 0; i < products.length; i += chunkSize) {
    chunks.push(products.slice(i, i + chunkSize));
  }

  // Function to process chunks in batches of 5
  const processChunks = async (chunks: any[][], batchSize: number) => {
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      await Promise.all(
        batch.map((chunk, index) => importChunk(chunk, i + index)),
      );
      await new Promise((resolve) => setTimeout(resolve, 3500)); // Wait for 3.5 seconds (quota is 100 requests per minute)
    }
  };

  // Process all chunks with the batch size of 5
  await processChunks(chunks, 5);
}
