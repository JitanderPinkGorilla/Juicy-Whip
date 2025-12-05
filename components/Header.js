/* eslint-disable react/no-unknown-property */
"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header({ menu, brand }) {
  const staticItems = [
    { title: "Home", url: "/" },
    { title: "Shop Drinks", url: "/collections/drinks" },
    { title: "Fountains", url: "/collections/fountains" },
    { title: "About Us", url: "/pages/about" },
    { title: "Contact Us", url: "/pages/contact" },
  ];
  const items = staticItems;
  const logoUrl = brand?.logoUrl || "/juicy-whip-logo.svg";
  const pathname = usePathname();

  return (
    <header className="z-40 bg-transparent">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-2">
        <Link href="/" className="flex items-center gap-2">
          <div className="header-logo">
            <Image
              src={logoUrl}
              alt="Juicy Whip logo"
              width={133}
              height={90}
              className="h-full w-full object-contain"
              priority
            />
          </div>
        </Link>

        <nav className="flex flex-1 flex-wrap items-center justify-center gap-6">
          {items.map((item) => {
            const isActive =
              pathname === (item.url || "") ||
              pathname === (item.url || "").replace(/\/$/, "") ||
              (item.url === "/" && pathname === "");

            return (
              <Link
                key={item.title}
                href={item.url || "#"}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "header-nav-link",
                  isActive ? "header-nav-link--active" : "header-nav-link--inactive",
                ].join(" ")}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <ActionChip
            href="/account/login"
            label="Login"
            iconSrc="/gridicons_user-circle.svg"
            iconAlt="User"
          />
          <ActionChip
            href="/cart"
            label="Cart"
            iconSrc="/fluent_cart-24-filled.svg"
            iconAlt="Cart"
          />
        </div>
      </div>
    </header>
  );
}

function ActionChip({ href, label, iconSrc, iconAlt }) {
  return (
    <Link
      href={href}
      className="header-action-chip"
    >
      {iconSrc && (
        <span className="header-action-icon">
          <Image
            src={iconSrc}
            alt={iconAlt || ""}
            width={18}
            height={18}
            className="h-[18px] w-[18px] object-contain"
            priority
          />
        </span>
      )}
      <span className="header-action-label">{label}</span>
    </Link>
  );
}
