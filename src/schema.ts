import { z } from "zod";
import { google } from "@google-cloud/retail/build/protos/protos";
import { AIProduct, AIProductAttributes } from "./synerise-types";

const makeAIProductAttributes = (attributes: {
  [key: string]: google.cloud.retail.v2beta.ICustomAttribute;
}): AIProductAttributes => {
  return {
    buckleTypeLabel: attributes.buckleTypeLabel?.text?.[0] ?? "",
    categoryCode: attributes.categoryCode?.text?.[0] ?? "",
    categoryLabel: attributes.categoryLabel?.text?.[0] ?? "",
    definition1Code: attributes.definition1Code?.text?.[0] ?? "",
    definition1Label: attributes.definition1Label?.text?.[0] ?? "",
    definition2Label: attributes.definition2Label?.text?.[0] ?? "",
    definition3Label: attributes.definition3Label?.text?.[0] ?? "",
    familyLabel: attributes.familyLabel?.text?.[0] ?? "",
    genderCode: attributes.genderCode?.text?.[0] ?? "",
    gtins: attributes.gtin?.text ?? [],
    season: attributes.season?.text?.[0] ?? "",
    sizesEur: attributes?.allSizesEur?.text
      ? attributes.allSizesEur.text[0].split(";")
      : [],
    genderLabel: attributes.genderLabel?.text?.[0] ?? "",
    groupingCode: attributes.groupingCode?.text?.[0] ?? "",
    itemBrandLabel: "-", // TODO
    referencePrice: attributes.referencePrice?.text?.[0] ?? "",
    productGroupCode: attributes.productGroupCode?.text?.[0] ?? "",
    shoeToeTypeLabel: attributes.shoeToeTypeLabel?.text?.[0] ?? "",
    sportCategoryCode: attributes.sportCategoryCode?.text?.[0] ?? "",
    sportCategoryLabel: attributes.sportCategoryLabel?.text?.[0] ?? "",
  };
};

const validateRetailProduct = (
  product: google.cloud.retail.v2alpha.IProduct,
): void => {
  if (!product.id) {
    throw new Error("Product ID is missing");
  }
  if (!product.title) {
    throw new Error("Product title is missing");
  }
  if (
    !product.priceInfo ||
    !product.priceInfo.price ||
    typeof product.priceInfo.price !== "number"
  ) {
    throw new Error("Product price is missing or invalid");
  }
  if (!product.availability) {
    throw new Error("Product availability is missing");
  }
  if (!product.brands || product.brands.length === 0) {
    throw new Error("Product brand is missing");
  }
  if (!product.categories || product.categories.length === 0) {
    throw new Error("Product category is missing");
  }
  if (!product.description) {
    throw new Error("Product description is missing");
  }
  if (
    !product.images ||
    product.images.length === 0 ||
    !product.images[0].uri
  ) {
    throw new Error("Product image is missing");
  }
  if (!product.uri) {
    throw new Error("Product URI is missing");
  }
  // TODO add colorInfo (missing in producti import)
  // if (
  //   !product.colorInfo ||
  //   !product.colorInfo.colors ||
  //   product.colorInfo.colors.length === 0
  // ) {
  //   throw new Error("Product color information is missing");
  // }
  if (!product.primaryProductId) {
    throw new Error("Product primary product ID is missing");
  }
  if (!product.sizes || product.sizes.length === 0) {
    throw new Error("Product sizes are missing");
  }
};

export const retailProductToAIProduct = (
  product: google.cloud.retail.v2beta.IProduct,
): AIProduct => {
  validateRetailProduct(product);

  const aiProduct: AIProduct = {
    attributes: makeAIProductAttributes(product.attributes!),
    availability: product.availability === "IN_STOCK",
    brand: product.brands![0]!,
    category: product.categories![0]!,
    color: product.colorInfo!.colors![0]!,
    colors: product.colorInfo!.colorFamilies ?? [],
    description: product.description!,
    effectivePrice: product.priceInfo!.price!,
    imageLink: product.images![0]!.uri!,
    itemGroupId: product.primaryProductId!,
    itemId: product.id!,
    link: product.uri!,
    mpn: "-",
    price: {
      value: product.priceInfo!.price!,
    },
    salePrice: {
      value: product.priceInfo!.originalPrice ?? product.priceInfo!.price!,
    },
    sizes: product.sizes!,
    title: product.title!,
  };

  return aiProduct;
};

export const searchRequestSchema = z.object({
  query: z.string(),
  token: z.string(),
  clientUUID: z.string(),
  limit: z.number().int().positive(),
  page: z.number().int().nonnegative(),
  includeMeta: z.boolean(),
  facets: z.string(),
  includeFacets: z.string(),
  indexId: z.string(),
});

export const autocompleteQuerySchema = z.object({
  query: z.string(),
  visitorId: z.string(),
});
