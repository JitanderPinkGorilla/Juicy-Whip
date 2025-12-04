import Image from "next/image";
import Link from "next/link";

export default function Footer({ footer }) {
  const columns = footer?.columns || [];
  const socialLinks = footer?.socialLinks || [];
  const brandName = footer?.brandName || "Juicy Whip";
  const tagline =
    footer?.tagline ||
    "Juicy Whip is the largest manufacturer of Hispanic bottled and BIB concentrates in the USA";
  const logoUrl = footer?.logoUrl || "/juicy-whip-logo.svg";

  return (
    <footer className="relative overflow-hidden bg-[#eef8d8] text-[#16572f]">
      <div className="absolute inset-x-0 bottom-[-4rem] text-[12rem] font-black uppercase leading-none text-[#c3dfb6]/60 sm:text-[16rem] lg:text-[20rem]">
        <div className="pointer-events-none select-none text-center tracking-tight">
          JuicyWhip
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-12">
        <div className="grid gap-12 md:grid-cols-4 md:gap-10">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="h-14 w-14 overflow-hidden rounded-full border border-[#6fb16c] bg-white/80 p-1 shadow-sm">
                <Image
                  src={logoUrl}
                  alt={`${brandName} logo`}
                  width={72}
                  height={72}
                  className="h-full w-full object-contain"
                />
              </div>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-[#1e7039]">
              {tagline}
            </p>
            <div className="flex items-center gap-3 pt-2">
              {socialLinks.map((link) => (
                <SocialIcon key={link.title} title={link.title} href={link.url} />
              ))}
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title} className="space-y-4">
              <h3 className="text-lg font-semibold text-[#136431]">
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
  const icon = getSocialIcon(title);

  return (
    <Link
      href={href || "#"}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      aria-label={title}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-[#9cc99b] bg-white/80 text-[#126030] transition hover:-translate-y-0.5 hover:bg-white hover:shadow"
    >
      {icon}
    </Link>
  );
}

function getSocialIcon(title = "") {
  const name = title.toLowerCase();
  if (name.includes("instagram")) return <InstagramIcon />;
  if (name === "x" || name.includes("twitter")) return <XIcon />;
  if (name.includes("facebook")) return <FacebookIcon />;
  if (name.includes("youtube")) return <YouTubeIcon />;
  return <CircleDotIcon />;
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" role="img" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="4" fill="none" stroke="currentColor" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" />
      <circle cx="16.5" cy="7.5" r="1" fill="currentColor" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" role="img" aria-hidden="true">
      <path
        d="M6 5.5h2l4 5 4-5h2l-5 6 5 7h-2l-4-5.5L8 18.5H6l5-6-5-7z"
        fill="currentColor"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" role="img" aria-hidden="true">
      <path
        d="M13 20v-6h2l.5-3H13V8.5c0-.9.3-1.5 1.6-1.5H16V4.2C15.5 4.1 14.3 4 13 4c-2.6 0-4 1.5-4 4.1V11H7v3h2v6h4z"
        fill="currentColor"
      />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" role="img" aria-hidden="true">
      <path
        d="M21 9.5s0-1.8-.4-2.5c-.2-.5-.7-.9-1.2-1C17.7 5.7 12 5.7 12 5.7s-5.7 0-7.4.3c-.5.1-1 .5-1.2 1C3 7.8 3 9.5 3 9.5S3 11.3 3.4 12c.2.5.7.9 1.2 1 1.7.3 7.4.3 7.4.3s5.7 0 7.4-.3c.5-.1 1-.5 1.2-1 .4-.7.4-2.5.4-2.5z"
        fill="currentColor"
      />
      <path d="M10 14.3 15 12 10 9.7v4.6z" fill="#eef8d8" />
    </svg>
  );
}

function CircleDotIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" role="img" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}
