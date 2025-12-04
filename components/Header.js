import Image from "next/image";
import Link from "next/link";

function PillLink({ href, children }) {
  return (
    <Link
      href={href}
      className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-[#0f5a30] shadow-sm transition hover:-translate-y-0.5 hover:bg-white/95 hover:shadow-md"
    >
      {children}
    </Link>
  );
}

export default function Header({ menu, brand }) {
  const items = menu?.items || [];
  const logoUrl = brand?.logoUrl || "/juicy-whip-logo.svg";
  const brandName = brand?.brandName || "Juicy Whip";

  return (
    <header className="sticky top-0 z-40 border-b border-[#b0d8a3] bg-gradient-to-r from-[#d6f5c8]/95 via-[#c4ebba]/95 to-[#d6f5c8]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-full border border-[#6fb16c] bg-white/80 p-1 shadow-sm">
            <Image
              src={logoUrl}
              alt={`${brandName} logo`}
              width={64}
              height={64}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <span className="hidden text-lg font-bold text-[#0f5a30] sm:inline">
            {brandName}
          </span>
        </Link>

        <nav className="flex flex-1 flex-wrap items-center justify-center gap-3">
          {items.map((item) => (
            <PillLink key={item.title} href={item.url || "#"}>
              {item.title}
            </PillLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ActionPill href="/account/login" label="Login">
            <UserIcon />
          </ActionPill>
          <ActionPill href="/cart" label="Cart">
            <CartIcon />
          </ActionPill>
        </div>
      </div>
    </header>
  );
}

function ActionPill({ href, label, children }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-[#0f5a30] shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e5f6dc] text-[#0f5a30]">
        {children}
      </span>
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" role="img" aria-hidden="true" className="h-4 w-4">
      <circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" />
      <path
        d="M5 19c1.5-3 4-4.5 7-4.5s5.5 1.5 7 4.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" role="img" aria-hidden="true" className="h-4 w-4">
      <circle cx="9" cy="20" r="1.4" fill="currentColor" />
      <circle cx="17" cy="20" r="1.4" fill="currentColor" />
      <path
        d="M4 4h2l1.8 10.2A1 1 0 0 0 8.8 15h8.9a1 1 0 0 0 1-.8L20 8H6.2"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
      />
    </svg>
  );
}
