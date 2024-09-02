import { google } from "@google-cloud/retail/build/protos/protos";
import { AIProduct } from "./synerise-types";

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
  if (
    !product.colorInfo ||
    !product.colorInfo.colors ||
    product.colorInfo.colors.length === 0
  ) {
    throw new Error("Product color information is missing");
  }
  if (!product.primaryProductId) {
    throw new Error("Product primary product ID is missing");
  }
  if (!product.sizes || product.sizes.length === 0) {
    throw new Error("Product sizes are missing");
  }
};

export const retailProductToAIProduct = (
  product: google.cloud.retail.v2alpha.IProduct,
): AIProduct => {
  validateRetailProduct(product);

  const aiProduct: AIProduct = {
    attributes: {},
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

  // Convert attributes
  if (product.attributes) {
    for (const [key, value] of Object.entries(product.attributes)) {
      if (value.text) {
        aiProduct.attributes[key] =
          value.text.length > 1 ? value.text : value.text[0];
      } else if (value.numbers) {
        aiProduct.attributes[key] = value.numbers.map(String);
      }
    }
  }

  return aiProduct;
};
