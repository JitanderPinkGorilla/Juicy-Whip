const SHOPIFY_DOMAIN = normalizeDomain(process.env.SHOPIFY_STORE_DOMAIN);
const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || "2024-10";
const DEBUG_SHOPIFY = false;

const hasStorefrontConfig = SHOPIFY_DOMAIN && SHOPIFY_STOREFRONT_TOKEN;

function normalizeDomain(domain) {
  if (!domain) return "";
  return domain.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
}

async function shopifyFetch({ query, variables = {}, endpoint, headers }) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!res.ok) {
    const errorBody = await res.text();
    // console.error("Shopify request failed", res.status, errorBody);
    throw new Error(`Shopify request failed: ${res.status}`);
  }

  const json = await res.json();

  return json;
}

export async function getMenu(handle = "main-menu") {
  if (!hasStorefrontConfig) {
    return fallbackMenu(handle);
  }

  try {
    const data = await shopifyFetch({
      query: MENU_QUERY,
      variables: { handle },
      endpoint: `https://${SHOPIFY_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`,
      headers: {
        "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
      },
    });

    const items = data?.data?.menu?.items ?? [];
    if (!items.length) {
      return fallbackMenu(handle);
    }

    return {
      handle,
      source: "shopify",
      items: items.map((item) => ({
        title: item.title,
        url: item.url,
      })),
    };
  } catch (error) {
    // console.error("Error fetching Shopify menu", error);
    return fallbackMenu(handle);
  }
}

export async function getFooterContent() {
  const [primaryMenu, productsMenu, policyMenu, metaobject, brandInfo] =
    await Promise.all([
      getMenu("footer-primary"),
      getMenu("footer-products"),
      getMenu("footer-policy"),
      getFooterMetaobject(),
      getBrandInfo(),
    ]);

  const logoUrl =
    metaobject?.logoUrl ||
    brandInfo?.logoUrl ||
    brandInfo?.squareLogoUrl ||
    "/juicy-whip-logo.svg";

  return {
    brandName: metaobject?.brandName || brandInfo?.name || "Juicy Whip",
    logoUrl: logValue("logoUrl", logoUrl),
    tagline:
      metaobject?.tagline ||
      "Juicy Whip is the largest manufacturer of Hispanic bottled and BIB concentrates in the USA",
    socialLinks: metaobject?.socialLinks || defaultSocialLinks,
    columns: [
      {
        title: "Important Links",
        items: primaryMenu.items,
      },
      {
        title: "Our Products",
        items: productsMenu.items,
      },
      {
        title: "Consumer Policy",
        items: policyMenu.items,
      },
    ],
  };
}

async function getFooterMetaobject() {
  if (!hasStorefrontConfig) return null;

  try {
    const data = await shopifyFetch({
      query: FOOTER_METAOBJECT_QUERY,
      endpoint: `https://${SHOPIFY_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`,
      headers: {
        "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
      },
    });

    const fields = data?.data?.metaobject?.fields || [];
    const mapped = Object.fromEntries(
      fields.map(({ key, value, reference }) => [
        key,
        value || extractReferenceUrl(reference),
      ])
    );

    return {
      brandName: mapped.brandName,
      logoUrl: mapped.logoUrl,
      tagline: mapped.tagline,
      socialLinks: [
        mapped.instagram && { title: "Instagram", url: mapped.instagram },
        mapped.twitter && { title: "Twitter", url: mapped.twitter },
        mapped.facebook && { title: "Facebook", url: mapped.facebook },
        mapped.youtube && { title: "YouTube", url: mapped.youtube },
      ].filter(Boolean),
    };
  } catch (error) {
    // console.error("Error fetching footer metaobject", error);
    return null;
  }
}

function extractReferenceUrl(reference) {
  if (!reference) return "";
  if (typeof reference === "string") return reference;
  if (reference.url) return reference.url;
  if (reference.image?.url) return reference.image.url;
  if (reference.preview?.image?.url) return reference.preview.image.url;
  return "";
}

async function getBrandInfo() {
  if (!hasStorefrontConfig) return null;

  try {
    const json = await shopifyFetch({
      query: BRAND_QUERY,
      endpoint: `https://${SHOPIFY_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`,
      headers: {
        "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
      },
    });

    const shop = json?.data?.shop;
    const brand = shop?.brand;

    // if (DEBUG_SHOPIFY) {
    //   if (!shop || json?.errors?.length) {
    //     console.log("[shopify] brand raw", json);
    //   }
    //   console.log("[shopify] brand response", {
    //     name: shop?.name,
    //     logo: brand?.logo,
    //     squareLogo: brand?.squareLogo,
    //   });
    // }

    return {
      name: shop?.name,
      logoUrl: extractReferenceUrl(brand?.logo),
      squareLogoUrl: extractReferenceUrl(brand?.squareLogo),
      coverImageUrl: extractReferenceUrl(brand?.coverImage),
    };
  } catch (error) {
    // console.error("Error fetching brand info", error);
    return null;
  }
}

function logValue(label, value) {
  // console.log(`[shopify] ${label}:`, value);
  return value;
}

function fallbackMenu(handle) {
  const defaultItems = {
    "main-menu": [
      { title: "Home", url: "/" },
      { title: "Shop Drinks", url: "/collections/drinks" },
      { title: "Fountains", url: "/collections/fountains" },
      { title: "About Us", url: "/pages/about" },
      { title: "Contact Us", url: "/pages/contact" },
    ],
    "footer-primary": [
      { title: "Home", url: "/" },
      { title: "Shop", url: "/collections/all" },
      { title: "About Us", url: "/pages/about" },
      { title: "Contact Us", url: "/pages/contact" },
    ],
    "footer-products": [
      { title: "Fountain", url: "/collections/fountains" },
      { title: "Drinks", url: "/collections/drinks" },
      { title: "My Cart", url: "/cart" },
      { title: "Wishlist", url: "/account/wishlist" },
    ],
    "footer-policy": [
      { title: "Privacy Policy", url: "/policies/privacy-policy" },
      { title: "Terms of Use", url: "/policies/terms-of-service" },
      { title: "Security", url: "/pages/security" },
      { title: "Cancellation & Returns", url: "/policies/refund-policy" },
    ],
  };

  return {
    handle,
    source: "fallback",
    items: defaultItems[handle] || defaultItems["main-menu"],
  };
}

const defaultSocialLinks = [
  { title: "Instagram", url: "https://www.instagram.com/" },
  { title: "X", url: "https://x.com/" },
  { title: "Facebook", url: "https://www.facebook.com/" },
  { title: "YouTube", url: "https://www.youtube.com/" },
];

const MENU_QUERY = `#graphql
  query menu($handle: String!) {
    menu(handle: $handle) {
      handle
      items {
        title
        url
      }
    }
  }
`;

const FOOTER_METAOBJECT_QUERY = `#graphql
  query footerMetaobject {
    metaobject(handle: { handle: "footer", type: "footer_settings" }) {
      fields {
        key
        value
        type
        reference {
          ... on MediaImage {
            image {
              url
            }
          }
          ... on File {
            url
          }
          ... on MediaFile {
            preview {
              image {
                url
              }
            }
          }
        }
      }
    }
  }
`;

const BRAND_QUERY = `#graphql
  query brandInfo {
    shop {
      name
      brand {
        logo {
          image {
            url
          }
        }
        squareLogo {
          image {
            url
          }
        }
        coverImage {
          image {
            url
          }
        }
      }
    }
  }
`;
