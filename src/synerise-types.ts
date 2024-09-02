export interface AISearchRequest {
  query: string;
  token: string;
  clientUUID: string;
  limit: number;
  page: number;
  includeMeta: boolean;
  facets: string;
  includeFacets: string;
}

export interface AIProduct {
  attributes: {
    [key: string]: string | string[];
  };
  availability: boolean;
  brand: string;
  category: string;
  color: string;
  colors: string[];
  description: string;
  effectivePrice: number;
  imageLink: string;
  itemGroupId: string;
  itemId: string;
  link: string;
  mpn: string;
  price: {
    value: number;
  };
  salePrice: {
    value: number;
  };
  sizes: string[];
  title: string;
}

export interface AISearchResponse {
  data: AIProduct[];
  meta: {
    code: number;
    limit: number;
    link: any[];
    links: any[];
    page: number;
    totalCount: number;
    totalPages: number;
  };
  // TODO this is to be implemented with facets, also pretty straightforward
  // extras: {
  //   allFacets: Record<string, unknown>;
  //   appliedRules: any[];
  //   correlationId: string;
  //   filteredFacets: Record<string, unknown>;
  //   searchId: string;
  //   suggestions: any[];
  // };
}
