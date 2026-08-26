import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, Bell, Clock, AlarmClock } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Get started — FridgeAI" }] }),
  component: Onboarding,
});

const TEAL = "#1D9E75";
const DIETS = ["Vegetarian", "Vegan", "Gluten-free", "Dairy-free", "Keto", "Paleo", "Halal", "No preference"];

function Onboarding() {
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [diets, setDiets] = useState<string[]>([]);
  const [people, setPeople] = useState(2);
  const [alert, setAlert] = useState(2);

  const toggle = (d: string) =>
    setDiets((p) => (p.includes(d) ? p.filter((x) => x !== d) : [...p, d]));

  return (
    <div className="min-h-screen px-4 py-8" style={{ backgroundColor: "#0f0f0f" }}>
      <div className="mx-auto max-w-[560px]">
        <div className="mb-6 flex items-center justify-between">
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} className="text-sm text-gray-400 hover:text-white">← Back</button>
          ) : <div />}
          <Link to="/dashboard" className="text-sm text-gray-400 hover:text-white">Skip setup</Link>
        </div>
        <div className="mb-8">
          <div className="mb-2 flex justify-end text-xs text-gray-400">Step {step} of 3</div>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: s <= step ? TEAL : "#2a2a2a" }} />
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-8" style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}>
          {step === 1 && (
            <>
              <h2 className="text-center text-2xl font-bold text-white">What are your dietary preferences?</h2>
              <p className="mt-2 text-center text-sm text-gray-400">We'll personalise recipes to match your lifestyle</p>
              <div className="mt-6 grid grid-cols-3 gap-2">
                {DIETS.map((d) => {
                  const on = diets.includes(d);
                  return (
                    <button key={d} onClick={() => toggle(d)}
                      className="rounded-full px-3 py-2 text-sm transition-colors"
                      style={{
                        backgroundColor: on ? TEAL : "transparent",
                        color: on ? "#fff" : "#d1d5db",
                        border: `1px solid ${on ? TEAL : "#2a2a2a"}`,
                      }}>
                      {d}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => setStep(2)} className="mt-8 w-full rounded-lg py-2.5 font-medium text-white" style={{ backgroundColor: TEAL }}>
                Continue
              </button>
            </>
          )}
          {step === 2 && (
            <>
              <h2 className="text-center text-2xl font-bold text-white">How many people do you usually cook for?</h2>
              <div className="mt-8 flex items-center justify-center gap-6">
                <button onClick={() => setPeople(Math.max(1, people - 1))} className="grid h-12 w-12 place-items-center rounded-full" style={{ backgroundColor: "#2a2a2a" }}>
                  <Minus className="h-5 w-5 text-white" />
                </button>
                <div className="text-6xl font-bold text-white">{people}</div>
                <button onClick={() => setPeople(Math.min(8, people + 1))} className="grid h-12 w-12 place-items-center rounded-full" style={{ backgroundColor: "#2a2a2a" }}>
                  <Plus className="h-5 w-5 text-white" />
                </button>
              </div>
              <input type="range" min={1} max={8} value={people} onChange={(e) => setPeople(+e.target.value)}
                className="mt-6 w-full accent-[#1D9E75]" />
              <button onClick={() => setStep(3)} className="mt-8 w-full rounded-lg py-2.5 font-medium text-white" style={{ backgroundColor: TEAL }}>
                Continue
              </button>
            </>
          )}
          {step === 3 && (
            <>
              <h2 className="text-center text-2xl font-bold text-white">When should we alert you about expiring items?</h2>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { d: 1, Icon: AlarmClock, title: "1 day before", desc: "Last-minute" },
                  { d: 2, Icon: Clock, title: "2 days before", desc: "Recommended" },
                  { d: 3, Icon: Bell, title: "3 days before", desc: "Plan ahead" },
                ].map(({ d, Icon, title, desc }) => {
                  const on = alert === d;
                  return (
                    <button key={d} onClick={() => setAlert(d)}
                      className="rounded-xl p-4 text-left"
                      style={{
                        backgroundColor: "#0f0f0f",
                        border: `1px solid ${on ? TEAL : "#2a2a2a"}`,
                      }}>
                      <div className="mb-2 flex items-center justify-between">
                        <Icon className="h-5 w-5" style={{ color: TEAL }} />
                        {on && <div className="h-2 w-2 rounded-full" style={{ backgroundColor: TEAL }} />}
                      </div>
                      <div className="text-sm font-semibold text-white">{title}</div>
                      <div className="text-xs text-gray-400">{desc}</div>
                    </button>
                  );
                })}
              </div>
              <button onClick={() => nav({ to: "/dashboard" })} className="mt-8 w-full rounded-lg py-2.5 font-medium text-white" style={{ backgroundColor: TEAL }}>
                Get started
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
