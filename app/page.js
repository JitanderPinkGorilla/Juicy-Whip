import Image from "next/image";
import Link from "next/link";
import { getHomePageData, getSiteContent } from "@/lib/shopify";

function firstColor(list = [], key) {
  return list.find((c) => c?.[key])?.[key] || "";
}

function pickBrandColors(colors) {
  if (!colors) return {};
  const primaryBg = firstColor(colors.primary, "background");
  const primaryFg = firstColor(colors.primary, "foreground");
  const secondaryBg = firstColor(colors.secondary, "background");
  const secondaryFg = firstColor(colors.secondary, "foreground");
  return {
    primaryBg,
    primaryFg,
    secondaryBg,
    secondaryFg,
  };
}

export default async function Home() {
  const [homePageData, siteContent] = await Promise.all([
    getHomePageData(),
    getSiteContent(),
  ]);

  const colors = pickBrandColors(siteContent?.brand?.colors);
  const primaryForeground = colors.primaryFg || "#0E6A36";
  const primaryBackground = colors.primaryBg || "#B7D9B3";

  const title = homePageData?.title || "Authentic Taste of\nAgua Fresca";
  const ctaText = homePageData?.ctaText || "Explore";
  const ctaLink = homePageData?.ctaLink || "/collections/drinks";
  const heroImage = homePageData?.heroImage || "/default_image.jpg";

  return (
    <section 
      className="relative overflow-hidden"
      style={{ backgroundColor: primaryBackground, minHeight: "100vh" }}
    >
      <div className="relative mx-auto flex min-h-[calc(100vh-120px)] max-w-6xl flex-col items-center justify-center px-6 pt-20 pb-0 text-center">
        <div className="flex flex-col items-center gap-6 mb-0">
          <h1 
            className="whitespace-pre-line"
            style={{ 
              fontFamily: "var(--font-figtree), sans-serif",
              fontWeight: 700,
              fontSize: "100px",
              lineHeight: "100%",
              letterSpacing: "-0.01em",
              textAlign: "center",
              color: primaryForeground
            }}
          >
            {title}
          </h1>

          <Link
            href={ctaLink}
            className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ 
              fontFamily: "var(--font-figtree), sans-serif",
              backgroundColor: primaryForeground
            }}
          >
            {ctaText}
            <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
              <path
                d="M6 12.5 11 8 6 3.5v9z"
                fill="currentColor"
              />
            </svg>
          </Link>
        </div>
      </div>

      <div className="relative w-full mt-auto">
        <div className="mx-auto flex max-w-6xl items-end justify-center px-6">
          <HeroImage src={heroImage} />
        </div>
      </div>
    </section>
  );
}

function HeroImage({ src }) {
  return (
    <div className="relative w-full flex items-end justify-center">
      <Image
        src={src}
        alt="Assorted Juicy Whip aguas frescas"
        width={1600}
        height={600}
        priority
        className="h-auto w-full max-w-5xl object-contain object-bottom"
        style={{ marginTop: "-20px" }}
      />
    </div>
  );
}
