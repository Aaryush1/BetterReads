import Link from "next/link";

const heroBooks = [
  { title: "Tomorrow, and Tomorrow", gradient: "from-[#8B4513] to-[#D2691E]", rotate: "-rotate-[6deg]", position: "top-[30px] left-0", size: "w-[160px] h-[240px]", z: "z-[3]" },
  { title: "All the Light We Cannot See", gradient: "from-[#1a3a4a] to-[#2d6a7a]", rotate: "rotate-[2deg]", position: "top-[10px] left-[120px]", size: "w-[170px] h-[255px]", z: "z-[4]" },
  { title: "Pachinko", gradient: "from-[#2D4A37] to-[#5a8a6a]", rotate: "rotate-[5deg]", position: "top-[60px] left-[250px]", size: "w-[150px] h-[225px]", z: "z-[2]" },
  { title: "The Goldfinch", gradient: "from-[#4a2040] to-[#8a4070]", rotate: "-rotate-[3deg]", position: "top-[200px] left-[50px]", size: "w-[140px] h-[210px]", z: "z-[5]" },
  { title: "Piranesi", gradient: "from-[#3a3020] to-[#6a5a30]", rotate: "rotate-[4deg]", position: "top-[190px] left-[200px]", size: "w-[155px] h-[232px]", z: "z-[1]" },
];

const features = [
  { icon: "\u{1F4DA}", title: "Smart Shelves", desc: "Read, Reading, Want to Read" },
  { icon: "\u{1F50D}", title: "Instant Search", desc: "Millions of books, one search" },
  { icon: "\u2B50", title: "Rate & Discover", desc: "Rate books, get recommendations" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-cream">
      {/* Nav */}
      <nav className="flex items-center justify-between px-4 py-5 sm:px-12">
        <span className="font-display text-xl font-semibold italic tracking-tight text-green-deep">
          BetterReads
        </span>
        <div className="flex items-center gap-2">
          <Link
            href="/discover"
            className="hidden rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-black/[0.03] hover:text-text-primary dark:hover:bg-white/[0.04] sm:inline-flex"
          >
            Discover
          </Link>
          <Link
            href="/login"
            className="rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-black/[0.03] hover:text-text-primary dark:hover:bg-white/[0.04] sm:px-4"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-green-deep px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-medium sm:px-5"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto flex max-w-[1200px] flex-col items-center gap-12 px-6 py-12 sm:px-12 md:gap-16 md:py-16 lg:flex-row lg:gap-20 lg:py-20">
        {/* Text */}
        <div className="max-w-[480px] flex-1 text-center lg:text-left">
          <h1 className="mb-5 font-display text-4xl font-normal leading-[1.1] tracking-tight text-text-primary sm:text-5xl lg:text-[52px]">
            Your reading life,
            <br />
            <em className="text-green-deep">beautifully organized.</em>
          </h1>
          <p className="mx-auto mb-8 max-w-[400px] text-[17px] leading-[1.7] text-text-secondary lg:mx-0">
            Track what you&apos;re reading, curate your shelves, and finally
            leave Goodreads behind. Built for readers who care about the
            experience.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-green-deep px-8 py-3.5 text-[15px] font-semibold text-white shadow-[0_2px_12px_rgba(5,150,105,0.35)] transition-all hover:-translate-y-0.5 hover:bg-green-medium hover:shadow-[0_6px_20px_rgba(5,150,105,0.35)]"
            >
              Start reading &rarr;
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center rounded-full border-[1.5px] border-border px-8 py-3.5 text-[15px] font-semibold text-text-secondary transition-colors hover:border-text-secondary hover:text-text-primary"
            >
              See how it works
            </Link>
          </div>
        </div>

        {/* Book collage */}
        <div className="relative hidden h-[440px] w-[380px] shrink-0 lg:block">
          {heroBooks.map((book) => (
            <div
              key={book.title}
              className={`absolute overflow-hidden rounded-[var(--radius-md)] transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] hover:z-10 hover:-translate-y-2 hover:!rotate-0 ${book.position} ${book.size} ${book.rotate} ${book.z}`}
              style={{ boxShadow: "var(--shadow-book)" }}
            >
              <div
                className={`flex h-full w-full items-end justify-start bg-gradient-to-br p-4 ${book.gradient}`}
              >
                <span className="font-display text-sm font-medium leading-tight text-white/90">
                  {book.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features strip */}
      <section
        id="features"
        className="flex flex-col items-center justify-center gap-8 border-t border-border-light px-6 py-12 sm:flex-row sm:gap-12 sm:px-12"
      >
        {features.map((f) => (
          <div key={f.title} className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-green-light text-lg">
              {f.icon}
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">{f.title}</h3>
              <p className="text-[13px] text-text-tertiary">{f.desc}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
