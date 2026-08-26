// import { createFileRoute, Link } from "@tanstack/react-router";
// import { AppShell, TEAL } from "@/components/AppShell";
// import { useState, useEffect } from "react";
// import { getUser } from "@/utils/auth";
// import { toast } from "sonner";

// export const Route = createFileRoute("/profile")({
//   head: () => ({ meta: [{ title: "Profile — FridgeAI" }] }),
//   component: Profile,
// });

// function Profile() {
//   const user = getUser();

//   const [editing, setEditing] = useState(false);

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState("");
//   const [bio, setBio] = useState("");
//   const loadProfile = async () => {

//     try {

//       const res = await fetch(
//         `http://127.0.0.1:8000/profile/${user.id}`
//       );

//       const data = await res.json();

//       setName(data.name || "");
//       setEmail(data.email || "");
//       setPhone(data.phone || "");
//       setBio(data.bio || "");

//     } catch (err) {

//       console.log(err);

//     }

//   };

//   useEffect(() => {

//     loadProfile();

//   }, []);
//   return (
//     <AppShell title="Profile">
//       <nav className="mb-4 flex items-center gap-2 text-sm text-gray-400">
//         <Link to="/settings" className="hover:text-white">Settings</Link>
//         <span>›</span>
//         <span className="text-white">Profile</span>
//       </nav>

//       <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
//         <div className="rounded-xl p-6 text-center" style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}>
//           <div className="mx-auto grid h-24 w-24 place-items-center rounded-full text-3xl font-bold text-white" style={{ backgroundColor: TEAL }}>{name?.charAt(0).toUpperCase()}</div>
//           <label className="mt-3 inline-block cursor-pointer text-sm" style={{ color: TEAL }}>
//             Change photo<input type="file" className="hidden" />
//           </label>
//           {editing ? (
//             <div className="mt-4 space-y-2 text-left">
//               <input
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
//                 style={{
//                   background: "#0f0f0f",
//                   border: "1px solid #2a2a2a"
//                 }}
//               />
//               <input
//                 value={email}
//                 disabled
//                 className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
//                 style={{
//                   background: "#0f0f0f",
//                   border: "1px solid #2a2a2a"
//                 }}
//               />
//               <textarea
//                 value={bio}
//                 onChange={(e) => setBio(e.target.value)}
//                 rows={2}
//                 className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
//                 style={{
//                   background: "#0f0f0f",
//                   border: "1px solid #2a2a2a"
//                 }}
//               />
//               <button onClick={async () => {

//                 const res = await fetch(

//                   `http://127.0.0.1:8000/profile/${user.id}`,

//                   {

//                     method: "PUT",

//                     headers: {
//                       "Content-Type": "application/json"
//                     },

//                     body: JSON.stringify({

//                       name,
//                       phone,
//                       bio

//                     })

//                   }

//                 );

//                 const data = await res.json();

//                 localStorage.setItem(

//                   "user",

//                   JSON.stringify({

//                     ...user,

//                     name

//                   })

//                 );

//                 toast.success(data.message);

//                 setEditing(false);

//               }} className="w-full rounded-lg py-2 text-sm font-medium text-white" style={{ backgroundColor: TEAL }}>Save</button>
//             </div>
//           ) : (
//             <>
//               <div className="mt-4 text-[22px] font-bold text-white">{name}</div>
//               <div className="text-sm text-gray-400">{email}</div>
//               <div className="mt-1 text-sm italic text-gray-400">{bio || "No bio added"}</div>
//               {phone && (

// <div className="text-sm text-gray-400">

// 📞 {phone}

// </div>

// )}
//               <button onClick={() => setEditing(true)} className="mt-4 w-full rounded-lg py-2 text-sm font-medium text-white" style={{ backgroundColor: TEAL }}>Edit profile</button>
//             </>
//           )}
//         </div>

