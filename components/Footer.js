import Image from "next/image";
import Link from "next/link";

export default function Footer({ footer, brand }) {
  const columns = footer?.columns || [];
  const socialLinks =
    (brand?.socialLinks && brand.socialLinks.length && brand.socialLinks) ||
    footer?.socialLinks ||
    [];
  const brandName = footer?.brandName || brand?.name || "Juicy Whip";
  const tagline =
    footer?.tagline ||
    brand?.tagline ||
    "Juicy Whip is the largest manufacturer of Hispanic bottled and BIB concentrates in the USA";
  const logoUrl = footer?.logoUrl || brand?.logoUrl || "/juicy-whip-logo.svg";

  return (
    <footer className="relative overflow-hidden bg-[#eef8d8] text-[#16572f]">
      <div className="absolute inset-0 opacity-40">
        <div className="h-6 bg-[url('/juicy-whip-logo.svg')] bg-repeat-x bg-[length:40px_24px] opacity-20" />
      </div>

      <div className="relative mx-auto max-w-6xl border border-[#6fb16c]/60 bg-white/40 px-6 pb-12 pt-10">
        <div className="grid gap-10 md:grid-cols-4 md:gap-8">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="h-16 w-16 overflow-hidden rounded-full border border-[#6fb16c] bg-white/80 p-2 shadow-sm">
                <Image
                  src={logoUrl}
                  alt={`${brandName} logo`}
                  width={72}
                  height={72}
                  className="h-full w-full object-contain"
                />
              </div>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-[#1e7039]">{tagline}</p>
            <div className="flex items-center gap-3 pt-2">
              {socialLinks.map((link) => (
                <SocialIcon key={link.title} title={link.title} href={link.url} />
              ))}
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title} className="space-y-4">
              <h3 className="text-sm font-semibold text-[#136431] uppercase tracking-wide">
                {column.title}
              </h3>
              <ul className="space-y-3 text-sm">
                {(column.items || []).map((item) => (
                  <li key={item.title}>
                    <Link
                      href={item.url || "#"}
                      className="transition hover:text-[#0e4f28]"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ title, href }) {
  const name = (title || "").toLowerCase();
  const iconMap = {
    instagram: "/Instagram.svg",
    x: "/X.svg",
    twitter: "/X.svg",
    facebook: "/Facebook.svg",
    youtube: "/Youtube.svg",
  };
  const iconSrc =
    name.includes("instagram")
      ? iconMap.instagram
      : name === "x" || name.includes("twitter")
      ? iconMap.x
      : name.includes("facebook")
      ? iconMap.facebook
      : name.includes("youtube")
      ? iconMap.youtube
      : null;

  return (
    <Link
      href={href || "#"}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      aria-label={title}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-[#6fb16c]/60 bg-[#cde5c6] transition hover:-translate-y-0.5 hover:bg-[#c1dcba]"
    >
      {iconSrc ? (
        <Image
          src={iconSrc}
          alt={title || "social"}
          width={32}
          height={32}
          className="h-8 w-8 object-contain"
        />
      ) : (
        <span className="text-xs font-semibold uppercase text-[#126030]">
          {title?.[0]}
        </span>
      )}
    </Link>
  );
}
