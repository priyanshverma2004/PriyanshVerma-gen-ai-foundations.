// import { createFileRoute } from "@tanstack/react-router";
// import { AppShell, TEAL } from "@/components/AppShell";
// // import { Share2, Trash2 } from "lucide-react";
// import { useEffect, useState } from "react";
// import { toast } from "sonner";

// export const Route = createFileRoute("/shopping")({
//   head: () => ({ meta: [{ title: "Shopping list — FridgeAI" }] }),
//   component: Shopping,
// });

// type Item = {
//   id: number;
//   user_id: number;
//   name: string;
//   category: string;
//   quantity: number;
//   unit: string;
//   checked: boolean;
// };

// function Shopping() {
//   const [items, setItems] = useState<Item[]>([]);
//   const [add, setAdd] = useState("");
  
//   const toggle = (id: number) => setItems(items.map((i) => i.id === id ? { ...i, checked: !i.checked } : i));
//   const [cat, setCat] = useState("Vegetable");

// const cats = [
//   "Fruit",
//   "Vegetable",
//   "Dairy",
//   "Protein",
//   "Spices",
//   "Oils",
//   "Other",
// ];
//   const checkedCount = items.filter((i) => i.checked).length;
//   const loadShopping = async () => {
//     try {

//       const user = JSON.parse(
//         localStorage.getItem("user") || "{}"
//       );

//       const response = await fetch(
//         `http://127.0.0.1:8000/shopping/${user.id}`
//       );

//       if (!response.ok) {
//         throw new Error("Unable to load shopping list");
//       }

//       const data = await response.json();

//       setItems(data);

//     } catch (err) {

//       console.log(err);

//       toast.error("Unable to load shopping list");
//     }
//   };
//   const itemsToBuy = items.filter((i) => !i.checked).length;

//   const checkedItems = items.filter((i) => i.checked).length;

//   const totalQuantity = items.reduce(
//     (sum, item) => sum + Number(item.quantity),
//     0
//   );

//   const totalCategories = new Set(
//     items.map((i) => i.category)
//   ).size;
//   const addShopping = async () => {

//     if (!add.trim()) return;

//     try {

//       const user = JSON.parse(
//         localStorage.getItem("user") || "{}"
//       );

//       const response = await fetch(
//         "http://127.0.0.1:8000/shopping/",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             user_id: user.id,
//             name: add,
//             category: cat,
//             quantity: 1,
//             unit: "pcs",
//           }),
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed");
//       }

//       setAdd("");

//       loadShopping();

//       toast.success("Item added");

//     } catch (err) {

//       console.log(err);

//       toast.error("Unable to add item");

//     }
//   };
//   useEffect(() => {

//     loadShopping();

//   }, []);
//   const updateQuantity = async (
//     id: number,
//     quantity: number
//   ) => {

//     try {

//       await fetch(
//         `http://127.0.0.1:8000/shopping/${id}/quantity?quantity=${quantity}`,
//         {
//           method: "PUT"
//         }
//       );

//       loadShopping();

//     } catch (err) {

//       console.log(err);

//     }

//   };
//   const deleteShopping = async (id: number) => {
//     try {
//       const response = await fetch(
//         `http://127.0.0.1:8000/shopping/${id}`,
//         {
//           method: "DELETE",
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Delete failed");
//       }

//       loadShopping();

//       toast.success("Item deleted");
//     } catch (err) {
//       console.log(err);
//       toast.error("Unable to delete item");
//     }
//   };

