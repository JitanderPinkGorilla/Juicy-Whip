import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getFooterContent, getMenu } from "@/lib/shopify";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Juicy Whip",
  description: "Authentic taste of Agua Fresca",
};

export const revalidate = 300;

export default async function RootLayout({ children }) {
  const [headerMenu, footerContent] = await Promise.all([
    getMenu("main-menu"),
    getFooterContent(),
  ]);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#e7f5db] text-[#0f4f29]`}
      >
        <Header menu={headerMenu} brand={footerContent} />
        <main className="min-h-screen bg-gradient-to-b from-[#b6dfb4] via-[#bde3b8] to-[#c1e4bf]">
          {children}
        </main>
        <Footer footer={footerContent} />
      </body>
    </html>
  );
}
