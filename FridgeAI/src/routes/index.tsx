import { createFileRoute, Link } from "@tanstack/react-router";
import { ChefHat, Camera, Brain, Bell, Star, Check } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FridgeAI — Stop wasting food. Start cooking smarter." },
      { name: "description", content: "FridgeAI scans your fridge, tracks expiry dates, and generates personalised recipes using AI." },
    ],
  }),
  component: Landing,
});

const TEAL = "#1D9E75";

function Landing() {
  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: "#0f0f0f" }}>
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg" style={{ backgroundColor: TEAL }}>
            <ChefHat className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold">FridgeAI</span>
        </Link>
        <nav className="hidden gap-8 text-sm text-gray-300 md:flex">
          <a href="#features" className="hover:text-white">Features</a>
          <a href="#how" className="hover:text-white">How it works</a>
          <a href="#pricing" className="hover:text-white">Pricing</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-gray-300 hover:text-white">Sign in</Link>
          <Link to="/signup" className="rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: TEAL }}>
            Get started free
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h1 className="text-5xl font-bold leading-tight md:text-6xl">
          Stop wasting food.<br />Start cooking smarter.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
          FridgeAI scans your fridge, tracks expiry dates, and generates personalised recipes using AI.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/signup" className="rounded-lg px-6 py-3 font-medium text-white" style={{ backgroundColor: TEAL }}>
            Get started free
          </Link>
          <a href="#features" className="rounded-lg border px-6 py-3 font-medium text-white" style={{ borderColor: "#2a2a2a" }}>
            See how it works
          </a>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { Icon: Camera, title: "Scan your fridge", desc: "Upload a photo and AI identifies every ingredient automatically." },
            { Icon: Brain, title: "AI-powered recipes", desc: "Get personalised meal suggestions based on what you actually have." },
            { Icon: Bell, title: "Expiry alerts", desc: "Never waste food again with smart expiry tracking and proactive alerts." },
          ].map(({ Icon, title, desc }) => (
            <div key={title} className="rounded-xl p-6 transition-colors hover:border-[#1D9E75]" style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}>
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-lg" style={{ backgroundColor: "rgba(29,158,117,0.15)" }}>
                <Icon className="h-6 w-6" style={{ color: TEAL }} />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{title}</h3>
              <p className="text-sm text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold">How it works</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { n: 1, title: "Scan", desc: "Take a photo of your fridge" },
            { n: 2, title: "Discover", desc: "AI suggests meals from your ingredients" },
            { n: 3, title: "Cook", desc: "Follow step-by-step instructions" },
          ].map((s) => (
            <div key={s.n} className="rounded-xl p-6 text-center" style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}>
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full text-lg font-bold text-white" style={{ backgroundColor: TEAL }}>
                {s.n}
              </div>
              <h3 className="mb-2 text-xl font-semibold">{s.title}</h3>
              <p className="text-sm text-gray-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="mb-10 text-center text-3xl font-bold">Loved by home cooks</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { i: "A", name: "Anita R.", q: "Cut my food waste by half in a month. Genuinely impressed." },
            { i: "M", name: "Marcus J.", q: "Recipe suggestions are spot-on. Feels like a personal chef." },
            { i: "S", name: "Sara K.", q: "The expiry alerts alone are worth it. Game changer." },
          ].map((t) => (
            <div key={t.name} className="rounded-xl p-6" style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}>
              <div className="mb-3 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full font-semibold text-white" style={{ backgroundColor: TEAL }}>
                  {t.i}
                </div>
                <div className="font-medium">{t.name}</div>
              </div>
              <div className="mb-2 flex gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
              </div>
              <p className="text-sm text-gray-300">"{t.q}"</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-4xl px-6 py-20">
        <h2 className="mb-10 text-center text-3xl font-bold">Simple pricing</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            { name: "Free", price: "$0", features: ["5 scans / month", "Basic recipes", "Expiry alerts"], cta: "Get started" },
            { name: "Pro", price: "$6/mo", features: ["Unlimited scans", "AI meal plans", "Shopping integrations", "Priority support"], cta: "Start free trial", featured: true },
          ].map((p) => (
            <div key={p.name} className="rounded-xl p-8" style={{ backgroundColor: "#1a1a1a", border: p.featured ? `1px solid ${TEAL}` : "1px solid #2a2a2a" }}>
              <h3 className="text-xl font-semibold">{p.name}</h3>
              <div className="my-4 text-4xl font-bold">{p.price}</div>
              <ul className="mb-6 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <Check className="h-4 w-4" style={{ color: TEAL }} />{f}
                  </li>
                ))}
              </ul>
              <Link to="/signup" className="block rounded-lg px-4 py-2.5 text-center font-medium text-white" style={{ backgroundColor: p.featured ? TEAL : "#2a2a2a" }}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t" style={{ borderColor: "#2a2a2a" }}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-md" style={{ backgroundColor: TEAL }}>
              <ChefHat className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-white">FridgeAI</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Contact</a>
          </div>
          <div>© 2026 FridgeAI</div>
        </div>
      </footer>
    </div>
  );
}