//         <div className="space-y-6">
//           <div>
//             <h2 className="mb-3 text-lg font-semibold text-white">Saved recipes</h2>
//             <div className="space-y-3">
//               {["Shakshuka with spinach", "Spinach omelette", "Tomato pasta"].map((r) => (
//                 <div key={r} className="flex items-center gap-4 overflow-hidden rounded-xl" style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}>
//                   <div className="h-20 w-24 shrink-0" style={{ backgroundColor: "#EAF3DE" }} />
//                   <div className="min-w-0 flex-1 py-3">
//                     <div className="font-semibold text-white">{r}</div>
//                     <div className="text-xs text-gray-400">20 min</div>
//                   </div>
//                   <Link to="/recipe/$id" params={{ id: "shakshuka" }} className="mr-4 rounded-lg px-3 py-1.5 text-sm font-medium text-white" style={{ backgroundColor: TEAL }}>
//                     View
//                   </Link>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="rounded-xl p-6" style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}>
//             <h2 className="mb-4 text-lg font-semibold text-white">Cooking stats</h2>
//             <div className="grid grid-cols-2 gap-4">
//               {[
//                 ["Recipes cooked", "12"],
//                 ["Meals planned", "35"],
//                 ["Items scanned", "8"],
//                 ["Food waste saved", "4 items"],
//               ].map(([l, v]) => (
//                 <div key={l} className="rounded-lg p-4" style={{ backgroundColor: "#0f0f0f" }}>
//                   <div className="text-2xl font-bold" style={{ color: TEAL }}>{v}</div>
//                   <div className="text-xs text-gray-400">{l}</div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </AppShell>
//   );
// }
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  User,
  Mail,
  Phone,
  Camera,
  Pencil,
  Save,
  X,
  Refrigerator,
  ShoppingCart,
  CalendarDays,
  ChefHat,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  BookOpen,
  RefreshCw,
} from "lucide-react";

import { AppShell, TEAL } from "@/components/AppShell";
import { useEffect, useMemo, useState } from "react";
import { getUser } from "@/utils/auth";
import { toast } from "sonner";


// =========================================================
// ROUTE
// =========================================================

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      {
        title: "Profile — FridgeAI",
      },
    ],
  }),

  component: Profile,
});


// =========================================================
// TYPES
// =========================================================

type UserProfile = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  bio?: string | null;

  diet_type?: string | null;
  cuisine?: string | null;
  spice_level?: string | null;
  servings?: number | null;
  allergy?: string | null;
  health_goal?: string | null;
  favorite_foods?: string | null;
  avoid_foods?: string | null;
  cooking_style?: string | null;
  meal_time?: string | null;
  budget?: string | null;

  profile_image?: string | null;
};


// =========================================================
// API
// =========================================================

const API =
  "http://127.0.0.1:8000";


// =========================================================
// SAFE USER
// =========================================================

function getSafeUser() {

  if (
    typeof window ===
    "undefined"
  ) {
    return null;
  }

  try {

    return getUser();

  } catch (error) {

    console.error(
      "Unable to read user:",
      error
    );

    return null;

  }

}


// =========================================================
// PROFILE
// =========================================================

