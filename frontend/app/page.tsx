
import Link from "next/link";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";

const benefits = [
  {
    number: "01",
    title: "Academic Excellence",
    description:
      "Build a strong foundation through structured learning and academic opportunities.",
  },
  {
    number: "02",
    title: "A Connected Campus",
    description:
      "Keep students, teachers and academic information connected in one place.",
  },
  {
    number: "03",
    title: "Student Development",
    description:
      "Support learning, personal growth and preparation for future careers.",
  },
];

const portalLinks = [
  {
    title: "Student Portal",
    description: "Access results, courses and assignments.",
    href: "/login?role=student",
    label: "Student access",
  },
  {
    title: "Teacher Portal",
    description: "Manage academic work and student performance.",
    href: "/login?role=teacher",
    label: "Faculty access",
  },
  {
    title: "Administration",
    description: "Manage college records and academic operations.",
    href: "/login?role=admin",
    label: "Admin access",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F7F5EE] text-[#20382C]">
      {/* Navigation */}
      <PublicHeader />

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-[#173A29]">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=2200&q=85')",
          }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#102D20]/95 via-[#173A29]/80 to-[#173A29]/30" />

        <div className="mx-auto grid min-h-[570px] max-w-7xl items-center px-5 py-20 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-28">
          <div className="max-w-3xl text-white">
            <div className="mb-7 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#D7C99F]">
              <span className="h-px w-10 bg-[#D7C99F]" />
              Welcome to our institution
            </div>

            <h1 className="max-w-3xl font-serif text-5xl leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
              Where ambition
              <span className="block italic text-[#DCCDA5]">
                finds its future.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-white/80 sm:text-lg">
              Discover an environment built around learning, opportunity and
              personal growth. Take the next step in your academic journey.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/#academics"
                className="rounded-full bg-[#E8DAB6] px-7 py-4 text-sm font-bold text-[#203B2B] transition hover:bg-white"
              >
                Explore our college <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/notices"
                className="rounded-full border border-white/50 px-7 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Latest notices
              </Link>
            </div>
          </div>

          <div className="mt-14 flex justify-start lg:mt-0 lg:justify-end">
            <div className="max-w-xs border-l border-[#DCCDA5]/70 py-3 pl-6 text-white">
              <p className="font-serif text-2xl italic leading-relaxed text-[#E8DAB6]">
                Education opens doors.
              </p>
              <p className="mt-3 text-sm leading-6 text-white/75">
                A shared commitment to knowledge, achievement and a stronger
                tomorrow.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/15 bg-[#102D20]/70">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5 text-xs font-medium uppercase tracking-[0.16em] text-white/75 lg:px-8">
            <span>Learn with purpose</span>
            <span>Grow with confidence</span>
            <span>Prepare for tomorrow</span>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section id="about" className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-8 lg:py-28">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8A7547]">
            A place to belong
          </p>
          <h2 className="mt-4 max-w-md font-serif text-4xl leading-tight text-[#214D38] sm:text-5xl">
            More than a place to study.
          </h2>
        </div>

        <div className="max-w-2xl">
          <p className="text-lg leading-8 text-[#5E6C61]">
            Education is about developing knowledge, discovering strengths and
            preparing for new possibilities. Our college portal brings essential
            academic resources and college information together in one place.
          </p>
          <Link
            href="/#academics"
            className="mt-7 inline-flex items-center gap-3 border-b border-[#214D38]/40 pb-2 text-sm font-bold text-[#214D38] transition hover:border-[#214D38]"
          >
            Discover what we offer <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* Academic benefits */}
      <section id="academics" className="border-y border-[#214D38]/10 bg-[#EFEEE5]">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8A7547]">
                The college experience
              </p>
              <h2 className="mt-4 font-serif text-4xl text-[#214D38] sm:text-5xl">
                Built around your growth.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-[#667267]">
              A thoughtful approach to learning, student support and academic
              administration.
            </p>
          </div>

          <div className="mt-12 grid gap-0 md:grid-cols-3">
            {benefits.map((benefit, index) => (
              <article
                key={benefit.number}
                className={`border-t border-[#214D38]/20 py-8 md:px-7 ${
                  index === 0 ? "md:pl-0" : ""
                } ${index === 2 ? "md:pr-0" : ""} ${
                  index > 0 ? "md:border-l md:border-t" : ""
                }`}
              >
                <span className="font-serif text-3xl italic text-[#A18B5C]">
                  {benefit.number}
                </span>
                <h3 className="mt-6 text-xl font-bold text-[#214D38]">
                  {benefit.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#667267]">
                  {benefit.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Admissions information */}
      <section id="admissions" className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-2 lg:items-center lg:gap-20 lg:px-8 lg:py-24">
        <div className="relative overflow-hidden rounded-2xl bg-[#214D38] p-8 text-white sm:p-12">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full border border-white/15" />
          <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full border border-white/15" />

          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#DCCDA5]">
            Start your journey
          </p>
          <h2 className="relative mt-5 max-w-md font-serif text-4xl leading-tight sm:text-5xl">
            Your next chapter starts here.
          </h2>
          <p className="relative mt-5 max-w-md text-sm leading-7 text-white/75">
            Explore college information and available academic resources to
            understand your next steps.
          </p>
          <Link
            href="/login"
            className="relative mt-8 inline-flex rounded-full bg-[#E8DAB6] px-6 py-3.5 text-sm font-bold text-[#203B2B] transition hover:bg-white"
          >
            Access the college portal →
          </Link>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8A7547]">
            Stay connected
          </p>
          <h2 className="mt-4 font-serif text-4xl leading-tight text-[#214D38] sm:text-5xl">
            Important information, all in one place.
          </h2>
          <p className="mt-5 text-base leading-8 text-[#5E6C61]">
            Visit the notices page for announcements available to you. Students
            and teachers can sign in to access notices according to their
            account permissions.
          </p>
          <Link
            href="/notices"
            className="mt-7 inline-flex items-center gap-3 border-b border-[#214D38]/40 pb-2 text-sm font-bold text-[#214D38] hover:border-[#214D38]"
          >
            Visit notices <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* Portal access */}
      <section className="bg-[#E5E6DA]">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8A7547]">
              Your college, connected
            </p>
            <h2 className="mt-4 font-serif text-4xl text-[#214D38] sm:text-5xl">
              The right access for your role.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#667267]">
              Sign in to access the tools and information available to your
              account.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {portalLinks.map((portal) => (
              <article
                key={portal.title}
                className="flex flex-col rounded-2xl border border-[#214D38]/10 bg-[#F9F8F2] p-7 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8A7547]">
                  {portal.label}
                </p>
                <h3 className="mt-5 text-xl font-bold text-[#214D38]">
                  {portal.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-7 text-[#667267]">
                  {portal.description}
                </p>
                <Link
                  href={portal.href}
                  className="mt-7 inline-flex items-center justify-between border-t border-[#214D38]/15 pt-5 text-sm font-bold text-[#214D38]"
                >
                  Sign in <span aria-hidden="true">↗</span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
     <PublicFooter />
    </main>
  );
}
