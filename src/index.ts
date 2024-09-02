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
  .option("-e, --example", "Run sample search")
  .option("-q, --query <query>", "Search query")
  .option("-s, --service", "Run in service mode")
  .option("-i, --import", "Import products")
  .option("-h, --help", "Display help information")
  .parse(process.argv);

const options = program.opts();

const searchExample = async (query: string) => {
  const client = new RetailSearchClient();
  const req = {
    clientUUID: "123",
    query,
    page: 0,
    limit: 5,
    token: "*oauth2-token*",
    facets: "-", // for now
    includeMeta: true,
    includeFacets: "none", // for now
  };
  console.debug("sample search with Synerise-schema request", req);
  const res = await client.search(req);
  console.log("Search results:", res);
};

const importProductsExample = async () => {
  const products = getPreprocessedProducts();
  await importProductsInChunks(products);
};

const main = async () => {
  console.debug("PROJECT_NUMBER:", PROJECT_NUMBER);
  console.debug("SERVICE_ACCOUNT_PATH:", SERVICE_ACCOUNT_PATH);

  if (options.help || process.argv.length === 2) {
    program.outputHelp();
  } else if (options.example) {
    if (!options.query) {
      console.error("Please specify a query with --query option");
      program.outputHelp();
      return;
    }
    await searchExample(options.query);
  } else if (options.import) {
    console.log("Importing products");
    await importProductsExample();
  } else if (options.service) {
    console.log("Running in service mode at <endpoint> (unimplemented)");
  } else {
    program.outputHelp();
  }
};

main().catch((error) => {
  console.error("An error occurred:", error);
  process.exit(1);
});
