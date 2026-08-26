import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell, TEAL } from "@/components/AppShell";
import { Modal } from "./inventory";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getUser } from "@/utils/auth";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — FridgeAI" }] }),
  component: Settings,
});

const SECTIONS = ["Profile", "Preferences", "Account", "App"];

function Settings() {
  const nav = useNavigate();
  const user = getUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [dietType, setDietType] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [spiceLevel, setSpiceLevel] = useState("");
  const [servings, setServings] = useState(2);
  const [allergy, setAllergy] = useState("");
  const [healthGoal, setHealthGoal] = useState("");
  const [favoriteFoods, setFavoriteFoods] = useState("");
  const [avoidFoods, setAvoidFoods] = useState("");
  const [cookingStyle, setCookingStyle] = useState("");
  const [mealTime, setMealTime] = useState("");
  const [budget, setBudget] = useState("");
  const [section, setSection] = useState("Profile");
  const [alertDays, setAlertDays] = useState(2);
  const [modal, setModal] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const loadProfile = async () => {

    try {

      const res = await fetch(
        `http://127.0.0.1:8000/profile/${user.id}`
      );

      const data = await res.json();

      setName(data.name || "");

      setEmail(data.email || "");

      setPhone(data.phone || "");

      setBio(data.bio || "");
      setDietType(data.diet_type || "");
      setCuisine(data.cuisine || "");
      setSpiceLevel(data.spice_level || "");
      setServings(data.servings || 2);
      setAllergy(data.allergy || "");
      setHealthGoal(data.health_goal || "");
      setFavoriteFoods(data.favorite_foods || "");

      setAvoidFoods(data.avoid_foods || "");

      setCookingStyle(data.cooking_style || "");

      setMealTime(data.meal_time || "");

      setBudget(data.budget || "");

    } catch (err) {

      console.log(err);

    }

  };

  useEffect(() => {

    loadProfile();

  }, []);
  const saveProfile = async () => {

    try {

      const res = await fetch(

        `http://127.0.0.1:8000/profile/${user.id}`,

        {

          method: "PUT",

          headers: {

            "Content-Type": "application/json",

          },

          body: JSON.stringify({

            name,

            phone,

            bio,

            diet_type: dietType,

            cuisine,

            spice_level: spiceLevel,

            servings,

            allergy,

            health_goal:healthGoal,

            favorite_foods: favoriteFoods,

            avoid_foods: avoidFoods,

            cooking_style: cookingStyle,

            meal_time: mealTime,

            budget

          }),

        }

      );

      const data = await res.json();

      if (!res.ok) {

        toast.error(data.detail || "Failed to update profile");

        return;

      }

      const updatedUser = {

        ...user,

        name: name,

        email: email,

      };

      localStorage.setItem(

        "user",

        JSON.stringify(updatedUser)

      );

      toast.success("Profile Updated Successfully");

      loadProfile();

    } catch (err) {

      console.log(err);

      toast.error("Server Error");

    }

  };
  return (
    <AppShell title="Settings">
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-xl p-3 lg:sticky lg:top-6 lg:self-start" style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}>
          {SECTIONS.map((s) => (
            <button key={s} onClick={() => setSection(s)}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm"
              style={{ backgroundColor: section === s ? "rgba(29,158,117,0.15)" : "transparent", color: section === s ? TEAL : "#d1d5db" }}>
              {s}
            </button>
          ))}
        </aside>

        <div className="space-y-6">
          {section === "Profile" && (
            <Card title="Profile">
              <div className="mb-6 flex flex-col items-center">
                <div className="grid h-20 w-20 place-items-center rounded-full text-2xl font-bold text-white" style={{ backgroundColor: TEAL }}>{user?.name?.charAt(0).toUpperCase()}</div>
                <label className="mt-2 cursor-pointer text-sm" style={{ color: TEAL }}>
                  Change photo<input type="file" className="hidden" />
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Name"
                  value={name}
                  onChange={(e: any) => setName(e.target.value)}
                />
                <Input
                  label="Email"
                  value={email}
                  disabled
                />
                <Input
                  label="Phone"
                  value={phone}
                  onChange={(e: any) => setPhone(e.target.value)}
                />
              </div>
              <div className="mt-3">
                <label className="mb-1 block text-xs text-gray-400">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2"
                  style={{
                    backgroundColor: "#0f0f0f",
                    border: "1px solid #2a2a2a"
                  }}
                />
              </div>
              <button onClick={async () => {

                try {

                  const res = await fetch(

                    `http://127.0.0.1:8000/profile/${user.id}`,

                    {

                      method: "PUT",

                      headers: {

                        "Content-Type": "application/json"

                      },

                      body: JSON.stringify({

                        name,

                        phone,

                        bio,
                        diet_type: dietType,

                        cuisine: cuisine,

                        spice_level: spiceLevel,

                        servings: servings,

                        allergy: allergy,

                        health_goal: healthGoal


                      })

                    }

                  );
                  const data = await res.json();

                  const updatedUser = {
                    ...user,
                    name: name,
                    email: email,
                  };

                  localStorage.setItem(
                    "user",
                    JSON.stringify(updatedUser)
                  );

                  toast.success(data.message);

                  loadProfile();

                  window.location.reload();

                } catch {

                  toast.error("Unable to update profile");

                }

              }} className="mt-4 rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: TEAL }}>
                Save profile
              </button>
            </Card>
          )}
          {section === "Preferences" && (

            <Card title="🍽 AI Food Profile">

              <p className="mb-6 text-sm text-gray-400">

                Help FridgeAI understand your eating habits to generate
                better recipes, shopping lists, and meal plans.

              </p>

              {/* Diet */}

              <div className="mb-6">

                <h3 className="mb-3 text-sm font-semibold text-white">

                  🥗 Diet Type

                </h3>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">

                  {[
                    "Vegetarian",
                    "Vegan",
                    "Non Vegetarian",
                    "High Protein",
                    "Keto"
                  ].map((item) => (

                    <button
                      key={item}
                      onClick={() => setDietType(item)}
                      className="rounded-xl border py-3 text-sm transition-all"
                      style={{
                        backgroundColor:
                          dietType === item ? TEAL : "#0f0f0f",

                        borderColor:
                          dietType === item ? TEAL : "#2a2a2a",

                        color:
                          dietType === item ? "#fff" : "#d1d5db"
                      }}
                    >

                      {item}

                    </button>

                  ))}

                </div>

              </div>

              {/* Cuisine */}

              <div className="mb-6">

                <h3 className="mb-3 text-sm font-semibold text-white">

                  🌎 Favourite Cuisine

                </h3>

                <select

                  value={cuisine}

                  onChange={(e) => setCuisine(e.target.value)}

                  className="w-full rounded-xl px-4 py-3 text-white"

                  style={{

                    background: "#0f0f0f",

                    border: "1px solid #2a2a2a"

                  }}

                >

                  <option value="">Choose Cuisine</option>

                  <option>Indian</option>

                  <option>Italian</option>

                  <option>Chinese</option>

                  <option>Mexican</option>

                  <option>Thai</option>

                  <option>Japanese</option>

                  <option>Mediterranean</option>

                </select>

              </div>

              {/* Spice */}

              <div className="mb-6">

                <h3 className="mb-3 text-sm font-semibold text-white">

                  🌶 Spice Level

                </h3>

                <div className="flex gap-3">

                  {["Mild", "Medium", "Hot"].map((item) => (

                    <button

                      key={item}

                      onClick={() => setSpiceLevel(item)}

                      className="flex-1 rounded-xl border py-3"

                      style={{

                        background:

                          spiceLevel === item ? TEAL : "#0f0f0f",

                        borderColor:

                          spiceLevel === item ? TEAL : "#2a2a2a",

                        color:

                          spiceLevel === item ? "#fff" : "#d1d5db"

                      }}

                    >

                      {item}

                    </button>

                  ))}

                </div>

              </div>

              {/* Servings */}

              <div className="mb-6">

                <h3 className="mb-3 text-sm font-semibold text-white">

                  👨‍👩‍👧 Number of Servings

                </h3>

                <div className="flex items-center gap-4">

                  <button

                    onClick={() => setServings(Math.max(1, servings - 1))}

                    className="h-10 w-10 rounded-full bg-[#2a2a2a] text-xl text-white"

                  >

                    -

                  </button>

                  <span className="text-2xl font-bold text-white">

                    {servings}

                  </span>

                  <button

                    onClick={() => setServings(servings + 1)}

                    className="h-10 w-10 rounded-full"

                    style={{

                      background: TEAL,

                      color: "#fff"

                    }}

                  >

                    +

                  </button>

                </div>

              </div>

              {/* Allergy */}

              <div className="mb-6">

                <h3 className="mb-3 text-sm font-semibold text-white">

                  🚫 Allergies

                </h3>

                <input

                  value={allergy}

                  onChange={(e) => setAllergy(e.target.value)}

                  placeholder="Example: Milk, Peanuts"

                  className="w-full rounded-xl px-4 py-3 text-white"

                  style={{

                    background: "#0f0f0f",

                    border: "1px solid #2a2a2a"

                  }}

                />

              </div>

              {/* Health Goal */}

              <div className="mb-8">

                <h3 className="mb-3 text-sm font-semibold text-white">

                  🎯 Health Goal

                </h3>

                <select

                  value={healthGoal}

                  onChange={(e) => setHealthGoal(e.target.value)}

                  className="w-full rounded-xl px-4 py-3 text-white"

                  style={{

                    background: "#0f0f0f",

                    border: "1px solid #2a2a2a"

                  }}

                >

                  <option value="">Choose Goal</option>

                  <option>Weight Loss</option>

                  <option>Healthy Eating</option>

                  <option>Muscle Gain</option>

                  <option>Fitness</option>

                  <option>Maintain Weight</option>

                </select>

              </div>
              <div className="mb-6">

                <h3 className="mb-3 text-sm font-semibold text-white">

                  ❤️ Favorite Foods

                </h3>

                <input

                  value={favoriteFoods}

                  onChange={(e) => setFavoriteFoods(e.target.value)}

                  placeholder="Chicken, Paneer, Pasta..."

                  className="w-full rounded-xl px-4 py-3 text-white"

                  style={{

                    background: "#0f0f0f",

                    border: "1px solid #2a2a2a"

                  }}

                />

                <p className="mt-2 text-xs text-gray-500">

                  Separate using commas

                </p>

              </div>
              <div className="mb-6">

                <h3 className="mb-3 text-sm font-semibold text-white">

                  👎 Foods You Don't Like

                </h3>

                <input

                  value={avoidFoods}

                  onChange={(e) => setAvoidFoods(e.target.value)}

                  placeholder="Mushroom, Broccoli..."

                  className="w-full rounded-xl px-4 py-3 text-white"

                  style={{

                    background: "#0f0f0f",

                    border: "1px solid #2a2a2a"

                  }}

                />

              </div>
              <div className="mb-6">

                <h3 className="mb-3 text-sm font-semibold text-white">

                  🤖 Cooking Style

                </h3>

                <div className="grid grid-cols-2 gap-3">

                  {[

                    "Quick Meals",

                    "Healthy",

                    "Budget",

                    "Gourmet"

                  ].map(item => (

                    <button

                      key={item}

                      onClick={() => setCookingStyle(item)}

                      className="rounded-xl border py-3"

                      style={{

                        background:

                          cookingStyle === item ? TEAL : "#0f0f0f",

                        borderColor:

                          cookingStyle === item ? TEAL : "#2a2a2a",

                        color:

                          cookingStyle === item ? "#fff" : "#d1d5db"

                      }}

                    >

                      {item}

                    </button>

                  ))}

                </div>

              </div>
              <div className="mb-6">

                <h3 className="mb-3 text-sm font-semibold text-white">

                  🍴 Preferred Meal

                </h3>

                <select

                  value={mealTime}

                  onChange={(e) => setMealTime(e.target.value)}

                  className="w-full rounded-xl px-4 py-3 text-white"

                  style={{

                    background: "#0f0f0f",

                    border: "1px solid #2a2a2a"

                  }}

                >

                  <option value="">Choose</option>

                  <option>Breakfast</option>

                  <option>Lunch</option>

                  <option>Dinner</option>

                  <option>Snacks</option>

                </select>

              </div>
              <div className="mb-8">

                <h3 className="mb-3 text-sm font-semibold text-white">

                  💰 Budget

                </h3>

                <select

                  value={budget}

                  onChange={(e) => setBudget(e.target.value)}

                  className="w-full rounded-xl px-4 py-3 text-white"

                  style={{

                    background: "#0f0f0f",

                    border: "1px solid #2a2a2a"

                  }}

                >

                  <option value="">Choose Budget</option>

                  <option>Low</option>

                  <option>Medium</option>

                  <option>High</option>

                </select>

              </div>
              <button

                onClick={saveProfile}

                className="w-full rounded-xl py-3 font-semibold text-white"

                style={{

                  background: TEAL

                }}

              >

                💾 Save AI Preferences

              </button>

            </Card>

          )}
          {section === "Account" && (
            <Card title="Account">
              <Row label="Change password" onClick={() => setModal("password")} />
              <Row label="Manage subscription" onClick={() => setModal("sub")} />
              <Row label="Delete account" onClick={() => setModal("delete")} danger />
            </Card>
          )}

          {section === "App" && (
            <Card title="App">
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm text-white">Dark mode</div>
                  <div className="text-xs text-gray-500">Dark mode only in beta</div>
                </div>
                <div className="relative h-6 w-11 rounded-full opacity-50" style={{ backgroundColor: TEAL }}>
                  <span className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-white" />
                </div>
              </div>
              <div className="flex items-center justify-between border-t py-3" style={{ borderColor: "#2a2a2a" }}>
                <div className="text-sm text-white">Language</div>
                <select className="rounded px-2 py-1 text-sm text-white" style={{ backgroundColor: "#0f0f0f", border: "1px solid #2a2a2a" }}>
                  <option>English</option><option>Hindi</option><option>Spanish</option>
                </select>
              </div>
              <div className="flex items-center justify-between border-t py-3" style={{ borderColor: "#2a2a2a" }}>
                <div className="text-sm text-white">App version</div>
                <div className="text-sm text-gray-500">1.0.0</div>
              </div>
            </Card>
          )}

          <button onClick={() => setModal("signout")}
            className="w-full rounded-lg py-2.5 text-sm font-medium text-red-500"
            style={{ border: "1px solid rgba(239,68,68,0.5)" }}>
            Sign out
          </button>
        </div>
      </div>

      {modal === "password" && (
        <Modal title="Change password" onClose={() => setModal(null)}>
          <div className="space-y-3">
            {["Current password", "New password", "Confirm new password"].map((l) => (
              <Input key={l} label={l} type="password" />
            ))}
            <button onClick={() => { setModal(null); toast.success("Password updated"); }} className="w-full rounded-lg py-2 text-sm font-medium text-white" style={{ backgroundColor: TEAL }}>
              Update password
            </button>
          </div>
        </Modal>
      )}
      {modal === "sub" && (
        <Modal title="Manage subscription" onClose={() => setModal(null)}>
          <div className="text-sm text-gray-300">Current plan: <span className="font-bold text-white">Free</span></div>
          <ul className="my-4 space-y-1 text-sm text-gray-400">
            <li>· 5 scans per month</li>
            <li>· Basic recipes</li>
            <li>· Expiry alerts</li>
          </ul>
          <button onClick={() => { setModal(null); toast.success("Upgraded!"); }} className="w-full rounded-lg py-2 text-sm font-medium text-white" style={{ backgroundColor: TEAL }}>
            Upgrade to Pro
          </button>
        </Modal>
      )}
      {modal === "delete" && (
        <Modal title="Delete account" onClose={() => setModal(null)}>
          <p className="text-sm text-gray-300">Are you sure? This cannot be undone.</p>
          <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type DELETE to confirm"
            className="mt-3 w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
            style={{ backgroundColor: "#0f0f0f", border: "1px solid #2a2a2a" }} />
          <button disabled={confirmText !== "DELETE"} onClick={() => { nav({ to: "/login" }); }}
            className="mt-3 w-full rounded-lg py-2 text-sm font-medium text-white disabled:opacity-40" style={{ backgroundColor: "#dc2626" }}>
            Delete account
          </button>
        </Modal>
      )}
      {modal === "signout" && (
        <Modal title="Sign out" onClose={() => setModal(null)}>
          <p className="text-sm text-gray-300">Are you sure you want to sign out?</p>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => {

                localStorage.removeItem("token");

                localStorage.removeItem("user");

                nav({
                  to: "/login"
                });

              }} className="flex-1 rounded-lg py-2 text-sm font-medium text-white" style={{ backgroundColor: "#dc2626" }}>
              Sign out
            </button>
            <button onClick={() => setModal(null)} className="flex-1 rounded-lg py-2 text-sm text-white" style={{ border: "1px solid #2a2a2a" }}>
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </AppShell>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-6" style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}>
      <h2 className="mb-4 text-lg font-semibold text-white">{title}</h2>
      {children}
    </div>
  );
}

function Input({ label, ...props }: any) {
  return (
    <div>
      <label className="mb-1 block text-xs text-gray-400">{label}</label>
      <input {...props} className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2"
        style={{ backgroundColor: "#0f0f0f", border: "1px solid #2a2a2a" }} />
    </div>
  );
}

function Row({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} className="flex w-full items-center justify-between border-t py-3 text-left first:border-t-0 first:pt-0"
      style={{ borderColor: "#2a2a2a" }}>
      <span className={`text-sm ${danger ? "text-red-500" : "text-white"}`}>{label}</span>
      <span className="text-gray-500">›</span>
    </button>
  );
}