//   return (
//     <AppShell title="Shopping list" actions={
//       <>
//         {/* <button onClick={() => toast("Link copied")} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-white" style={{ border: "1px solid #2a2a2a" }}>
//           <Share2 className="h-4 w-4" /> Share list
//         </button>
//         <button onClick={() => { setItems(items.filter((i) => !i.checked)); toast.error("Checked items cleared"); }}
//           className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-white" style={{ border: "1px solid #2a2a2a" }}>
//           <Trash2 className="h-4 w-4" /> Clear checked
//         </button> */}
//       </>
//     }>
//       <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
//         <div className="space-y-5">
//           {cats.map((c) => {
//             const list = items.filter((i) => i.category === c && !i.checked);
//             return (
//               <div key={c}>
//                 <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">{c}</h3>
//                 <div className="rounded-xl" style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}>
//                   {list.length === 0 ? (
//                     <div className="p-4 text-sm italic text-gray-500">No items needed</div>
//                   ) : list.map((i, idx) => (
//                     <div
//                       key={i.id}
//                       className="flex items-center gap-3 p-3"
//                       style={{ borderTop: idx ? "1px solid #2a2a2a" : "none" }}
//                     >
//                       <input type="checkbox" checked={i.checked} onChange={() => deleteShopping(i.id)} className="h-4 w-4 accent-[#1D9E75]" />
//                       <div
//                         className="flex-1"
//                         style={{
//                           textDecoration: i.checked ? "line-through" : "none",
//                           opacity: i.checked ? 0.5 : 1
//                         }}
//                       >
//                         <div className="text-sm text-white">
//                           {i.name}
//                         </div>

//                         <div className="text-xs text-gray-400">
//                           {i.quantity} {i.unit}
//                         </div>
//                       </div>
//                       <input
//                         type="number"
//                         value={i.quantity}
//                         onChange={(e) =>
//                           updateQuantity(i.id, Number(e.target.value))
//                         }
//                         className="w-16 rounded px-2 py-1 text-xs text-white outline-none"
//                         style={{
//                           backgroundColor: "#0f0f0f",
//                           border: "1px solid #2a2a2a"
//                         }}
//                       />
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             );
//           })}

//           {checkedCount > 0 && (
//             <details className="rounded-xl p-3" style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}>
//               <summary className="cursor-pointer text-sm text-gray-400">Checked items ({checkedCount})</summary>
//               <div className="mt-2 space-y-1">
//                 {items.filter((i) => i.checked).map((i) => (
//                   <div key={i.id} className="text-sm text-gray-500 line-through">{i.name}</div>
//                 ))}
//               </div>
//             </details>
//           )}

//           <form onSubmit={async (e) => {
//             e.preventDefault();
//             await addShopping();
//           }} className="flex gap-2">
//             <input value={add} onChange={(e) => setAdd(e.target.value)} placeholder="Add an item…"
//               className="flex-1 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2"
//               style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }} />
//             <select value={cat} onChange={(e) => setCat(e.target.value)}
//               className="rounded-lg px-3 py-2 text-sm text-white outline-none"
//               style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}>
//               {cats.map((c) => <option key={c}>{c}</option>)}
//             </select>
//             <button className="rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: TEAL }}>Add</button>
//           </form>
//         </div>

//         <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
//           <div className="rounded-xl p-5" style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}>
//             <h3 className="mb-3 font-semibold text-white">List summary</h3>
//             <div className="space-y-2 text-sm text-gray-300">
//               <div>🛒 Items to buy: {itemsToBuy}</div>

//               <div>✅ Purchased: {checkedItems}</div>

//               <div>📦 Total quantity: {totalQuantity}</div>

//               <div>📂 Categories: {totalCategories}</div>
//             </div>
//             {/* <div className="mt-3 border-t pt-3 text-sm" style={{ borderColor: "#2a2a2a" }}>
//               Estimated cost: <span className="font-semibold text-white">~₹ 350</span>
//             </div> */}
//           </div>

//           <div className="rounded-xl p-5" style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}>
//             <h3 className="mb-3 font-semibold text-white">Share with family</h3>
//             <input placeholder="Email address"
//               className="mb-2 w-full rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2"
//               style={{ backgroundColor: "#0f0f0f", border: "1px solid #2a2a2a" }} />
//             <button onClick={() => toast.success("Invite sent")} className="w-full rounded-lg py-2 text-sm font-medium text-white" style={{ backgroundColor: TEAL }}>
//               Send invite
//             </button>
//           </div>

