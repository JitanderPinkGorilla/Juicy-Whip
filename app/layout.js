import { Geist, Geist_Mono, Bricolage_Grotesque, Figtree } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSiteContent, getMenu } from "@/lib/shopify";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

export const revalidate = 300;

export async function generateMetadata() {
  const siteContent = await getSiteContent();
  const brand = siteContent?.brand || {};
  const title = brand.name || "Juicy Whip";
  const description =
    brand.shortDescription ||
    brand.slogan ||
    brand.tagline ||
    "Juicy Whip is the largest manufacturer of Hispanic bottled and BIB concentrates in the USA";

  return {
    title,
    description,
  };
}

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

function contrastColor(hex) {
  if (!hex || typeof hex !== "string") return "#0f4f29";
  const value = hex.replace("#", "");
  const bigint = parseInt(value.length === 3 ? value.replace(/(.)/g, "$1$1") : value, 16);
  if (Number.isNaN(bigint)) return "#0f4f29";
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#0f4f29" : "#ffffff";
}

export default async function RootLayout({ children }) {
  const [headerMenu, siteContent] = await Promise.all([
    getMenu("main-menu"),
    getSiteContent(),
  ]);

  const favicon = siteContent?.brand?.faviconUrl || siteContent?.brand?.logoUrl;
  const colors = pickBrandColors(siteContent?.brand?.colors);
  const backgroundColor = colors.primaryBg || "#B7D9B3";
  const textColor = colors.primaryFg || "#0E6A36";
  const navBaseBg = "#cde5c6";
  const navHoverBg = "#c1dcba";
  const navActiveBg = "#b8dcb2";
  const navActiveColor = textColor;

  return (
    <html lang="en">
      <head>
        {favicon && <link rel="icon" href={favicon} sizes="any" />}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} ${figtree.variable} antialiased`}
        style={{
          backgroundColor,
          color: textColor,
          fontFamily:
            "var(--font-bricolage), var(--font-geist-sans), var(--font-geist-mono), system-ui, -apple-system, sans-serif",
          "--nav-bg": navBaseBg,
          "--nav-hover-bg": navHoverBg,
          "--nav-color": "#222222",
          "--nav-active-bg": navActiveBg,
          "--nav-active-color": navActiveColor,
        }}
      >
        <Header menu={headerMenu} brand={siteContent.brand} />
        <main
          className="min-h-screen"
          style={{
            backgroundColor,
            color: textColor,
          }}
        >
          {children}
        </main>
        <Footer footer={siteContent.footer} brand={siteContent.brand} />
      </body>
    </html>
  );
}
