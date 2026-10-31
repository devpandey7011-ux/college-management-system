
import Link from "next/link";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";

const features = [
  {
    number: "01",
    title: "Learning Resources",
    description:
      "Keep academic information and learning activities organised in one accessible place.",
  },
  {
    number: "02",
    title: "Results & Progress",
    description:
      "Students can access their academic results through the college portal after signing in.",
  },
  {
    number: "03",
    title: "Assignments",
    description:
      "Keep track of assigned work, submissions, and academic tasks through the portal.",
  },
  {
    number: "04",
    title: "Faculty Support",
    description:
      "Teachers can use dedicated tools to manage academic activities and student results.",
  },
];

export default function AcademicsPage() {
  return (
    <>
      <PublicHeader />

      <main className="min-h-screen bg-[#F7F5EE] text-[#173A29]">
        <section className="px-6 pb-16 pt-20 md:px-12 md:pb-24 md:pt-28">
          <div className="mx-auto max-w-6xl">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-[#8A7547]">
              Academics
            </p>

            <h1 className="max-w-4xl font-serif text-4xl leading-tight md:text-6xl">
              A more connected approach to academic life.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-[#5E6D62] md:text-lg">
              Explore the academic tools designed to help students and
              teachers manage learning, assignments, and results in one
              organised digital environment.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/login"
                className="rounded-full bg-[#214D38] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#173A29]"
              >
                Access College Portal
              </Link>

              <Link
                href="/notices"
                className="rounded-full border border-[#C9CEC1] px-7 py-3.5 text-sm font-semibold transition hover:bg-[#E5E6DA]"
              >
                View Notices
              </Link>
            </div>
          </div>
        </section>

        <section className="px-6 pb-20 md:px-12 md:pb-28">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8A7547]">
                The academic experience
              </p>
              <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                Everything organised around learning.
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {features.map((feature) => (
                <article
                  key={feature.number}
                  className="rounded-3xl border border-[#E1E1D6] bg-white/70 p-7 md:p-9"
                >
                  <p className="text-sm font-semibold text-[#8A7547]">
                    {feature.number}
                  </p>
                  <h3 className="mt-5 font-serif text-2xl">
                    {feature.title}
                  </h3>
                  <p className="mt-4 leading-7 text-[#5E6D62]">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}
