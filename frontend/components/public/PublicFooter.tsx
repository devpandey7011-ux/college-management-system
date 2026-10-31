
import Link from "next/link";

export default function PublicFooter() {
  return (
    <footer id="contact" className="bg-[#142F22] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.7fr_0.7fr] lg:px-8 lg:py-16">
        <div>
          <Link href="/" className="font-serif text-2xl">
            College Portal
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-7 text-white/65">
            Connecting college information, academic resources and campus
            services through one online platform.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold">Explore</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-white/65">
            <Link href="/about" className="hover:text-white">About</Link>
            <Link href="/academics" className="hover:text-white">Academics</Link>
            <Link href="/admissions" className="hover:text-white">Admissions</Link>
            <Link href="/contact" className="hover:text-white">Contact</Link>
            <Link href="/notices" className="hover:text-white">Notices</Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold">College portal</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-white/65">
            <Link href="/login" className="hover:text-white">Portal login</Link>
            <Link href="/student" className="hover:text-white">Student dashboard</Link>
            <Link href="/teacher" className="hover:text-white">Teacher dashboard</Link>
            <Link href="/admin" className="hover:text-white">Admin dashboard</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>© {new Date().getFullYear()} College Management System</p>
          <p>Learning · Growth · Excellence</p>
        </div>
      </div>
    </footer>
  );
}
