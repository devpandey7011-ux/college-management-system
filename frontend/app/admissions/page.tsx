
import Link from "next/link";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";

const steps = [
  {
    number: "01",
    title: "Explore",
    description:
      "Review the academic information and notices published by your institution.",
  },
  {
    number: "02",
    title: "Check Requirements",
    description:
      "Confirm eligibility, fees, deadlines, and required documents with the institution.",
  },
  {
    number: "03",
    title: "Follow Official Guidance",
    description:
      "Use the institution's official admission process for applications and document submission.",
  },
];

export default function AdmissionsPage() {
  return (
    <>
      <PublicHeader />

      <main className="min-h-screen bg-[#F7F5EE] text-[#173A29]">
        <section className="px-6 pb-16 pt-20 md:px-12 md:pb-24 md:pt-28">
          <div className="mx-auto max-w-6xl">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-[#8A7547]">
              Admissions
            </p>

            <h1 className="max-w-4xl font-serif text-4xl leading-tight md:text-6xl">
              Take the next step in your educational journey.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-[#5E6D62] md:text-lg">
              Find your way through the admission process with clear
              information and a focus on the steps that matter.
            </p>
          </div>
        </section>

        <section className="px-6 pb-16 md:px-12 md:pb-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-serif text-3xl md:text-4xl">
              Your admission journey
            </h2>

            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {steps.map((step) => (
                <article
                  key={step.number}
                  className="rounded-3xl border border-[#E1E1D6] bg-white/70 p-7"
                >
                  <p className="text-sm font-semibold text-[#8A7547]">
                    STEP {step.number}
                  </p>
                  <h3 className="mt-5 font-serif text-2xl">
                    {step.title}
                  </h3>
                  <p className="mt-4 leading-7 text-[#5E6D62]">
                    {step.description}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-8 rounded-3xl border border-[#D8DCCF] bg-[#E5E6DA] p-7 md:p-9">
              <h3 className="font-serif text-2xl">
                Important information
              </h3>
              <p className="mt-3 max-w-3xl leading-7 text-[#526257]">
                This is a college portal project. Official course lists,
                eligibility criteria, application dates, fees, and admission
                contacts have not yet been configured. Please confirm these
                details with the relevant institution before making decisions.
              </p>

              <Link
                href="/notices"
                className="mt-6 inline-flex rounded-full bg-[#214D38] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#173A29]"
              >
                Browse Notices
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}