function Profile() {

  const [user, setUser] =
    useState<any>(null);

  const [profile, setProfile] =
    useState<UserProfile | null>(
      null
    );

  const [editing, setEditing] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");


  // =======================================================
  // EDIT FIELDS
  // =======================================================

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [bio, setBio] =
    useState("");


  // =======================================================
  // LOAD PROFILE
  // =======================================================

  const loadProfile =
    async () => {

      try {

        setLoading(true);
        setError("");


        const currentUser =
          getSafeUser();


        if (
          !currentUser?.id
        ) {

          setError(
            "Please log in to view your profile."
          );

          return;

        }


        setUser(
          currentUser
        );


        const response =
          await fetch(
            `${API}/profile/${currentUser.id}`
          );


        if (
          !response.ok
        ) {

          throw new Error(
            "Failed to load profile"
          );

        }


        const data =
          await response.json();


        setProfile(
          data
        );


        setName(
          data.name || ""
        );

        setEmail(
          data.email || ""
        );

        setPhone(
          data.phone || ""
        );

        setBio(
          data.bio || ""
        );


      } catch (err) {

        console.error(
          err
        );

        setError(
          "Unable to load your profile."
        );

      } finally {

        setLoading(
          false
        );

      }

    };


  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {

    loadProfile();

  }, []);


  // =======================================================
  // SAVE PROFILE
  // =======================================================

  const saveProfile =
    async () => {

      if (
        !user?.id
      ) {
        return;
      }


      if (
        !name.trim()
      ) {

        toast.error(
          "Name cannot be empty"
        );

        return;

      }


      try {

        setSaving(
          true
        );


        const response =
          await fetch(
            `${API}/profile/${user.id}`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  name:
                    name.trim(),

                  phone:
                    phone.trim(),

                  bio:
                    bio.trim(),
                }),
            }
          );


        if (
          !response.ok
        ) {

          throw new Error(
            "Profile update failed"
          );

        }


        const data =
          await response.json();


        const updatedUser =
          {
            ...user,
            name:
              name.trim(),
          };


        setUser(
          updatedUser
        );


        setProfile(
          (previous) =>
            previous
              ? {
                  ...previous,

                  name:
                    name.trim(),

                  phone:
                    phone.trim(),

                  bio:
                    bio.trim(),
                }
              : previous
        );


        if (
          typeof window !==
          "undefined"
        ) {

          localStorage.setItem(
            "user",
            JSON.stringify(
              updatedUser
            )
          );

        }


        toast.success(
          data.message ||
            "Profile updated successfully"
        );


        setEditing(
          false
        );


      } catch (err) {

        console.error(
          err
        );

        toast.error(
          "Unable to update profile"
        );

      } finally {

        setSaving(
          false
        );

      }

    };


  // =======================================================
  // CANCEL EDIT
  // =======================================================

  const cancelEdit =
    () => {

      if (
        profile
      ) {

        setName(
          profile.name || ""
        );

        setEmail(
          profile.email || ""
        );

        setPhone(
          profile.phone || ""
        );

        setBio(
          profile.bio || ""
        );

      }

      setEditing(
        false
      );

    };


  // =======================================================
  // PROFILE COMPLETION
  // =======================================================

  const completion =
    useMemo(() => {

      if (!profile) {
        return 0;
      }


      const fields = [

        profile.name,

        profile.email,

        profile.phone,

        profile.bio,

        profile.diet_type,

        profile.cuisine,

        profile.spice_level,

        profile.allergy,

        profile.health_goal,

        profile.favorite_foods,

        profile.cooking_style,

        profile.meal_time,

        profile.budget,

      ];


      const completed =
        fields.filter(
          (field) =>
            field !==
              null &&
            field !==
              undefined &&
            String(
              field
            ).trim()
              .length > 0
        ).length;


      return Math.round(
        (completed /
          fields.length) *
          100
      );

    }, [
      profile,
    ]);


  // =======================================================
  // LOADING
  // =======================================================

  if (
    loading
  ) {

    return (

      <AppShell title="Profile">

        <div className="flex min-h-[500px] items-center justify-center">

          <div className="flex items-center gap-3 text-gray-400">

            <RefreshCw
              className="h-5 w-5 animate-spin"
            />

            Loading profile...

          </div>

        </div>

      </AppShell>

    );

  }


  // =======================================================
  // ERROR
  // =======================================================

  if (
    error ||
    !profile
  ) {

    return (

      <AppShell title="Profile">

        <div
          className="mx-auto max-w-xl rounded-2xl p-8 text-center"
          style={{
            backgroundColor:
              "#1a1a1a",

            border:
              "1px solid #2a2a2a",
          }}
        >

          <div
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{
              backgroundColor:
                "rgba(29,158,117,0.1)",

              color:
                TEAL,
            }}
          >

            <User
              className="h-6 w-6"
            />

          </div>


          <h2 className="mt-5 text-lg font-semibold text-white">
            Profile unavailable
          </h2>


          <p className="mt-2 text-sm text-gray-500">
            {error ||
              "We couldn't load your profile."}
          </p>


          <button
            onClick={
              loadProfile
            }
            className="mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
            style={{
              backgroundColor:
                TEAL,
            }}
          >

            <RefreshCw
              className="h-4 w-4"
            />

            Try again

          </button>

        </div>

      </AppShell>

    );

  }


  // =======================================================
  // INITIAL
  // =======================================================

  const initial =
    (
      name ||
      profile.name ||
      "U"
    )
      .charAt(0)
      .toUpperCase();


  // =======================================================
  // PAGE
  // =======================================================

  return (

    <AppShell title="Profile">

      <div className="space-y-6">


        {/* =================================================
            BREADCRUMB
        ================================================= */}

        <div className="flex items-center gap-2 text-sm text-gray-500">

          <Link
            to="/settings"
            className="transition hover:text-white"
          >
            Settings
          </Link>

          <span>
            /
          </span>

          <span className="text-gray-300">
            Profile
          </span>

        </div>


        {/* =================================================
            PROFILE HEADER
        ================================================= */}

        <section
          className="relative overflow-hidden rounded-2xl"
          style={{
            backgroundColor:
              "#1a1a1a",

            border:
              "1px solid #2a2a2a",
          }}
        >

          <div className="p-6 sm:p-8">

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

              {/* AVATAR */}

              <div className="relative shrink-0">

                <div
                  className="flex h-24 w-24 items-center justify-center rounded-3xl text-3xl font-bold text-white shadow-lg"
                  style={{
                    backgroundColor:
                      TEAL,
                  }}
                >

                  {initial}

                </div>


                <label
                  className="absolute -bottom-2 -right-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-white shadow-lg"
                  style={{
                    backgroundColor:
                      "#242424",

                    border:
                      "1px solid #3a3a3a",
                  }}
                  title="Change photo"
                >

                  <Camera
                    className="h-4 w-4"
                  />

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                  />

                </label>

              </div>


              {/* USER INFO */}

              <div className="min-w-0 flex-1">

                <div className="flex flex-wrap items-center gap-2">

                  <h1 className="text-2xl font-bold text-white">
                    {
                      profile.name ||
                      "Your Profile"
                    }
                  </h1>


                  <span
                    className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
                    style={{
                      backgroundColor:
                        "rgba(29,158,117,0.1)",

                      color:
                        TEAL,
                    }}
                  >

                    FridgeAI User

                  </span>

                </div>


                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">

                  <span className="flex items-center gap-1.5">

                    <Mail
                      className="h-3.5 w-3.5"
                    />

                    {
                      profile.email
                    }

                  </span>


                  {profile.phone && (

                    <span className="flex items-center gap-1.5">

                      <Phone
                        className="h-3.5 w-3.5"
                      />

                      {
                        profile.phone
                      }

                    </span>

                  )}

                </div>


                <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400">

                  {profile.bio ||
                    "Tell FridgeAI a little about yourself to get more personalized cooking recommendations."}

                </p>

              </div>


              {/* EDIT BUTTON */}

              {!editing && (

                <button
                  onClick={() =>
                    setEditing(
                      true
                    )
                  }
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
                  style={{
                    backgroundColor:
                      TEAL,
                  }}
                >

                  <Pencil
                    className="h-4 w-4"
                  />

                  Edit profile

                </button>

              )}

            </div>

          </div>

        </section>


        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">


          {/* =================================================
              LEFT
          ================================================= */}

          <div className="space-y-6">


            {/* =================================================
                EDIT PROFILE
            ================================================= */}

            {editing && (

              <section
                className="rounded-2xl p-6"
                style={{
                  backgroundColor:
                    "#1a1a1a",

                  border:
                    `1px solid ${TEAL}`,
                }}
              >

                <div className="mb-5">

                  <div className="flex items-center gap-2">

                    <Pencil
                      className="h-4 w-4"
                      style={{
                        color:
                          TEAL,
                      }}
                    />

                    <h2 className="font-semibold text-white">
                      Edit profile
                    </h2>

                  </div>

                  <p className="mt-1 text-xs text-gray-500">
                    Update your basic information.
                  </p>

                </div>


                <div className="grid gap-4 sm:grid-cols-2">


                  {/* NAME */}

                  <ProfileInput
                    label="Name"
                    value={
                      name
                    }
                    onChange={
                      setName
                    }
                    icon={
                      User
                    }
                  />


                  {/* EMAIL */}

                  <ProfileInput
                    label="Email"
                    value={
                      email
                    }
                    onChange={
                      setEmail
                    }
                    icon={
                      Mail
                    }
                    disabled
                  />


                  {/* PHONE */}

                  <ProfileInput
                    label="Phone"
                    value={
                      phone
                    }
                    onChange={
                      setPhone
                    }
                    icon={
                      Phone
                    }
                  />


                  {/* BIO */}

                  <div className="sm:col-span-2">

                    <label className="mb-2 block text-xs font-medium text-gray-400">
                      Bio
                    </label>

                    <textarea
                      value={
                        bio
                      }
                      onChange={(
                        e
                      ) =>
                        setBio(
                          e.target.value
                        )
                      }
                      rows={
                        4
                      }
                      placeholder="Tell us about yourself..."
                      className="w-full resize-none rounded-xl px-4 py-3 text-sm text-white outline-none placeholder:text-gray-700"
                      style={{
                        backgroundColor:
                          "#0f0f0f",

                        border:
                          "1px solid #2a2a2a",
                      }}
                    />

                  </div>

                </div>


                {/* ACTIONS */}

                <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">

                  <button
                    onClick={
                      cancelEdit
                    }
                    disabled={
                      saving
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm text-gray-300"
                    style={{
                      border:
                        "1px solid #2a2a2a",
                    }}
                  >

                    <X
                      className="h-4 w-4"
                    />

                    Cancel

                  </button>


                  <button
                    onClick={
                      saveProfile
                    }
                    disabled={
                      saving
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                    style={{
                      backgroundColor:
                        TEAL,
                    }}
                  >

                    {saving ? (

                      <RefreshCw
                        className="h-4 w-4 animate-spin"
                      />

                    ) : (

                      <Save
                        className="h-4 w-4"
                      />

                    )}

                    {saving
                      ? "Saving..."
                      : "Save changes"}

                  </button>

                </div>

              </section>

            )}


            {/* =================================================
                PREFERENCES
            ================================================= */}

            <section
              className="rounded-2xl p-6"
              style={{
                backgroundColor:
                  "#1a1a1a",

                border:
                  "1px solid #2a2a2a",
              }}
            >

              <div className="mb-5">

                <h2 className="text-lg font-semibold text-white">
                  Food preferences
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  These preferences help FridgeAI personalize recipes.
                </p>

              </div>


              <div className="grid gap-3 sm:grid-cols-2">


                <PreferenceCard
                  label="Diet"
                  value={
                    profile.diet_type
                  }
                />


                <PreferenceCard
                  label="Cuisine"
                  value={
                    profile.cuisine
                  }
                />


                <PreferenceCard
                  label="Spice level"
                  value={
                    profile.spice_level
                  }
                />


                <PreferenceCard
                  label="Health goal"
                  value={
                    profile.health_goal
                  }
                />


                <PreferenceCard
                  label="Cooking style"
                  value={
                    profile.cooking_style
                  }
                />


                <PreferenceCard
                  label="Meal time"
                  value={
                    profile.meal_time
                  }
                />


                <PreferenceCard
                  label="Servings"
                  value={
                    profile.servings
                      ? `${profile.servings} people`
                      : null
                  }
                />


                <PreferenceCard
                  label="Budget"
                  value={
                    profile.budget
                  }
                />

              </div>

            </section>


            {/* =================================================
                FAVORITES / AVOID
            ================================================= */}

            <section
              className="rounded-2xl p-6"
              style={{
                backgroundColor:
                  "#1a1a1a",

                border:
                  "1px solid #2a2a2a",
              }}
            >

              <h2 className="text-lg font-semibold text-white">
                Food preferences
              </h2>


              <div className="mt-4 grid gap-4 sm:grid-cols-2">


                <InfoBox
                  title="Favorite foods"
                  value={
                    profile.favorite_foods
                  }
                />


                <InfoBox
                  title="Foods to avoid"
                  value={
                    profile.avoid_foods
                  }
                />


                <InfoBox
                  title="Allergies"
                  value={
                    profile.allergy
                  }
                />

              </div>

            </section>



          </div>


          {/* =================================================
              RIGHT SIDEBAR
          ================================================= */}

          <aside className="space-y-6">


            {/* =================================================
                PROFILE COMPLETION
            ================================================= */}

            <section
              className="rounded-2xl p-5"
              style={{
                backgroundColor:
                  "#1a1a1a",

                border:
                  "1px solid #2a2a2a",
              }}
            >

              <div className="flex items-center justify-between">

                <div>

                  <div className="text-sm font-semibold text-white">
                    Profile completion
                  </div>

                  <div className="mt-1 text-xs text-gray-500">
                    Help FridgeAI personalize your experience.
                  </div>

                </div>


                <div
                  className="text-xl font-bold"
                  style={{
                    color:
                      TEAL,
                  }}
                >
                  {
                    completion
                  }%
                </div>

              </div>


              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#2a2a2a]">

                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width:
                      `${completion}%`,

                    backgroundColor:
                      TEAL,
                  }}
                />

              </div>


              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">

                <Sparkles
                  className="h-3.5 w-3.5"
                  style={{
                    color:
                      TEAL,
                  }}
                />

                More profile information means better recommendations.

              </div>

            </section>


            {/* =================================================
                QUICK LINKS
            ================================================= */}

            <section
              className="rounded-2xl p-5"
              style={{
                backgroundColor:
                  "#1a1a1a",

                border:
                  "1px solid #2a2a2a",
              }}
            >

              <div className="mb-4">

                <div className="text-sm font-semibold text-white">
                  Your kitchen
                </div>

                <div className="mt-1 text-xs text-gray-500">
                  Jump to your main tools.
                </div>

              </div>


              <div className="space-y-2">


                <ProfileLink
                  icon={
                    Refrigerator
                  }
                  title="Inventory"
                  description="Manage ingredients"
                  to="/inventory"
                />


                <ProfileLink
                  icon={
                    ShoppingCart
                  }
                  title="Shopping list"
                  description="Things you need to buy"
                  to="/shopping"
                />


                <ProfileLink
                  icon={
                    CalendarDays
                  }
                  title="Meal planner"
                  description="Plan your meals"
                  to="/meal-plan"
                />


                <ProfileLink
                  icon={
                    ChefHat
                  }
                  title="AI Chef"
                  description="Ask for recipe ideas"
                  to="/chat"
                />

              </div>

            </section>


            {/* =================================================
                COOKING STATS
            ================================================= */}

            <section
              className="rounded-2xl p-5"
              style={{
                backgroundColor:
                  "#1a1a1a",

                border:
                  "1px solid #2a2a2a",
              }}
            >

              <div className="mb-4">

                <div className="text-sm font-semibold text-white">
                  Cooking stats
                </div>

                <div className="mt-1 text-xs text-gray-500">
                  Your FridgeAI activity
                </div>

              </div>


              <div className="grid grid-cols-2 gap-3">


                <StatBox
                  value="12"
                  label="Recipes cooked"
                />


                <StatBox
                  value="35"
                  label="Meals planned"
                />


                <StatBox
                  value="8"
                  label="Items scanned"
                />


                <StatBox
                  value="4"
                  label="Items saved"
                />

              </div>

            </section>


          </aside>

        </div>

      </div>

    </AppShell>

  );
}


