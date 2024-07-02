import "dotenv/config";
import {
  SearchServiceClient,
  CompletionServiceClient,
  protos,
} from "@google-cloud/retail";

const mustGetEnv = (key: string) => {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable ${key}`);
  }
  return process.env[key];
};

const PROJECT_NUMBER = mustGetEnv("PROJECT_NUMBER");
const SERVICE_ACCOUNT_PATH = mustGetEnv("SERVICE_ACCOUNT_PATH");
const CATALOG = `projects/${PROJECT_NUMBER}/locations/global/catalogs/default_catalog`;
const PLACEMENT = `projects/${PROJECT_NUMBER}/locations/global/catalogs/default_catalog/placements/default_search`;
const BRANCH = `projects/${PROJECT_NUMBER}/locations/global/catalogs/default_catalog/branches/0`;

process.env.GOOGLE_APPLICATION_CREDENTIALS = SERVICE_ACCOUNT_PATH;

console.log("PROJECT_NUMBER:", PROJECT_NUMBER);
console.log("SERVICE_ACCOUNT_PATH:", SERVICE_ACCOUNT_PATH);

class RetailSearchClient {
  private searchServiceClient: SearchServiceClient;
  private completionServiceClient: CompletionServiceClient;

  constructor() {
    this.searchServiceClient = new SearchServiceClient();
    this.completionServiceClient = new CompletionServiceClient();
  }

  async search(query: string, visitorId: string) {
    const req = {
      query,
      visitorId,
      placement: PLACEMENT,
      branch: BRANCH,
      pageSize: 20,
    };
    console.log(req);
    const res = await this.searchServiceClient.search(req);
    return res;
  }

  async autocomplete(query: string, visitorId: string) {
    const req = {
      query,
      visitorId,
      dataset: "cloud-retail",
      catalog: CATALOG,
    };
    console.log(req);
    const res = await this.completionServiceClient.completeQuery(req);
    return res;
  }
}

const main = async () => {
  const client = new RetailSearchClient();
  const res = await client.search("hello", "visitor1");
  console.log(res);
};

main();
