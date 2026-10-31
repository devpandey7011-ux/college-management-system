
import type { Metadata } from "next";
import Link from "next/link";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Discover the vision, mission and values behind College Portal, a connected academic community.",
};

const values = [
  {
    number: "01",
    title: "Academic Excellence",
    description:
      "Encourage curiosity, structured learning and a commitment to continuous improvement.",
  },
  {
    number: "02",
    title: "Community",
    description:
      "Create a connected environment where students, teachers and staff can work together.",
  },
  {
    number: "03",
    title: "Personal Growth",
    description:
      "Support confidence, responsibility and the development of skills for the future.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#F7F5EE] text-[#20382C]">
      <PublicHeader />

      <section className="relative isolate overflow-hidden bg-[#173A29]">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=2200&q=85')",
          }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#102D20]/95 via-[#173A29]/85 to-[#173A29]/55" />

        <div className="mx-auto max-w-7xl px-5 py-24 sm:py-32 lg:px-8">
          <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.25em] text-[#DCCDA5]">
            <span className="h-px w-10 bg-[#DCCDA5]" />
            Get to know us
          </p>

          <h1 className="mt-7 max-w-3xl font-serif text-5xl leading-tight text-white sm:text-6xl lg:text-7xl">
            Education with
            <span className="block italic text-[#DCCDA5]">
              purpose and possibility.
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">
            College Portal represents a learning community built around
            knowledge, collaboration and personal development. Our goal is to
            bring essential academic information and college services together
            in one accessible digital space.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/login"
              className="rounded-full bg-[#E8DAB6] px-7 py-4 text-sm font-bold text-[#203B2B] transition hover:bg-white"
            >
              Access the portal →
            </Link>
            <Link
              href="/notices"
              className="rounded-full border border-white/40 px-7 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Explore notices
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-8 lg:py-28">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8A7547]">
            Who we are
          </p>
          <h2 className="mt-4 max-w-md font-serif text-4xl leading-tight text-[#214D38] sm:text-5xl">
            A connected community of learners.
          </h2>
        </div>

        <div className="max-w-2xl">
          <p className="text-base leading-8 text-[#5E6C61] sm:text-lg">
            Learning is more than attending classes. It is about asking
            questions, sharing ideas, developing practical skills and preparing
            for new opportunities. College Portal brings together information
            and tools that support these everyday academic experiences.
          </p>
          <p className="mt-5 text-base leading-8 text-[#5E6C61]">
            The platform is designed around different college roles. Students
            can access their academic information, teachers can manage
            academic work, and administrators can maintain important records
            through role-appropriate portal access.
          </p>
        </div>
      </section>

      <section className="border-y border-[#214D38]/10 bg-[#EFEEE5]">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8A7547]">
              What guides us
            </p>
            <h2 className="mt-4 font-serif text-4xl text-[#214D38] sm:text-5xl">
              Our mission and values.
            </h2>
            <p className="mt-5 text-sm leading-7 text-[#667267]">
              We aim to make academic information easier to access while
              encouraging a culture of learning, collaboration and growth.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {values.map((value) => (
              <article
                key={value.number}
                className="border-t border-[#214D38]/20 pt-7"
              >
                <span className="font-serif text-3xl italic text-[#A18B5C]">
                  {value.number}
                </span>
                <h3 className="mt-5 text-xl font-bold text-[#214D38]">
                  {value.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#667267]">
                  {value.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-2 lg:items-center lg:gap-20 lg:px-8 lg:py-24">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8A7547]">
            Designed for the college community
          </p>
          <h2 className="mt-4 font-serif text-4xl leading-tight text-[#214D38] sm:text-5xl">
            The right information for every role.
          </h2>
          <p className="mt-5 text-base leading-8 text-[#5E6C61]">
            A single platform can make academic processes easier to navigate.
            College Portal brings student information, teaching activities
            and administrative tools into one role-based experience.
          </p>
        </div>

        <div className="rounded-2xl bg-[#214D38] p-8 text-white sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#DCCDA5]">
            Continue exploring
          </p>
          <h3 className="mt-5 font-serif text-3xl leading-tight sm:text-4xl">
            Stay informed. Stay connected.
          </h3>
          <p className="mt-4 text-sm leading-7 text-white/75">
            Explore public announcements or sign in to access the features
            available to your account.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/notices"
              className="rounded-full border border-white/40 px-5 py-3 text-sm font-semibold transition hover:bg-white/10"
            >
              View notices
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-[#E8DAB6] px-5 py-3 text-sm font-bold text-[#203B2B] transition hover:bg-white"
            >
              Portal login →
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
