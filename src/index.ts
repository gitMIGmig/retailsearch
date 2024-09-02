import "dotenv/config";
import { Command } from "commander";
import { getPreprocessedProducts, importProductsInChunks } from "./products";
import { RetailSearchClient } from "./search";
import { PROJECT_NUMBER, SERVICE_ACCOUNT_PATH } from "./constants";

// note: this is hacky, don't do this in prod
process.env.GOOGLE_APPLICATION_CREDENTIALS = SERVICE_ACCOUNT_PATH;

const program = new Command();
program
  .description("Retail Search Sizeer PoC")
  .option("-s, --service", "Run in service mode")
  .option("-i, --import", "Import products")
  .option("-h, --help", "Display help information")
  .parse(process.argv);

const options = program.opts();

const searchExample = async () => {
  const client = new RetailSearchClient();
  const res = await client.search("airmax", "visitor1");
  console.log("Search results:", res);
};

const importProductsExample = async () => {
  const products = getPreprocessedProducts();
  await importProductsInChunks(products);
};

const main = async () => {
  console.log("PROJECT_NUMBER:", PROJECT_NUMBER);
  console.log("SERVICE_ACCOUNT_PATH:", SERVICE_ACCOUNT_PATH);

  if (options.help || process.argv.length === 2) {
    program.outputHelp();
  } else if (options.service) {
    console.log("Running in service mode");
    await searchExample();
  } else if (options.import) {
    console.log("Import products");
    await importProductsExample();
  } else {
    console.log("Please specify either --service or --import option");
    program.outputHelp();
  }
};

main().catch((error) => {
  console.error("An error occurred:", error);
  process.exit(1);
});
