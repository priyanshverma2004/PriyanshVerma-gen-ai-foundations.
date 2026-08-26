import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, TEAL } from "@/components/AppShell";

import {
  ShoppingBag,
  AlertTriangle,
  ChefHat,
  Calendar,
  Camera,
  MessageSquare,
  ShoppingCart,
  ArrowRight,
  Clock,
  Users,
  Package,
  RefreshCw,
  Sparkles,
  Plus,
  CheckCircle2,
  ChevronRight,
  Utensils,
  Refrigerator,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { toast } from "sonner";


// =========================================================
// ROUTE
// =========================================================

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      {
        title: "Dashboard — FridgeAI",
      },
    ],
  }),

  component: Dashboard,
});


// =========================================================
// TYPES
// =========================================================

type InventoryItem = {
  id: number;
  user_id: number;
  item_name: string;
  quantity: number;
  unit: string;
  category: string;
  expiry_date?: string | null;
  image?: string | null;
};

type ShoppingItem = {
  id: number;
  user_id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  checked: boolean;
};


// =========================================================
// CONSTANTS
// =========================================================

const API = "http://127.0.0.1:8000";


// =========================================================
// CATEGORY COLORS
// Keep FridgeAI dark + teal visual language
// =========================================================

const CATEGORY_COLORS: Record<
  string,
  string
> = {
  Fruit: "#1D9E75",
  Vegetable: "#38A169",
  Dairy: "#60A5FA",
  Protein: "#F59E0B",
  Spices: "#EF9F27",
  Oils: "#A78BFA",
  Other: "#6B7280",
};


// =========================================================
// HELPERS
// =========================================================

function getUser() {

  if (
    typeof window ===
    "undefined"
  ) {
    return null;
  }

  try {

    return JSON.parse(
      localStorage.getItem(
        "user"
      ) || "null"
    );

  } catch {

    return null;

  }
}


function getDaysUntilExpiry(
  expiry?: string | null
) {

  if (!expiry) {
    return null;
  }

  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  const date =
    new Date(expiry);

  date.setHours(
    0,
    0,
    0,
    0
  );

  const diff =
    date.getTime() -
    today.getTime();

  return Math.ceil(
    diff /
      (1000 *
        60 *
        60 *
        24)
  );
}


function expiryMessage(
  days: number | null
) {

  if (days === null) {
    return "Expiry date not available";
  }

  if (days < 0) {
    return "Expired — remove from inventory";
  }

  if (days === 0) {
    return "Expires today — use it now";
  }

  if (days === 1) {
    return "Expires tomorrow — use it today";
  }

  return `Expires in ${days} days`;

}


// =========================================================
// DASHBOARD
// =========================================================