//           {/* <div className="rounded-xl p-5" style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}>
//             <h3 className="mb-3 font-semibold text-white">Connected stores</h3>
//             {["Swiggy Instamart", "BigBasket"].map((s) => (
//               <div key={s} className="flex items-center justify-between py-2 text-sm">
//                 <span className="text-gray-300">{s}</span>
//                 <button onClick={() => toast("Coming soon")} className="rounded-md px-2 py-1 text-xs text-white" style={{ border: "1px solid #2a2a2a" }}>Connect</button>
//               </div>
//             ))} */}
//           {/* </div> */}
//         </aside>
//       </div>
//     </AppShell>
//   );
// }
import { createFileRoute } from "@tanstack/react-router";
import { AppShell, TEAL } from "@/components/AppShell";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Check,
  Package,
  Layers3,
  RefreshCw,
  Sparkles,
  ChevronDown,
  CircleCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/shopping")({
  head: () => ({
    meta: [{ title: "Shopping List — FridgeAI" }],
  }),
  component: Shopping,
});


// =========================================================
// TYPES
// =========================================================

type Item = {
  id: number;
  user_id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  checked: boolean;
};


// =========================================================
// CATEGORY CONFIG
// Same dark + teal theme
// =========================================================

const categories = [
  {
    name: "Fruit",
    icon: "🍎",
  },
  {
    name: "Vegetable",
    icon: "🥬",
  },
  {
    name: "Dairy",
    icon: "🥛",
  },
  {
    name: "Protein",
    icon: "🍗",
  },
  {
    name: "Spices",
    icon: "🌶️",
  },
  {
    name: "Oils",
    icon: "🫒",
  },
  {
    name: "Other",
    icon: "📦",
  },
];


// =========================================================
// HELPERS
// =========================================================

function getUserId() {
  try {
    const user = JSON.parse(
      localStorage.getItem("user") || "{}"
    );

    return user?.id;
  } catch {
    return null;
  }
}


// =========================================================
// MAIN COMPONENT
// =========================================================

