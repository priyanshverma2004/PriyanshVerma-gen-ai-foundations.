import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, TEAL } from "@/components/AppShell";
import { RefreshCw, Download, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/meal-plan")({
  head: () => ({ meta: [{ title: "Meal plan — FridgeAI" }] }),
  component: MealPlan,
});

function MealPlan() {
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const [mealPlan, setMealPlan] = useState<any>(null);
  const generatePlan = async () => {

    try {

      setLoading(true);

      const res = await fetch(
        "http://127.0.0.1:8000/meal-plan/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: 1,
            days: 5,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {

        setMealPlan(data.meal_plan);

        toast.success("Meal Plan Generated");

      } else {

        toast.error(data.message);

      }

    } catch (err) {

      toast.error("Server Error");

      console.log(err);

    } finally {

      setLoading(false);

    }

  };
  useEffect(() => {

    generatePlan();

  }, []);
  if (loading && !mealPlan) {

    return (

        <AppShell title="Meal Plan">

            <div className="flex h-[500px] items-center justify-center">

                <Loader2 className="h-12 w-12 animate-spin text-[#1D9E75]" />

            </div>

        </AppShell>

    );

}
  return (
    <AppShell title="5-day meal plan" actions={
      <>
        <button disabled={loading} onClick={generatePlan}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-white" style={{ border: "1px solid #2a2a2a" }}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Regenerate
        </button>
        <button onClick={() => toast.success("Plan exported")}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-white" style={{ backgroundColor: TEAL }}>
          <Download className="h-4 w-4" /> Export
        </button>
      </>
    }>
      <div className="mb-6 flex flex-wrap gap-2">
        {mealPlan?.days?.map((d: any, i: number) => (
          <button key={d.day} onClick={() => { setActive(i); document.getElementById(`day-${i}`)?.scrollIntoView({ behavior: "smooth" }); }}
            className="rounded-full px-4 py-1.5 text-sm"
            style={{
              backgroundColor: active === i ? TEAL : "#1a1a1a",
              color: active === i ? "#fff" : "#d1d5db",
              border: `1px solid ${active === i ? TEAL : "#2a2a2a"}`,
            }}>{d.day.slice(0, 3)}</button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {mealPlan?.days?.map((d: any, i: number) => (
          <div key={d.day} id={`day-${i}`} className="rounded-xl p-6" style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}>
            <div className="mb-4 flex items-center justify-between">
              <div className="font-bold text-white">{d.day}</div>
              <div className="text-xs text-gray-400">{d.meals.length } meals planned</div>
            </div>
            <div className="space-y-3">
              {d.meals?.map((m: any) => (
                <div key={m.type} className="rounded-lg p-3" style={{ backgroundColor: "#0f0f0f" }}>
                  <div className="text-xs font-semibold text-gray-500">{m.type}</div>
                  <Link to="/recipe/$id" params={{ id: "shakshuka" }} className="block text-white hover:underline">{m.name}</Link>
                  <div className="mt-2 flex items-center justify-between">
                    {
                      !m.available && (

                        <div className="mt-3">

                          <div className="text-xs text-red-400">

                            Missing Ingredients

                          </div>

                          <ul className="mt-1 list-disc pl-5 text-xs text-gray-400">

                            {m.missing_items.map((item: string) => (

                              <li key={item}>

                                {item}

                              </li>

                            ))}

                          </ul>

                        </div>

                      )
                    }
                    <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{
                      backgroundColor: m.available ? "rgba(29,158,117,0.2)" : "rgba(239,159,39,0.2)",
                      color: m.available ? TEAL : "#EF9F27",
                    }}>
                      {m.available
                        ? "Ready To Cook"
                        : `Need to Buy (${m.missing_items.length})`}
                    </span>
                    <span className="text-xs text-gray-400">{m.calories} kcal</span>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/recipe/$id" params={{ id: "shakshuka" }} className="mt-4 block text-sm" style={{ color: TEAL }}>
              View all recipes →
            </Link>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