// =========================================================
// PROFILE INPUT
// =========================================================

function ProfileInput({
  label,
  value,
  onChange,
  icon: Icon,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  icon: any;
  disabled?: boolean;
}) {

  return (

    <div>

      <label className="mb-2 block text-xs font-medium text-gray-400">
        {label}
      </label>


      <div className="relative">

        <Icon
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600"
        />


        <input
          value={
            value
          }
          disabled={
            disabled
          }
          onChange={(
            e
          ) =>
            onChange(
              e.target.value
            )
          }
          className="w-full rounded-xl py-3 pl-10 pr-3 text-sm text-white outline-none placeholder:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            backgroundColor:
              "#0f0f0f",

            border:
              "1px solid #2a2a2a",
          }}
        />

      </div>

    </div>

  );
}


// =========================================================
// PREFERENCE CARD
// =========================================================

function PreferenceCard({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {

  return (

    <div
      className="rounded-xl p-4"
      style={{
        backgroundColor:
          "#0f0f0f",

        border:
          "1px solid #242424",
      }}
    >

      <div className="text-[11px] uppercase tracking-wider text-gray-600">
        {label}
      </div>


      <div className="mt-1 text-sm font-medium text-gray-300">

        {value ||
          "Not set"}

      </div>

    </div>

  );
}


// =========================================================
// INFO BOX
// =========================================================

function InfoBox({
  title,
  value,
}: {
  title: string;
  value?: string | null;
}) {

  return (

    <div
      className="rounded-xl p-4"
      style={{
        backgroundColor:
          "#0f0f0f",

        border:
          "1px solid #242424",
      }}
    >

      <div className="text-xs font-medium text-gray-400">
        {title}
      </div>


      <div className="mt-2 text-sm leading-6 text-gray-300">

        {value ||
          "Not set yet"}

      </div>

    </div>

  );
}


// =========================================================
// PROFILE LINK
// =========================================================

function ProfileLink({
  icon: Icon,
  title,
  description,
  to,
}: {
  icon: any;
  title: string;
  description: string;
  to: any;
}) {

  return (

    <Link
      to={to}
      className="group flex items-center gap-3 rounded-xl p-3 transition hover:bg-[#222]"
    >

      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        style={{
          backgroundColor:
            "rgba(29,158,117,0.08)",

          color:
            TEAL,
        }}
      >

        <Icon
          className="h-4 w-4"
        />

      </div>


      <div className="min-w-0 flex-1">

        <div className="text-sm font-medium text-white">
          {title}
        </div>

        <div className="truncate text-[11px] text-gray-600">
          {description}
        </div>

      </div>


      <ArrowRight
        className="h-4 w-4 text-gray-700 transition group-hover:translate-x-0.5 group-hover:text-gray-300"
      />

    </Link>

  );
}


// =========================================================
// STAT BOX
// =========================================================

function StatBox({
  value,
  label,
}: {
  value: string;
  label: string;
}) {

  return (

    <div
      className="rounded-xl p-4"
      style={{
        backgroundColor:
          "#0f0f0f",
      }}
    >

      <div
        className="text-xl font-bold"
        style={{
          color:
            TEAL,
        }}
      >
        {value}
      </div>


      <div className="mt-1 text-[11px] leading-4 text-gray-500">
        {label}
      </div>

    </div>

  );
}