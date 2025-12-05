const SHOPIFY_DOMAIN = normalizeDomain(process.env.SHOPIFY_STORE_DOMAIN);
const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || "2025-10";
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

  const responseText = await res.text();
  
  if (!res.ok) {
    console.error("Shopify request failed", res.status, errorBody);
    throw new Error(`Shopify request failed: ${res.status}`);
  }

  const json = JSON.parse(responseText);
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
    console.error("Error fetching Shopify menu", error);
    return fallbackMenu(handle);
  }
}

export async function getSiteContent() {
  const [primaryMenu, productsMenu, policyMenu, metaobject, brandInfo] =
    await Promise.all([
      getMenu("footer-primary"),
      getMenu("footer-products"),
      getMenu("footer-policy"),
      getFooterMetaobject(),
      getBrandInfo(),
    ]);

  const fallbackLogo = "/juicy-whip-logo.svg";
  const logoUrl =
    brandInfo?.logoUrl || brandInfo?.squareLogoUrl || metaobject?.logoUrl || fallbackLogo;
  const brandName = brandInfo?.name || metaobject?.brandName || "Juicy Whip";
  const socialLinks =
    (brandInfo?.socialLinks && brandInfo.socialLinks.length && brandInfo.socialLinks) ||
    (metaobject?.socialLinks && metaobject.socialLinks.length && metaobject.socialLinks) ||
    defaultSocialLinks;

  const brand = {
    name: brandName,
    logoUrl: logValue("logoUrl", logoUrl),
    squareLogoUrl: brandInfo?.squareLogoUrl || metaobject?.logoUrl || logoUrl,
    coverImageUrl: brandInfo?.coverImageUrl,
    faviconUrl: brandInfo?.faviconUrl || logoUrl,
    colors: brandInfo?.colors || defaultBrandColors,
    shortDescription: brandInfo?.shortDescription,
    slogan: brandInfo?.slogan,
    tagline:
      metaobject?.tagline ||
      "Juicy Whip is the largest manufacturer of Hispanic bottled and BIB concentrates in the USA",
    socialLinks,
  };

  const footer = {
    brandName,
    logoUrl: brand.logoUrl,
    tagline: brand.tagline,
    socialLinks: brand.socialLinks,
    faviconUrl: brand.faviconUrl,
    columns: [
      { title: "Important Links", items: primaryMenu.items },
      { title: "Our Products", items: productsMenu.items },
      { title: "Consumer Policy", items: policyMenu.items },
    ],
  };

  return { brand, footer };
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
    console.error("Error fetching footer metaobject", error);
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

function getImageUrl(imageValue, defaultImage = "/default_image.jpg") {
  // If imageValue is a GID (starts with gid://), return default
  if (typeof imageValue === "string" && imageValue.startsWith("gid://")) {
    return defaultImage;
  }
  // If imageValue is empty, null, or undefined, return default
  if (!imageValue || imageValue === "" || imageValue === null || imageValue === undefined) {
    return defaultImage;
  }
  // If imageValue is a valid URL, return it
  if (typeof imageValue === "string" && (imageValue.startsWith("http") || imageValue.startsWith("/"))) {
    return imageValue;
  }
  // Otherwise return default
  return defaultImage;
}

function mapSocialMetafieldsToLinks(values = {}) {
  const platforms = [
    "facebook",
    "pinterest",
    "instagram",
    "tiktok",
    "tumblr",
    "snapchat",
    "vimeo",
    "youtube",
    "x",
  ];
  return platforms
    .map((platform) => {
      const url = values[platform];
      if (!url) return null;
      return { title: platform.charAt(0).toUpperCase() + platform.slice(1), url };
    })
    .filter(Boolean);
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
    
    const socialMetafields = (shop?.metafields || []).filter(Boolean);
    const socialMetafieldValues = Object.fromEntries(
      socialMetafields.map(({ key, value }) => [key, value])
    );

    const logoUrl = extractReferenceUrl(brand?.logo);
    const squareLogoUrl = extractReferenceUrl(brand?.squareLogo);
    const coverImageUrl = extractReferenceUrl(brand?.coverImage);
    const faviconUrl = squareLogoUrl || logoUrl || "";
    const colors = brand?.colors;
    const shortDescription = brand?.shortDescription;
    const slogan = brand?.slogan;
    const socialLinks = mapSocialMetafieldsToLinks(socialMetafieldValues);

    return {
      name: shop?.name,
      logoUrl,
      squareLogoUrl,
      coverImageUrl,
      faviconUrl,
      colors,
      shortDescription,
      slogan,
      socialLinks,
      socialMetafields: socialMetafieldValues,
      rawBrand: brand,
      rawShop: shop,
    };
  } catch (error) {
    console.error("Error fetching brand info", error);
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

const defaultBrandColors = {
  primary: [
    { background: "#B7D9B3", foreground: "#0E6A36" },
    { background: null, foreground: "#0E6A36" },
  ],
  secondary: [
    { background: "#EAF2D1", foreground: "#EAF2D1" },
    { background: "#00B53C", foreground: "#EAF2D1" },
  ],
};

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
      metafields(
        identifiers: [
          { namespace: "social_links", key: "facebook" }
          { namespace: "social_links", key: "pinterest" }
          { namespace: "social_links", key: "instagram" }
          { namespace: "social_links", key: "tiktok" }
          { namespace: "social_links", key: "tumblr" }
          { namespace: "social_links", key: "snapchat" }
          { namespace: "social_links", key: "vimeo" }
          { namespace: "social_links", key: "youtube" }
          { namespace: "social_links", key: "x" }
          { namespace: "social_links", key: "twitter" }
        ]
      ) {
        key
        value
      }
      brand {
        colors {
          primary {
            background
            foreground
          }
          secondary {
            background
            foreground
          }
        }
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
        shortDescription
        slogan
      }
    }
  }
`;

export async function getHomePageData() {
  if (!hasStorefrontConfig) return null;

  try {
    const data = await shopifyFetch({
      query: HOME_PAGE_QUERY,
      endpoint: `https://${SHOPIFY_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`,
      headers: {
        "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
      },
    });

    const fields = data?.data?.metaobject?.fields || [];
    const mapped = Object.fromEntries(
      fields.map(({ key, value, reference }) => {
        let extractedValue = value;
        if (reference) {
          extractedValue = extractReferenceUrl(reference);
        }
        return [key, extractedValue];
      })
    );

    // Map field keys - handle both possible naming conventions
    return {
      title: mapped.title || "Authentic Taste of Agua Fresca",
      subtitle: mapped.subtitle,
      heroImage: getImageUrl(mapped.heroImage || mapped.hero_image, "/default_image.jpg"),
      ctaText: mapped.ctaText || mapped.heroCtaText || mapped.hero_cta_text || "Explore",
      ctaLink: mapped.ctaLink || mapped.heroCtaLink || mapped.hero_cta_link || "/collections/drinks",
      description: mapped.description,
      sections: mapped.sections ? JSON.parse(mapped.sections) : null,
      rawData: mapped,
    };
  } catch (error) {
    console.error("Error fetching home page data", error);
    return null;
  }
}

const HOME_PAGE_QUERY = `#graphql
  query homePageMetaobject {
    metaobject(handle: { handle: "home", type: "home_page" }) {
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
        }
      }
    }
  }
`;
