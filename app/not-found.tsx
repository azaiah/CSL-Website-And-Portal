import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-navy-deep px-6 text-center">
      <Logo knockout href="/" size={52} />
      <p className="mt-10 text-6xl font-bold text-gold">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-white">
        We couldn&apos;t find that page
      </h1>
      <p className="mt-3 max-w-md text-white/70">
        The page you&apos;re looking for may have moved. Let&apos;s get you back
        on route.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="btn-gold">
          Back to home
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
        <Link href="/contact" className="btn-outline">
          Request a Pickup
        </Link>
      </div>
    </main>
  );
}
