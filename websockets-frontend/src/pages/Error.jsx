import { Link, useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-zinc-100">
      <section className="max-w-lg rounded-md border border-zinc-800 bg-zinc-900 p-6">
        <p className="text-sm font-medium uppercase tracking-normal text-rose-300">
          Route error
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Something went wrong</h1>
        <p className="mt-3 text-zinc-400">
          {error?.statusText || error?.message || "The requested page failed."}
        </p>
        <Link
          className="mt-5 inline-flex rounded-md border border-cyan-400/40 px-3 py-2 text-sm font-medium text-cyan-100"
          to="/dashboard"
        >
          Back to dashboard
        </Link>
      </section>
    </main>
  );
}
