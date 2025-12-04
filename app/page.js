import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#b6dfb4] via-[#bde3b8] to-[#c1e4bf]" />
      <div className="absolute inset-x-[-5%] bottom-[-15%] h-[40vh] min-h-[220px] rounded-[50%] bg-[#f6f0e9] blur-[1px]" />

      <div className="relative mx-auto flex min-h-[80vh] max-w-6xl flex-col items-center justify-center gap-8 px-6 pb-20 pt-16 text-center">
        <h1 className="text-4xl font-black leading-tight text-[#0f5a30] sm:text-5xl md:text-6xl">
          Authentic Taste of
          <br />
          Agua Fresca
        </h1>

        <Link
          href="/collections/drinks"
          className="inline-flex items-center gap-2 rounded-full bg-[#0f5a30] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0f5a30]/20 transition hover:-translate-y-0.5 hover:bg-[#0c4d28]"
        >
          Explore
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#0f5a30]">
            <svg viewBox="0 0 16 16" className="h-3 w-3" aria-hidden="true">
              <path
                d="M6 12.5 11 8 6 3.5v9z"
                fill="currentColor"
              />
            </svg>
          </span>
        </Link>

        <div className="relative mt-6 flex w-full max-w-5xl justify-center">
          <HeroImage />
        </div>
      </div>
    </section>
  );
}

function HeroImage() {
  const src = "/hero-drinks.svg"; 

  return (
    <div className="relative w-full max-w-4xl">
      <div className="absolute inset-x-[8%] bottom-[-6%] h-20 rounded-full bg-[#e3dbc5] blur-2xl" />
      <Image
        src={src}
        alt="Assorted Juicy Whip aguas frescas"
        width={1600}
        height={1200}
        priority
        className="relative z-10 h-auto w-full object-contain"
      />
    </div>
  );
}
