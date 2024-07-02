import {
  SearchServiceClient,
  CompletionServiceClient,
} from "@google-cloud/retail";
import { BRANCH, CATALOG, PLACEMENT } from "./constants";

export class RetailSearchClient {
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