function Dashboard() {

  const [inventory, setInventory] =
    useState<InventoryItem[]>([]);

  const [shopping, setShopping] =
    useState<ShoppingItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [userName, setUserName] =
    useState("there");


  // =======================================================
  // LOAD DATA
  // =======================================================

  const loadDashboard =
    async () => {

      try {

        setRefreshing(true);

        const user =
          getUser();

        if (!user?.id) {

          toast.error(
            "Please log in again"
          );

          return;
        }

        setUserName(
          user.name ||
          "there"
        );


        const [
          inventoryResponse,
          shoppingResponse,
        ] =
          await Promise.all([

            fetch(
              `${API}/inventory/user/${user.id}`
            ),

            fetch(
              `${API}/shopping/${user.id}`
            ),

          ]);


        if (
          !inventoryResponse.ok
        ) {
          throw new Error(
            "Inventory request failed"
          );
        }


        if (
          !shoppingResponse.ok
        ) {
          throw new Error(
            "Shopping request failed"
          );
        }


        const inventoryData =
          await inventoryResponse.json();

        const shoppingData =
          await shoppingResponse.json();


        setInventory(
          Array.isArray(
            inventoryData
          )
            ? inventoryData
            : []
        );


        setShopping(
          Array.isArray(
            shoppingData
          )
            ? shoppingData
            : []
        );

      } catch (error) {

        console.error(
          error
        );

        toast.error(
          "Unable to load dashboard"
        );

      } finally {

        setLoading(false);

        setRefreshing(false);

      }

    };


  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {

    loadDashboard();

  }, []);


  // =======================================================
  // INVENTORY STATISTICS
  // =======================================================

  const totalItems =
    inventory.length;


  const expiredItems =
    inventory.filter(
      (item) => {

        const days =
          getDaysUntilExpiry(
            item.expiry_date
          );

        return (
          days !== null &&
          days < 0
        );

      }
    );


  const expiringSoon =
    inventory.filter(
      (item) => {

        const days =
          getDaysUntilExpiry(
            item.expiry_date
          );

        return (
          days !== null &&
          days >= 0 &&
          days <= 3
        );

      }
    );


  const lowStock =
    inventory.filter(
      (item) =>
        Number(
          item.quantity
        ) <= 2
    );


  const shoppingCount =
    shopping.filter(
      (item) =>
        !item.checked
    ).length;


  const purchasedCount =
    shopping.filter(
      (item) =>
        item.checked
    ).length;


  // =======================================================
  // EXPIRY SORT
  // =======================================================

  const expiryAlerts =
    useMemo(() => {

      return [
        ...expiredItems,
        ...expiringSoon,
      ]
        .sort(
          (a, b) => {

            const da =
              getDaysUntilExpiry(
                a.expiry_date
              );

            const db =
              getDaysUntilExpiry(
                b.expiry_date
              );

            return (
              (da ?? 999) -
              (db ?? 999)
            );

          }
        )
        .slice(0, 5);

    }, [
      inventory,
    ]);


  // =======================================================
  // CATEGORY DATA
  // =======================================================

  const categoryData =
    useMemo(() => {

      const counts: Record<
        string,
        number
      > = {};


      inventory.forEach(
        (item) => {

          const category =
            item.category ||
            "Other";

          counts[
            category
          ] =
            (counts[
              category
            ] || 0) + 1;

        }
      );


      return Object.entries(
        counts
      ).map(
        ([name, value]) => ({

          name,

          value,

          color:
            CATEGORY_COLORS[
              name
            ] ||
            CATEGORY_COLORS.Other,

        })
      );

    }, [
      inventory,
    ]);


  // =======================================================
  // QUICK STATS
  // =======================================================

  const healthyItems =
    Math.max(
      0,
      totalItems -
        expiringSoon.length -
        expiredItems.length
    );


  // =======================================================
  // RETURN
  // =======================================================

  return (

    <AppShell
      title={`Good morning, ${userName}`}
    >

      <div className="space-y-6">


        {/* =================================================
            HERO
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

          <div className="relative p-6 sm:p-7">

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <div className="mb-3 flex items-center gap-2">

                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor:
                        "rgba(29,158,117,0.12)",

                      color:
                        TEAL,
                    }}
                  >

                    <Sparkles
                      className="h-4 w-4"
                    />

                  </div>

                  <span
                    className="text-xs font-semibold uppercase tracking-[0.18em]"
                    style={{
                      color:
                        TEAL,
                    }}
                  >
                    FridgeAI
                  </span>

                </div>


                <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">

                  Your kitchen,
                  <span
                    style={{
                      color:
                        TEAL,
                    }}
                  >
                    {" "}
                    simplified.
                  </span>

                </h1>


                <p className="mt-2 max-w-xl text-sm leading-6 text-gray-400">

                  Manage your ingredients,
                  discover recipes, plan meals,
                  and never forget what needs
                  to be used.

                </p>

              </div>


              <div className="flex flex-wrap gap-2">

                <Link
                  to="/scan"
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                  style={{
                    backgroundColor:
                      TEAL,
                  }}
                >

                  <Camera
                    className="h-4 w-4"
                  />

                  Scan fridge

                </Link>


                <button
                  onClick={
                    loadDashboard
                  }
                  disabled={
                    refreshing
                  }
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#222] disabled:opacity-50"
                  style={{
                    backgroundColor:
                      "#0f0f0f",

                    border:
                      "1px solid #2a2a2a",
                  }}
                >

                  <RefreshCw
                    className={
                      refreshing
                        ? "h-4 w-4 animate-spin"
                        : "h-4 w-4"
                    }
                  />

                  Refresh

                </button>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            STAT CARDS
        ================================================= */}

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

          <DashboardStat
            icon={
              Refrigerator
            }
            value={
              loading
                ? "—"
                : totalItems
            }
            label="Inventory items"
            color={
              TEAL
            }
            to="/inventory"
          />


          <DashboardStat
            icon={
              AlertTriangle
            }
            value={
              loading
                ? "—"
                : expiringSoon.length
            }
            label="Expiring soon"
            color={
              "#EF9F27"
            }
            to="/inventory"
          />


          <DashboardStat
            icon={
              ShoppingCart
            }
            value={
              loading
                ? "—"
                : shoppingCount
            }
            label="Items to buy"
            color={
              "#60A5FA"
            }
            to="/shopping"
          />


          <DashboardStat
            icon={
              ChefHat
            }
            value="AI"
            label="Recipe assistant"
            color={
              TEAL
            }
            to="/chat"
          />

        </section>


        {/* =================================================
            MAIN GRID
        ================================================= */}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">


          {/* =================================================
              LEFT
          ================================================= */}

          <div className="space-y-6">


            {/* =================================================
                EXPIRY ALERTS
            ================================================= */}

            <SectionHeader
              title="Expiry alerts"
              subtitle={
                expiringSoon.length > 0
                  ? `${expiringSoon.length} ingredients need attention`
                  : "Your inventory is looking good"
              }
              link="/inventory"
              linkText="View inventory"
            />


            <section>

              {loading ? (

                <LoadingCard />

              ) : expiryAlerts.length ===
                0 ? (

                <div
                  className="flex items-center gap-4 rounded-2xl p-5"
                  style={{
                    backgroundColor:
                      "#1a1a1a",

                    border:
                      "1px solid #2a2a2a",
                  }}
                >

                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor:
                        "rgba(29,158,117,0.1)",

                      color:
                        TEAL,
                    }}
                  >

                    <CheckCircle2
                      className="h-5 w-5"
                    />

                  </div>


                  <div>

                    <div className="font-semibold text-white">
                      No urgent expiry alerts
                    </div>

                    <div className="mt-1 text-xs text-gray-500">
                      Your current inventory
                      doesn't have anything
                      expiring soon.
                    </div>

                  </div>

                </div>

              ) : (

                <div className="space-y-3">

                  {expiryAlerts.map(
                    (item) => {

                      const days =
                        getDaysUntilExpiry(
                          item.expiry_date
                        );


                      const expired =
                        days !== null &&
                        days < 0;


                      return (

                        <div
                          key={
                            item.id
                          }
                          className="group flex items-center gap-4 rounded-2xl p-4 transition hover:border-[#3a3a3a]"
                          style={{
                            backgroundColor:
                              expired
                                ? "#251414"
                                : "#221c0d",

                            border:
                              expired
                                ? "1px solid #6b2a2a"
                                : "1px solid #4a3915",
                          }}
                        >

                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                            style={{
                              backgroundColor:
                                expired
                                  ? "rgba(220,38,38,0.1)"
                                  : "rgba(239,159,39,0.1)",

                              color:
                                expired
                                  ? "#dc2626"
                                  : "#EF9F27",
                            }}
                          >

                            <AlertTriangle
                              className="h-5 w-5"
                            />

                          </div>


                          <div className="min-w-0 flex-1">

                            <div className="flex items-center gap-2">

                              <span className="truncate font-semibold text-white">
                                {
                                  item.item_name
                                }
                              </span>


                              {expired && (

                                <span
                                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                                  style={{
                                    backgroundColor:
                                      "rgba(220,38,38,0.12)",

                                    color:
                                      "#f87171",
                                  }}
                                >
                                  Expired
                                </span>

                              )}

                            </div>


                            <div className="mt-1 text-xs text-gray-400">

                              {expiryMessage(
                                days
                              )}

                              {" · "}

                              {
                                item.quantity
                              }{" "}
                              {
                                item.unit
                              }

                            </div>

                          </div>


                          <Link
                            to="/chat"
                            className="hidden items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 sm:inline-flex"
                            style={{
                              backgroundColor:
                                TEAL,
                            }}
                          >

                            Cook

                            <ArrowRight
                              className="h-3 w-3"
                            />

                          </Link>

                        </div>

                      );

                    }
                  )}

                </div>

              )}

            </section>


            {/* =================================================
                QUICK ACTIONS
            ================================================= */}

            <section>

              <SectionHeader
                title="Quick actions"
                subtitle="Get things done faster"
              />


              <div className="grid gap-3 sm:grid-cols-2">

                <QuickAction
                  icon={
                    Camera
                  }
                  title="Scan fridge"
                  description="Detect ingredients instantly"
                  to="/scan"
                />


                <QuickAction
                  icon={
                    ChefHat
                  }
                  title="Ask FridgeAI"
                  description="Find recipes from your inventory"
                  to="/chat"
                />


                <QuickAction
                  icon={
                    Calendar
                  }
                  title="Plan meals"
                  description="Create a multi-day meal plan"
                  to="/meal-plan"
                />


                <QuickAction
                  icon={
                    ShoppingCart
                  }
                  title="Shopping list"
                  description={
                    shoppingCount > 0
                      ? `${shoppingCount} items waiting`
                      : "Your list is empty"
                  }
                  to="/shopping"
                />

              </div>

            </section>


            {/* =================================================
                SHOPPING PREVIEW
            ================================================= */}

            <section>

              <SectionHeader
                title="Shopping list"
                subtitle={
                  shoppingCount > 0
                    ? `${shoppingCount} items waiting`
                    : "Nothing to buy"
                }
                link="/shopping"
                linkText="Open list"
              />


              <div
                className="overflow-hidden rounded-2xl"
                style={{
                  backgroundColor:
                    "#1a1a1a",

                  border:
                    "1px solid #2a2a2a",
                }}
              >

                {shopping
                  .filter(
                    (item) =>
                      !item.checked
                  )
                  .slice(0, 5)
                  .map(
                    (
                      item,
                      index
                    ) => (

                      <Link
                        key={
                          item.id
                        }
                        to="/shopping"
                        className="flex items-center gap-3 p-4 transition hover:bg-[#202020]"
                        style={{
                          borderTop:
                            index > 0
                              ? "1px solid #2a2a2a"
                              : "none",
                        }}
                      >

                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-lg"
                          style={{
                            backgroundColor:
                              "rgba(29,158,117,0.08)",

                            color:
                              TEAL,
                          }}
                        >

                          <Plus
                            className="h-4 w-4"
                          />

                        </div>


                        <div className="min-w-0 flex-1">

                          <div className="truncate text-sm font-medium text-white">
                            {
                              item.name
                            }
                          </div>

                          <div className="mt-0.5 text-xs text-gray-500">
                            {
                              item.quantity
                            }{" "}
                            {
                              item.unit
                            }{" "}
                            ·{" "}
                            {
                              item.category
                            }
                          </div>

                        </div>


                        <ChevronRight
                          className="h-4 w-4 text-gray-600"
                        />

                      </Link>

                    )
                  )}


                {shoppingCount ===
                  0 && (

                  <div className="flex flex-col items-center justify-center p-8 text-center">

                    <ShoppingCart
                      className="mb-3 h-8 w-8 text-gray-600"
                    />

                    <div className="text-sm font-medium text-white">
                      Shopping list is empty
                    </div>

                    <div className="mt-1 text-xs text-gray-500">
                      Ask FridgeAI to add
                      missing recipe ingredients.
                    </div>

                  </div>

                )}

              </div>

            </section>


            {/* =================================================
                RECENT INVENTORY
            ================================================= */}

            <section>

              <SectionHeader
                title="Your inventory"
                subtitle={`${totalItems} ingredients tracked`}
                link="/inventory"
                linkText="Manage"
              />


              <div className="grid gap-3 sm:grid-cols-2">

                {inventory
                  .slice(0, 6)
                  .map(
                    (item) => (

                      <Link
                        key={
                          item.id
                        }
                        to="/inventory"
                        className="group flex items-center gap-3 rounded-xl p-4 transition hover:bg-[#202020]"
                        style={{
                          backgroundColor:
                            "#1a1a1a",

                          border:
                            "1px solid #2a2a2a",
                        }}
                      >

                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm"
                          style={{
                            backgroundColor:
                              "rgba(29,158,117,0.08)",

                            color:
                              TEAL,
                          }}
                        >

                          <Package
                            className="h-4 w-4"
                          />

                        </div>


                        <div className="min-w-0 flex-1">

                          <div className="truncate text-sm font-semibold text-white">
                            {
                              item.item_name
                            }
                          </div>

                          <div className="mt-1 text-xs text-gray-500">

                            {
                              item.quantity
                            }{" "}
                            {
                              item.unit
                            }{" "}
                            ·{" "}
                            {
                              item.category
                            }

                          </div>

                        </div>


                        <ArrowRight
                          className="h-4 w-4 text-gray-600 transition group-hover:translate-x-0.5"
                        />

                      </Link>

                    )
                  )}


                {inventory.length ===
                  0 && (

                  <div
                    className="col-span-full rounded-2xl p-8 text-center"
                    style={{
                      backgroundColor:
                        "#1a1a1a",

                      border:
                        "1px solid #2a2a2a",
                    }}
                  >

                    <Refrigerator
                      className="mx-auto mb-3 h-8 w-8 text-gray-600"
                    />

                    <div className="text-sm font-medium text-white">
                      Your inventory is empty
                    </div>

                    <Link
                      to="/scan"
                      className="mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white"
                      style={{
                        backgroundColor:
                          TEAL,
                      }}
                    >

                      <Camera
                        className="h-3.5 w-3.5"
                      />

                      Scan ingredients

                    </Link>

                  </div>

                )}

              </div>

            </section>

          </div>


          {/* =================================================
              RIGHT SIDEBAR
          ================================================= */}

          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">


            {/* =================================================
                AI CHEF
            ================================================= */}

            <section
              className="overflow-hidden rounded-2xl"
              style={{
                backgroundColor:
                  "#1a1a1a",

                border:
                  `1px solid ${TEAL}`,
              }}
            >

              <div className="p-5">

                <div className="mb-4 flex items-center gap-3">

                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor:
                        "rgba(29,158,117,0.12)",

                      color:
                        TEAL,
                    }}
                  >

                    <ChefHat
                      className="h-5 w-5"
                    />

                  </div>


                  <div>

                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      AI Chef
                    </div>

                    <div className="font-semibold text-white">
                      What should I cook?
                    </div>

                  </div>

                </div>


                <div
                  className="rounded-xl p-4"
                  style={{
                    backgroundColor:
                      "#0f0f0f",

                    border:
                      "1px solid #2a2a2a",
                  }}
                >

                  <p className="text-sm leading-6 text-gray-300">

                    I can use your current
                    inventory, preferences,
                    and recipe knowledge base
                    to find something you can
                    actually cook.

                  </p>

                </div>


                <div className="mt-4 space-y-2">

                  <Link
                    to="/chat"
                    className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                    style={{
                      backgroundColor:
                        TEAL,
                    }}
                  >

                    <span className="flex items-center gap-2">

                      <MessageSquare
                        className="h-4 w-4"
                      />

                      Ask FridgeAI

                    </span>

                    <ArrowRight
                      className="h-4 w-4"
                    />

                  </Link>


                  <Link
                    to="/chat"
                    className="flex items-center justify-between rounded-xl px-4 py-3 text-sm text-gray-300 transition hover:bg-[#222]"
                    style={{
                      border:
                        "1px solid #2a2a2a",
                    }}
                  >

                    <span className="flex items-center gap-2">

                      <Utensils
                        className="h-4 w-4"
                      />

                      Find a recipe

                    </span>

                    <ArrowRight
                      className="h-4 w-4"
                    />

                  </Link>

                </div>

              </div>

            </section>


            {/* =================================================
                INVENTORY HEALTH
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
                  Inventory health
                </div>

                <div className="mt-1 text-xs text-gray-500">
                  Current ingredient status
                </div>

              </div>


              {loading ? (

                <div className="flex h-[190px] items-center justify-center">

                  <RefreshCw
                    className="h-5 w-5 animate-spin text-gray-600"
                  />

                </div>

              ) : categoryData.length ===
                0 ? (

                <div className="flex h-[190px] flex-col items-center justify-center text-center">

                  <Package
                    className="mb-3 h-7 w-7 text-gray-600"
                  />

                  <div className="text-xs text-gray-500">
                    Add ingredients to
                    see inventory analytics.
                  </div>

                </div>

              ) : (

                <>

                  <div className="relative">

                    <ResponsiveContainer
                      width="100%"
                      height={190}
                    >

                      <PieChart>

                        <Pie
                          data={
                            categoryData
                          }
                          dataKey="value"
                          innerRadius={
                            55
                          }
                          outerRadius={
                            78
                          }
                          paddingAngle={
                            3
                          }
                          strokeWidth={
                            0
                        }
                        >

                          {categoryData.map(
                            (item) => (

                              <Cell
                                key={
                                  item.name
                                }
                                fill={
                                  item.color
                                }
                              />

                            )
                          )}

                        </Pie>


                        <Tooltip
                          contentStyle={{
                            backgroundColor:
                              "#1a1a1a",

                            border:
                              "1px solid #2a2a2a",

                            borderRadius:
                              "10px",

                            color:
                              "#fff",
                          }}
                        />

                      </PieChart>

                    </ResponsiveContainer>


                    <div className="pointer-events-none absolute inset-0 grid place-items-center">

                      <div className="text-center">

                        <div className="text-2xl font-bold text-white">
                          {
                            totalItems
                          }
                        </div>

                        <div className="text-[10px] uppercase tracking-wider text-gray-500">
                          items
                        </div>

                      </div>

                    </div>

                  </div>


                  <div className="grid grid-cols-2 gap-2">

                    {categoryData.map(
                      (item) => (

                        <div
                          key={
                            item.name
                          }
                          className="flex items-center gap-2 text-xs text-gray-400"
                        >

                          <span
                            className="h-2 w-2 rounded-full"
                            style={{
                              backgroundColor:
                                item.color,
                            }}
                          />

                          <span className="truncate">
                            {
                              item.name
                            }
                          </span>

                          <span className="ml-auto text-gray-500">
                            {
                              item.value
                            }
                          </span>

                        </div>

                      )
                    )}

                  </div>

                </>

              )}

            </section>


            {/* =================================================
                HEALTH SUMMARY
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

              <div className="mb-4 flex items-center justify-between">

                <div>

                  <div className="text-sm font-semibold text-white">
                    Kitchen status
                  </div>

                  <div className="mt-1 text-xs text-gray-500">
                    Quick overview
                  </div>

                </div>


                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor:
                      "rgba(29,158,117,0.1)",

                    color:
                      TEAL,
                  }}
                >

                  <CheckCircle2
                    className="h-4 w-4"
                  />

                </div>

              </div>


              <HealthRow
                label="Healthy inventory"
                value={
                  healthyItems
                }
              />


              <HealthRow
                label="Low stock"
                value={
                  lowStock.length
                }
              />


              <HealthRow
                label="Expiring"
                value={
                  expiringSoon.length
                }
              />


              <HealthRow
                label="Shopping"
                value={
                  shoppingCount
                }
              />

            </section>


            {/* =================================================
                MEAL PLANNING
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

              <div className="flex items-start gap-3">

                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor:
                      "rgba(167,139,250,0.1)",

                    color:
                      "#a78bfa",
                  }}
                >

                  <Calendar
                    className="h-5 w-5"
                  />

                </div>


                <div className="min-w-0">

                  <div className="font-semibold text-white">
                    Plan your meals
                  </div>

                  <p className="mt-1 text-xs leading-5 text-gray-500">

                    Build a meal plan using
                    what you already have.

                  </p>


                  <Link
                    to="/meal-plan"
                    className="mt-4 inline-flex items-center gap-1 text-xs font-semibold"
                    style={{
                      color:
                        TEAL,
                    }}
                  >

                    Open meal planner

                    <ArrowRight
                      className="h-3 w-3"
                    />

                  </Link>

                </div>

              </div>

            </section>

          </aside>

        </div>

      </div>

    </AppShell>

  );
}


// =========================================================
// DASHBOARD STAT
// =========================================================

function DashboardStat({
  icon: Icon,
  value,
  label,
  color,
  to,
}: any) {

  return (

    <Link
      to={to}
      className="group rounded-2xl p-5 transition"
      style={{
        backgroundColor:
          "#1a1a1a",

        border:
          "1px solid #2a2a2a",
      }}
    >

      <div className="flex items-start justify-between">

        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{
            backgroundColor:
              `${color}18`,

            color:
              color,
          }}
        >

          <Icon
            className="h-4 w-4"
          />

        </div>


        <ArrowRight
          className="h-4 w-4 text-gray-700 transition group-hover:translate-x-0.5 group-hover:text-gray-400"
        />

      </div>


      <div
        className="mt-4 text-2xl font-bold"
        style={{
          color:
            color,
        }}
      >
        {value}
      </div>


      <div className="mt-1 text-xs text-gray-500">
        {label}
      </div>

    </Link>

  );
}


// =========================================================
// SECTION HEADER
// =========================================================

function SectionHeader({
  title,
  subtitle,
  link,
  linkText,
}: {
  title: string;
  subtitle?: string;
  link?: any;
  linkText?: string;
}) {

  return (

    <div className="mb-3 flex items-end justify-between gap-4">

      <div>

        <h2 className="text-lg font-semibold text-white">
          {title}
        </h2>

        {subtitle && (

          <p className="mt-1 text-xs text-gray-500">
            {subtitle}
          </p>

        )}

      </div>


      {link && (

        <Link
          to={link}
          className="shrink-0 text-xs font-medium"
          style={{
            color:
              TEAL,
          }}
        >
          {linkText ||
            "View all"}
        </Link>

      )}

    </div>

  );
}


// =========================================================
// QUICK ACTION
// =========================================================

function QuickAction({
  icon: Icon,
  title,
  description,
  to,
}: any) {

  return (

    <Link
      to={to}
      className="group flex items-center gap-4 rounded-2xl p-4 transition hover:bg-[#202020]"
      style={{
        backgroundColor:
          "#1a1a1a",

        border:
          "1px solid #2a2a2a",
      }}
    >

      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{
          backgroundColor:
            "rgba(29,158,117,0.08)",

          color:
            TEAL,
        }}
      >

        <Icon
          className="h-5 w-5"
        />

      </div>


      <div className="min-w-0 flex-1">

        <div className="font-semibold text-white">
          {title}
        </div>

        <div className="mt-1 truncate text-xs text-gray-500">
          {description}
        </div>

      </div>


      <ArrowRight
        className="h-4 w-4 text-gray-600 transition group-hover:translate-x-0.5 group-hover:text-gray-300"
      />

    </Link>

  );
}


// =========================================================
// HEALTH ROW
// =========================================================

function HealthRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {

  return (

    <div className="flex items-center justify-between border-t border-[#2a2a2a] py-2.5 first:border-t-0">

      <span className="text-xs text-gray-500">
        {label}
      </span>

      <span className="text-sm font-semibold text-white">
        {value}
      </span>

    </div>

  );
}


// =========================================================
// LOADING
// =========================================================

function LoadingCard() {

  return (

    <div
      className="animate-pulse rounded-2xl p-5"
      style={{
        backgroundColor:
          "#1a1a1a",

        border:
          "1px solid #2a2a2a",
      }}
    >

      <div className="h-12 rounded-xl bg-[#0f0f0f]" />

      <div className="mt-3 h-12 rounded-xl bg-[#0f0f0f]" />

    </div>

  );

}