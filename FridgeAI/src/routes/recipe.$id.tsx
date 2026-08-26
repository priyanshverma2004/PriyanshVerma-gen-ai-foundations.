import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, TEAL } from "@/components/AppShell";
import { Modal } from "./inventory";
import { Clock, Users, Flame, Heart, Share2, Check, Play, X, Minus, Plus, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/recipe/$id")({
  head: () => ({ meta: [{ title: "Recipe — FridgeAI" }] }),
  component: Recipe,
});

const STEPS = [
  "Heat oil in pan, sauté diced tomatoes with cumin and paprika for 5 mins",
  "Add spinach, stir until wilted (2 mins)",
  "Make wells, crack in 3 eggs, cover and cook on low until set (5 mins)",
  "Season with salt and pepper, serve warm with crusty bread",
];

function Recipe() {
  const [fav, setFav] = useState(false);
  const [servings, setServings] = useState(2);
  const [video, setVideo] = useState(false);
  const [cooking, setCooking] = useState(false);
  const [buy, setBuy] = useState<Record<string, boolean>>({ Cumin: false, Paprika: false });

  return (
    <AppShell title="Recipe">
      <nav className="mb-4 flex items-center gap-2 text-sm text-gray-400">
        <Link to="/chat" className="hover:text-white">Chat</Link>
        <span>›</span>
        <span className="hover:text-white">Recipes</span>
        <span>›</span>
        <span className="text-white">Shakshuka</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[55%_45%]">
        <div>
          <div className="grid h-[400px] place-items-center rounded-xl" style={{ backgroundColor: "#EAF3DE" }}>
            <div className="text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white/40">📷</div>
              <div className="mt-2 text-sm text-gray-700">AI-generated dish image</div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {["Vegetarian", "Quick", "20 min"].map((t) => (
              <span key={t} className="rounded-full px-3 py-1 text-xs font-medium" style={{ backgroundColor: "#1a1a1a", color: "#d1d5db", border: "1px solid #2a2a2a" }}>{t}</span>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            {[["320", "kcal"], ["18g", "protein"], ["12g", "carbs"], ["22g", "fat"]].map(([v, l]) => (
              <div key={l} className="rounded-lg p-3 text-center" style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}>
                <div className="font-bold text-white">{v}</div>
                <div className="text-xs text-gray-400">{l}</div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Ingredients</h2>
              <div className="flex items-center gap-2 rounded-lg p-1" style={{ border: "1px solid #2a2a2a" }}>
                <button onClick={() => setServings(Math.max(1, servings - 1))}><Minus className="h-4 w-4 text-gray-300" /></button>
                <span className="px-2 text-sm text-white">{servings} servings</span>
                <button onClick={() => setServings(servings + 1)}><Plus className="h-4 w-4 text-gray-300" /></button>
              </div>
            </div>
            <ul className="space-y-2 rounded-xl p-4" style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}>
              {[
                { name: `${4 * servings / 2} tomatoes`, have: true },
                { name: `${3 * servings / 2} eggs`, have: true },
                { name: `${100 * servings / 2}g spinach`, have: true },
                { name: "1 tsp cumin", have: false },
                { name: "1 tsp paprika", have: false },
              ].map((i) => (
                <li key={i.name} className="flex items-center gap-2 text-sm">
                  {i.have
                    ? <Check className="h-4 w-4" style={{ color: TEAL }} />
                    : <span className="h-4 w-4" />}
                  <span style={{ color: i.have ? "#fff" : "#6b7280", textDecoration: i.have ? "none" : "line-through" }}>{i.name}</span>
                </li>
              ))}
            </ul>
            <button onClick={() => toast.success("Added to shopping list")}
              className="mt-3 rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: TEAL }}>
              Add missing to shopping list
            </button>
          </div>

          <button onClick={() => setVideo(true)} className="mt-6 flex w-full items-center gap-3 rounded-xl p-4 text-left"
            style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-red-600">
              <Play className="h-4 w-4 text-white" fill="white" />
            </div>
            <div>
              <div className="font-semibold text-white">Watch tutorial on YouTube</div>
              <div className="text-xs text-gray-400">Shakshuka · 8 min video</div>
            </div>
          </button>
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <h1 className="text-[26px] font-bold text-white">Shakshuka with spinach</h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> 20 min</span>
            <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {servings} servings</span>
            <span className="flex items-center gap-1"><Flame className="h-4 w-4" /> Medium spice</span>
            <button onClick={() => setFav(!fav)}>
              <Heart className="h-5 w-5" style={{ color: fav ? "#ef4444" : "#9ca3af", fill: fav ? "#ef4444" : "none" }} />
            </button>
            <button onClick={() => toast("Link copied to clipboard")}>
              <Share2 className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          <h3 className="mt-6 mb-3 text-lg font-semibold text-white">Preparation steps</h3>
          <ol className="space-y-2">
            {STEPS.map((s, i) => (
              <li key={i} className="flex gap-3 rounded-lg p-3 transition-colors hover:bg-[rgba(29,158,117,0.08)]">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: TEAL }}>{i + 1}</div>
                <p className="pt-1 text-sm text-gray-200">{s}</p>
              </li>
            ))}
          </ol>

          <div className="mt-6 rounded-xl p-4" style={{ backgroundColor: "#2a1f0a", border: "1px solid #EF9F27" }}>
            <h4 className="mb-3 flex items-center gap-2 font-semibold text-white">🛒 Items to buy</h4>
            <div className="space-y-2">
              {Object.keys(buy).map((k) => (
                <label key={k} className="flex items-center gap-2 text-sm text-gray-200">
                  <input type="checkbox" checked={buy[k]} onChange={() => setBuy({ ...buy, [k]: !buy[k] })} className="accent-[#1D9E75]" />
                  <span style={{ textDecoration: buy[k] ? "line-through" : "none" }}>{k}</span>
                </label>
              ))}
            </div>
            <button onClick={() => toast.success("Added to shopping list")} className="mt-3 rounded-lg px-3 py-1.5 text-xs font-medium text-white" style={{ backgroundColor: "#EF9F27" }}>
              Add all to shopping list
            </button>
          </div>

          <button onClick={() => setCooking(true)}
            className="mt-6 w-full rounded-lg py-3 text-base font-medium text-white" style={{ backgroundColor: TEAL }}>
            Start cooking
          </button>
        </div>
      </div>

      {video && (
        <Modal title="Tutorial video" onClose={() => setVideo(false)}>
          <div className="grid aspect-video place-items-center rounded-lg bg-black">
            <Play className="h-12 w-12 text-white" fill="white" />
          </div>
        </Modal>
      )}

      {cooking && <CookingMode onClose={() => setCooking(false)} />}
    </AppShell>
  );
}

function CookingMode({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [secs, setSecs] = useState(300);
  const [running, setRunning] = useState(false);
  const [rating, setRating] = useState(0);
  const done = step >= STEPS.length;

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [running]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col p-8" style={{ backgroundColor: "rgba(0,0,0,0.95)" }}>
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold text-white">Shakshuka with spinach</div>
        <button onClick={onClose} className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-white" style={{ border: "1px solid #2a2a2a" }}>
          <X className="h-4 w-4" /> Exit cooking mode
        </button>
      </div>
      <div className="mt-6 flex justify-center gap-2">
        {STEPS.map((_, i) => (
          <div key={i} className="h-2 w-12 rounded-full" style={{ backgroundColor: i <= step ? TEAL : "#2a2a2a" }} />
        ))}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        {done ? (
          <div>
            <div className="text-5xl">🎉</div>
            <div className="mt-4 text-2xl font-bold text-white">Cooking complete!</div>
            <div className="mt-2 text-sm text-gray-400">Rate this recipe</div>
            <div className="mt-3 flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRating(n)}>
                  <Star className="h-8 w-8" style={{ color: n <= rating ? "#facc15" : "#374151", fill: n <= rating ? "#facc15" : "none" }} />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="text-sm text-gray-400">Step {step + 1} of {STEPS.length}</div>
            <p className="mt-3 max-w-2xl text-2xl text-white">{STEPS[step]}</p>
            <div className="mt-10">
              <div className="text-6xl font-mono font-bold text-white">
                {String(Math.floor(secs / 60)).padStart(2, "0")}:{String(secs % 60).padStart(2, "0")}
              </div>
              <div className="mt-4 flex justify-center gap-2">
                <button onClick={() => setRunning(true)} className="rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: TEAL }}>Start</button>
                <button onClick={() => setRunning(false)} className="rounded-lg px-4 py-2 text-sm text-white" style={{ border: "1px solid #2a2a2a" }}>Pause</button>
                <button onClick={() => { setSecs(300); setRunning(false); }} className="rounded-lg px-4 py-2 text-sm text-white" style={{ border: "1px solid #2a2a2a" }}>Reset</button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button disabled={step === 0} onClick={() => setStep(step - 1)}
          className="rounded-lg px-4 py-2 text-sm text-white disabled:opacity-30" style={{ border: "1px solid #2a2a2a" }}>
          Previous step
        </button>
        <button onClick={() => setStep(step + 1)} disabled={done}
          className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-30" style={{ backgroundColor: TEAL }}>
          Next step
        </button>
      </div>
    </div>
  );
}
