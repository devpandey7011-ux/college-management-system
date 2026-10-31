
import Link from "next/link";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";

export default function ContactPage() {
  return (
    <>
      <PublicHeader />

      <main className="min-h-screen bg-[#F7F5EE] text-[#173A29]">
        <section className="px-6 py-20 md:px-12 md:py-28">
          <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:items-start">
            <div>
              <p className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-[#8A7547]">
                Contact
              </p>

              <h1 className="font-serif text-4xl leading-tight md:text-6xl">
                Let’s get you to the right place.
              </h1>

              <p className="mt-6 max-w-xl leading-8 text-[#5E6D62]">
                Whether you are looking for college announcements or need
                access to your academic dashboard, start with the appropriate
                section of the portal.
              </p>
            </div>

            <div className="space-y-5">
              <article className="rounded-3xl border border-[#E1E1D6] bg-white/70 p-7">
                <h2 className="font-serif text-2xl">College notices</h2>
                <p className="mt-3 leading-7 text-[#5E6D62]">
                  Check published announcements and updates.
                </p>
                <Link
                  href="/notices"
                  className="mt-5 inline-flex font-semibold text-[#214D38] underline underline-offset-4"
                >
                  View notices
                </Link>
              </article>

              <article className="rounded-3xl border border-[#E1E1D6] bg-white/70 p-7">
                <h2 className="font-serif text-2xl">Portal assistance</h2>
                <p className="mt-3 leading-7 text-[#5E6D62]">
                  Sign in to access the dashboard available for your account
                  role.
                </p>
                <Link
                  href="/login"
                  className="mt-5 inline-flex font-semibold text-[#214D38] underline underline-offset-4"
                >
                  Go to login
                </Link>
              </article>

              <p className="rounded-2xl border border-[#D8DCCF] bg-[#E5E6DA] p-5 text-sm leading-6 text-[#526257]">
                Official email, telephone, and campus address details have
                not been configured yet. Add verified institutional contact
                information before publishing this page for real users.
              </p>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}