function Shopping() {

  const [items, setItems] = useState<Item[]>([]);

  const [add, setAdd] = useState("");

  const [cat, setCat] = useState("Vegetable");

  const [loading, setLoading] = useState(true);

  const [adding, setAdding] = useState(false);

  const [selectedCategory, setSelectedCategory] =
    useState("All");


  // =======================================================
  // LOAD SHOPPING
  // =======================================================

  const loadShopping = async () => {

    try {

      setLoading(true);

      const userId = getUserId();

      if (!userId) {
        toast.error("User not found");
        return;
      }

      const response = await fetch(
        `http://127.0.0.1:8000/shopping/${userId}`
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load shopping list"
        );
      }

      const data = await response.json();

      setItems(data);

    } catch (error) {

      console.error(error);

      toast.error(
        "Unable to load shopping list"
      );

    } finally {

      setLoading(false);

    }
  };


  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {

    loadShopping();

  }, []);


  // =======================================================
  // COUNTS
  // =======================================================

  const itemsToBuy = useMemo(
    () =>
      items.filter(
        (item) => !item.checked
      ).length,
    [items]
  );


  const checkedItems = useMemo(
    () =>
      items.filter(
        (item) => item.checked
      ).length,
    [items]
  );


  const totalQuantity = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + Number(item.quantity || 0),
        0
      ),
    [items]
  );


  const totalCategories = useMemo(
    () =>
      new Set(
        items
          .filter((item) => !item.checked)
          .map((item) => item.category)
      ).size,
    [items]
  );


  // =======================================================
  // CATEGORY COUNT
  // =======================================================

  const getCategoryCount = (
    category: string
  ) => {

    return items.filter(
      (item) =>
        item.category === category &&
        !item.checked
    ).length;

  };


  // =======================================================
  // TOGGLE CHECKED
  // =======================================================

  const toggleItem = (id: number) => {

    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              checked: !item.checked,
            }
          : item
      )
    );

    const item = items.find(
      (item) => item.id === id
    );

    if (item) {

      if (!item.checked) {

        toast.success(
          `${item.name} marked as purchased`
        );

      } else {

        toast(
          `${item.name} added back to list`
        );

      }

    }

  };


  // =======================================================
  // DELETE
  // =======================================================

  const deleteShopping = async (
    id: number
  ) => {

    try {

      const response = await fetch(
        `http://127.0.0.1:8000/shopping/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Delete failed"
        );
      }

      setItems((current) =>
        current.filter(
          (item) => item.id !== id
        )
      );

      toast.success(
        "Item removed"
      );

    } catch (error) {

      console.error(error);

      toast.error(
        "Unable to delete item"
      );

    }
  };


  // =======================================================
  // UPDATE QUANTITY
  // =======================================================

  const updateQuantity = async (
    id: number,
    quantity: number
  ) => {

    if (quantity < 0.01) {
      return;
    }

    // Optimistic UI
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity,
            }
          : item
      )
    );


    try {

      const response = await fetch(
        `http://127.0.0.1:8000/shopping/${id}/quantity?quantity=${quantity}`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Quantity update failed"
        );
      }

    } catch (error) {

      console.error(error);

      toast.error(
        "Unable to update quantity"
      );

      loadShopping();

    }

  };


  // =======================================================
  // ADD SHOPPING ITEM
  // =======================================================

  const addShopping = async () => {

    if (!add.trim()) {

      toast.error(
        "Enter an item name"
      );

      return;
    }


    try {

      setAdding(true);

      const userId = getUserId();

      if (!userId) {

        toast.error(
          "User not found"
        );

        return;
      }


      const response = await fetch(
        "http://127.0.0.1:8000/shopping/",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({

            user_id: userId,

            name: add.trim(),

            category: cat,

            quantity: 1,

            unit: "pcs",

          }),

        }
      );


      if (!response.ok) {

        throw new Error(
          "Failed to add item"
        );

      }


      const newItem =
        await response.json();


      setItems((current) => [
        ...current,
        newItem,
      ]);


      setAdd("");


      toast.success(
        `${newItem.name} added to your list`
      );


    } catch (error) {

      console.error(error);

      toast.error(
        "Unable to add item"
      );

    } finally {

      setAdding(false);

    }

  };


  // =======================================================
  // CLEAR PURCHASED
  // =======================================================

  const clearPurchased = async () => {

    const purchased = items.filter(
      (item) => item.checked
    );

    if (!purchased.length) {
      return;
    }


    try {

      await Promise.all(

        purchased.map((item) =>
          fetch(
            `http://127.0.0.1:8000/shopping/${item.id}`,
            {
              method: "DELETE",
            }
          )
        )

      );


      setItems((current) =>
        current.filter(
          (item) => !item.checked
        )
      );


      toast.success(
        "Purchased items cleared"
      );


    } catch (error) {

      console.error(error);

      toast.error(
        "Unable to clear purchased items"
      );

      loadShopping();

    }

  };


  // =======================================================
  // FILTERED ITEMS
  // =======================================================

  const filteredItems = useMemo(() => {

    const activeItems =
      items.filter(
        (item) => !item.checked
      );


    if (
      selectedCategory === "All"
    ) {

      return activeItems;

    }


    return activeItems.filter(
      (item) =>
        item.category ===
        selectedCategory
    );

  }, [
    items,
    selectedCategory,
  ]);


  // =======================================================
  // CATEGORY GROUPS
  // =======================================================

  const visibleCategories =
    selectedCategory === "All"
      ? categories.filter(
          (category) =>
            getCategoryCount(
              category.name
            ) > 0
        )
      : categories.filter(
          (category) =>
            category.name ===
            selectedCategory
        );


  // =======================================================
  // RENDER
  // =======================================================

  return (

    <AppShell
      title="Shopping list"
    >

      <div className="space-y-6">

        {/* =================================================
            HERO
        ================================================= */}

        <section
          className="overflow-hidden rounded-2xl"
          style={{
            backgroundColor:
              "#1a1a1a",
            border:
              "1px solid #2a2a2a",
          }}
        >

          <div className="flex flex-col gap-5 p-6 sm:p-7 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <div className="mb-2 flex items-center gap-2">

                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor:
                      "rgba(29,158,117,0.12)",
                    color: TEAL,
                  }}
                >
                  <ShoppingCart
                    className="h-5 w-5"
                  />
                </div>

                <span
                  className="text-xs font-semibold uppercase tracking-[0.18em]"
                  style={{
                    color: TEAL,
                  }}
                >
                  Kitchen essentials
                </span>

              </div>


              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Your shopping list
              </h1>


              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-400">
                Keep track of ingredients you need.
                Items added by FridgeAI will appear
                here automatically.
              </p>

            </div>


            <button
              onClick={loadShopping}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
              style={{
                backgroundColor:
                  "#0f0f0f",
                border:
                  "1px solid #2a2a2a",
              }}
            >

              <RefreshCw
                className={`h-4 w-4 ${
                  loading
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh

            </button>

          </div>

        </section>


        {/* =================================================
            STAT CARDS
        ================================================= */}

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">

          <StatCard
            icon={
              <ShoppingCart className="h-4 w-4" />
            }
            label="To buy"
            value={itemsToBuy}
          />

          <StatCard
            icon={
              <CircleCheck className="h-4 w-4" />
            }
            label="Purchased"
            value={checkedItems}
          />

          <StatCard
            icon={
              <Package className="h-4 w-4" />
            }
            label="Quantity"
            value={totalQuantity}
          />

          <StatCard
            icon={
              <Layers3 className="h-4 w-4" />
            }
            label="Categories"
            value={totalCategories}
          />

        </section>


        {/* =================================================
            ADD ITEM
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

          <div className="mb-4 flex items-start gap-3">

            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{
                backgroundColor:
                  "rgba(29,158,117,0.12)",
                color: TEAL,
              }}
            >
              <Plus className="h-4 w-4" />
            </div>

            <div>

              <h2 className="text-sm font-semibold text-white">
                Add something to your list
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Add an ingredient manually.
              </p>

            </div>

          </div>


          <form
            onSubmit={async (e) => {

              e.preventDefault();

              await addShopping();

            }}
            className="flex flex-col gap-2 sm:flex-row"
          >

            <input
              value={add}
              onChange={(e) =>
                setAdd(e.target.value)
              }
              placeholder="e.g. Paneer, tomatoes, olive oil..."
              className="min-w-0 flex-1 rounded-xl px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:ring-2"
              style={{
                backgroundColor:
                  "#0f0f0f",
                border:
                  "1px solid #2a2a2a",
              }}
            />


            <div className="relative">

              <select
                value={cat}
                onChange={(e) =>
                  setCat(e.target.value)
                }
                className="w-full appearance-none rounded-xl px-4 py-3 pr-10 text-sm text-white outline-none sm:w-40"
                style={{
                  backgroundColor:
                    "#0f0f0f",
                  border:
                    "1px solid #2a2a2a",
                }}
              >

                {categories.map(
                  (category) => (

                    <option
                      key={category.name}
                      value={category.name}
                    >
                      {category.icon}{" "}
                      {category.name}
                    </option>

                  )
                )}

              </select>

              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
              />

            </div>


            <button
              type="submit"
              disabled={adding}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                backgroundColor:
                  TEAL,
              }}
            >

              {adding ? (

                <RefreshCw
                  className="h-4 w-4 animate-spin"
                />

              ) : (

                <Plus
                  className="h-4 w-4"
                />

              )}

              {adding
                ? "Adding..."
                : "Add item"}

            </button>

          </form>

        </section>


        {/* =================================================
            CATEGORY FILTER
        ================================================= */}

        <div
          className="overflow-x-auto pb-1"
        >

          <div
            className="flex min-w-max gap-2"
          >

            <CategoryButton
              active={
                selectedCategory ===
                "All"
              }
              label="All items"
              count={itemsToBuy}
              onClick={() =>
                setSelectedCategory(
                  "All"
                )
              }
            />


            {categories.map(
              (category) => (

                <CategoryButton
                  key={category.name}
                  active={
                    selectedCategory ===
                    category.name
                  }
                  label={`${category.icon} ${category.name}`}
                  count={getCategoryCount(
                    category.name
                  )}
                  onClick={() =>
                    setSelectedCategory(
                      category.name
                    )
                  }
                />

              )
            )}

          </div>

        </div>


        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">


          {/* =================================================
              SHOPPING ITEMS
          ================================================= */}

          <main>

            {loading ? (

              <LoadingState />

            ) : filteredItems.length === 0 ? (

              <EmptyState
                category={
                  selectedCategory
                }
                onAdd={() =>
                  document
                    .querySelector(
                      "input[placeholder^='e.g. Paneer']"
                    )
                    ?.scrollIntoView({
                      behavior:
                        "smooth",
                    })
                }
              />

            ) : (

              <div className="space-y-5">

                {visibleCategories.map(
                  (category) => {

                    const list =
                      filteredItems.filter(
                        (item) =>
                          item.category ===
                          category.name
                      );


                    if (!list.length) {
                      return null;
                    }


                    return (

                      <section
                        key={
                          category.name
                        }
                      >

                        {/* CATEGORY HEADER */}

                        <div className="mb-2 flex items-center justify-between px-1">

                          <div className="flex items-center gap-2">

                            <span className="text-base">
                              {category.icon}
                            </span>

                            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
                              {category.name}
                            </h3>

                            <span
                              className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                              style={{
                                backgroundColor:
                                  "rgba(29,158,117,0.1)",
                                color: TEAL,
                              }}
                            >
                              {list.length}
                            </span>

                          </div>

                        </div>


                        {/* ITEMS */}

                        <div
                          className="overflow-hidden rounded-2xl"
                          style={{
                            backgroundColor:
                              "#1a1a1a",
                            border:
                              "1px solid #2a2a2a",
                          }}
                        >

                          {list.map(
                            (
                              item,
                              index
                            ) => (

                              <ShoppingItem
                                key={
                                  item.id
                                }
                                item={
                                  item
                                }
                                first={
                                  index ===
                                  0
                                }
                                onToggle={() =>
                                  toggleItem(
                                    item.id
                                  )
                                }
                                onDelete={() =>
                                  deleteShopping(
                                    item.id
                                  )
                                }
                                onQuantityChange={(
                                  quantity
                                ) =>
                                  updateQuantity(
                                    item.id,
                                    quantity
                                  )
                                }
                              />

                            )
                          )}

                        </div>

                      </section>

                    );

                  }
                )}

              </div>

            )}

          </main>


          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">


            {/* SUMMARY */}

            <section
              className="rounded-2xl p-5"
              style={{
                backgroundColor:
                  "#1a1a1a",
                border:
                  "1px solid #2a2a2a",
              }}
            >

              <div className="mb-4 flex items-center gap-2">

                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor:
                      "rgba(29,158,117,0.12)",
                    color: TEAL,
                  }}
                >
                  <Package className="h-4 w-4" />
                </div>

                <h3 className="text-sm font-semibold text-white">
                  List summary
                </h3>

              </div>


              <div className="space-y-3">

                <SummaryRow
                  label="Items to buy"
                  value={itemsToBuy}
                />

                <SummaryRow
                  label="Purchased"
                  value={checkedItems}
                />

                <SummaryRow
                  label="Total quantity"
                  value={totalQuantity}
                />

                <SummaryRow
                  label="Categories"
                  value={totalCategories}
                />

              </div>

            </section>


            {/* AI TIP */}

            <section
              className="rounded-2xl p-5"
              style={{
                backgroundColor:
                  "#1a1a1a",
                border:
                  "1px solid #2a2a2a",
              }}
            >

              <div className="mb-3 flex items-center gap-2">

                <Sparkles
                  className="h-4 w-4"
                  style={{
                    color: TEAL,
                  }}
                />

                <h3 className="text-sm font-semibold text-white">
                  FridgeAI tip
                </h3>

              </div>


              <p className="text-xs leading-5 text-gray-400">

                Ask FridgeAI what you can cook,
                and it can identify missing
                ingredients and add them to
                your shopping list automatically.

              </p>

            </section>


            {/* PURCHASED */}

            {checkedItems > 0 && (

              <section
                className="rounded-2xl p-5"
                style={{
                  backgroundColor:
                    "#1a1a1a",
                  border:
                    "1px solid #2a2a2a",
                }}
              >

                <div className="mb-3 flex items-center justify-between">

                  <div className="flex items-center gap-2">

                    <CircleCheck
                      className="h-4 w-4"
                      style={{
                        color: TEAL,
                      }}
                    />

                    <h3 className="text-sm font-semibold text-white">
                      Purchased
                    </h3>

                  </div>


                  <button
                    onClick={
                      clearPurchased
                    }
                    className="text-[11px] font-medium text-gray-500 transition hover:text-white"
                  >
                    Clear
                  </button>

                </div>


                <div className="space-y-2">

                  {items
                    .filter(
                      (item) =>
                        item.checked
                    )
                    .map((item) => (

                      <div
                        key={item.id}
                        className="flex items-center gap-2 rounded-lg px-2 py-2"
                        style={{
                          backgroundColor:
                            "#0f0f0f",
                        }}
                      >

                        <div
                          className="flex h-5 w-5 items-center justify-center rounded-full"
                          style={{
                            backgroundColor:
                              TEAL,
                          }}
                        >

                          <Check
                            className="h-3 w-3 text-white"
                          />

                        </div>

                        <span className="flex-1 truncate text-xs text-gray-500 line-through">
                          {item.name}
                        </span>

                      </div>

                    ))}

                </div>

              </section>

            )}

          </aside>

        </div>

      </div>

    </AppShell>

  );
}


// =========================================================
// STAT CARD
// =========================================================

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {

  return (

    <div
      className="rounded-2xl p-4"
      style={{
        backgroundColor:
          "#1a1a1a",
        border:
          "1px solid #2a2a2a",
      }}
    >

      <div className="mb-3 flex items-center justify-between">

        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{
            backgroundColor:
              "rgba(29,158,117,0.1)",
            color: TEAL,
          }}
        >
          {icon}
        </div>

      </div>

      <div className="text-xl font-semibold text-white">
        {value}
      </div>

      <div className="mt-1 text-xs text-gray-500">
        {label}
      </div>

    </div>

  );
}


// =========================================================
// CATEGORY BUTTON
// =========================================================

function CategoryButton({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {

  return (

    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition"
      style={{
        backgroundColor: active
          ? "rgba(29,158,117,0.12)"
          : "#1a1a1a",

        border: active
          ? `1px solid ${TEAL}`
          : "1px solid #2a2a2a",

        color: active
          ? TEAL
          : "#9ca3af",
      }}
    >

      {label}

      <span
        className="rounded-full px-1.5 py-0.5 text-[10px]"
        style={{
          backgroundColor:
            active
              ? "rgba(29,158,117,0.15)"
              : "#0f0f0f",
        }}
      >
        {count}
      </span>

    </button>

  );
}


// =========================================================
// SHOPPING ITEM
// =========================================================

function ShoppingItem({
  item,
  first,
  onToggle,
  onDelete,
  onQuantityChange,
}: {
  item: Item;
  first: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onQuantityChange: (
    quantity: number
  ) => void;
}) {

  const decrease = () => {

    const newQuantity =
      Math.max(
        0.01,
        Number(item.quantity) - 1
      );

    onQuantityChange(
      newQuantity
    );

  };


  const increase = () => {

    const newQuantity =
      Number(item.quantity) + 1;

    onQuantityChange(
      newQuantity
    );

  };


  return (

    <div
      className="group flex items-center gap-3 p-4 transition hover:bg-[#202020]"
      style={{
        borderTop: first
          ? "none"
          : "1px solid #2a2a2a",
      }}
    >

      {/* CHECK */}

      <button
        onClick={onToggle}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition"
        style={{
          border:
            "1px solid #3a3a3a",
          backgroundColor:
            "transparent",
        }}
        aria-label={
          `Mark ${item.name} as purchased`
        }
      >

        <span className="h-2.5 w-2.5 rounded-full" />

      </button>


      {/* NAME */}

      <div className="min-w-0 flex-1">

        <div className="truncate text-sm font-medium text-white">
          {item.name}
        </div>

        <div className="mt-1 text-xs text-gray-500">
          {item.category}
        </div>

      </div>


      {/* QUANTITY */}

      <div
        className="hidden items-center rounded-lg sm:flex"
        style={{
          backgroundColor:
            "#0f0f0f",
          border:
            "1px solid #2a2a2a",
        }}
      >

        <button
          onClick={decrease}
          className="flex h-8 w-8 items-center justify-center text-gray-500 transition hover:text-white"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>


        <div className="min-w-[58px] text-center">

          <span className="text-xs font-medium text-white">
            {item.quantity}
          </span>

          <span className="ml-1 text-[10px] text-gray-500">
            {item.unit}
          </span>

        </div>


        <button
          onClick={increase}
          className="flex h-8 w-8 items-center justify-center text-gray-500 transition hover:text-white"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>

      </div>


      {/* MOBILE QUANTITY */}

      <input
        type="number"
        min="0.01"
        step="0.01"
        value={item.quantity}
        onChange={(e) =>
          onQuantityChange(
            Number(e.target.value)
          )
        }
        className="w-16 rounded-lg px-2 py-2 text-center text-xs text-white outline-none sm:hidden"
        style={{
          backgroundColor:
            "#0f0f0f",
          border:
            "1px solid #2a2a2a",
        }}
      />


      {/* DELETE */}

      <button
        onClick={onDelete}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-600 opacity-0 transition hover:bg-[#2a2a2a] hover:text-white group-hover:opacity-100"
        aria-label={
          `Delete ${item.name}`
        }
      >

        <Trash2
          className="h-4 w-4"
        />

      </button>

    </div>

  );
}


// =========================================================
// SUMMARY ROW
// =========================================================

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {

  return (

    <div className="flex items-center justify-between">

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

function LoadingState() {

  return (

    <div className="space-y-3">

      {[1, 2, 3].map(
        (item) => (

          <div
            key={item}
            className="animate-pulse rounded-2xl p-5"
            style={{
              backgroundColor:
                "#1a1a1a",
              border:
                "1px solid #2a2a2a",
            }}
          >

            <div className="mb-4 h-3 w-24 rounded bg-[#2a2a2a]" />

            <div className="h-12 rounded-lg bg-[#0f0f0f]" />

          </div>

        )
      )}

    </div>

  );
}


// =========================================================
// EMPTY STATE
// =========================================================

function EmptyState({
  category,
  onAdd,
}: {
  category: string;
  onAdd: () => void;
}) {

  return (

    <div
      className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl p-8 text-center"
      style={{
        backgroundColor:
          "#1a1a1a",
        border:
          "1px solid #2a2a2a",
      }}
    >

      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{
          backgroundColor:
            "rgba(29,158,117,0.1)",
          color: TEAL,
        }}
      >

        <ShoppingCart
          className="h-6 w-6"
        />

      </div>


      <h3 className="text-sm font-semibold text-white">
        {category === "All"
          ? "Your shopping list is empty"
          : `No ${category.toLowerCase()} needed`}
      </h3>


      <p className="mt-2 max-w-sm text-xs leading-5 text-gray-500">

        Add ingredients manually or ask
        FridgeAI to find the missing
        ingredients for a recipe.

      </p>


      <button
        onClick={onAdd}
        className="mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-white transition hover:opacity-90"
        style={{
          backgroundColor:
            TEAL,
        }}
      >

        <Plus className="h-4 w-4" />

        Add an item

      </button>

    </div>

  );
}