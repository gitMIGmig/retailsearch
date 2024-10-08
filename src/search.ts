import {
  SearchServiceClient,
  CompletionServiceClient,
  ProductServiceClient,
} from "@google-cloud/retail";
import { BRANCH, CATALOG, PLACEMENT } from "./constants";
import { AISearchRequest, AISearchResponse } from "./synerise-types";
import { google } from "@google-cloud/retail/build/protos/protos";
import { retailProductToAIProduct } from "./schema";

export class RetailSearchClient {
  private searchServiceClient: SearchServiceClient;
  private completionServiceClient: CompletionServiceClient;

  constructor() {
    this.searchServiceClient = new SearchServiceClient();
    this.completionServiceClient = new CompletionServiceClient();
  }

  /**
   * search converts AISearchRequest from Synerise, sends to Retail API
   * and converts the Retail API Response into AISearchResponse from Synerise
   * */
  async search(request: AISearchRequest): Promise<AISearchResponse> {
    const req: google.cloud.retail.v2alpha.ISearchRequest = {
      query: request.query,
      visitorId: request.clientUUID,
      placement: PLACEMENT,
      branch: BRANCH,
      offset: request.page * request.limit,
      queryExpansionSpec: { condition: "AUTO" },
    };
    console.debug("retail.SearchRequest:", req);
    try {
      let pageSize = 0;
      let results = [];
      let iter = this.searchServiceClient.searchAsync(req);
      for await (const response of iter) {
        console.log(response.id);
        if (!response.product || !response.product.id) {
          console.error("Product might not be populated yet");
          if (response.id) {
            const [product, _req] = await this.getProduct(response.id);
            if (!product) {
              continue;
            }
            results.push(product);
          }
        } else {
          results.push(response.product!);
        }
        pageSize += 1;
        if (pageSize == request.limit) {
          break;
        }
      }
      const aiRes: AISearchResponse = {
        data: results
          .map((product) => {
            try {
              return retailProductToAIProduct(product);
            } catch (error) {
              console.error("validation error:", error);
              return null;
            }
          })
          .filter((product) => product !== null),
        meta: {
          code: 200,
          page: request.page,
          limit: request.limit,
          link: [],
          links: [],
          totalCount: 0,
          totalPages: 0, // the meta information comes from autocomplete
        },
      };
      return aiRes;
    } catch (error) {
      console.error("An error occurred:", error);
    }
    return {
      data: [],
      meta: {
        code: 500,
        page: 0,
        limit: 0,
        link: [],
        links: [],
        totalCount: 0,
        totalPages: 0,
      },
    };
  }

  /**
   * autocomplete requires a dataset based on search events or importing
   * custom data; pretty basic, requires some more work
   * */
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

  /**
   * getProduct is a utility method, it can be Promise.all'd
   * when the products are marked as retrievable and still indexing
   * */
  private async getProduct(productId: string) {
    const productClient = new ProductServiceClient();
    const res = productClient.getProduct({
      name: BRANCH + "/products/" + productId,
    });
    return res;
  }
}
