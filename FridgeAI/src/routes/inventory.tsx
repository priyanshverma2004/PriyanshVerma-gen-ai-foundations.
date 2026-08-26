import { createFileRoute } from "@tanstack/react-router";
import { AppShell, TEAL } from "@/components/AppShell";
import {
  Plus,
  Search,
  MoreVertical,
  Grid,
  List,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getUser } from "@/utils/auth";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [{ title: "Inventory — FridgeAI" }],
  }),
  component: Inventory,
});

const SORTS = ["Name", "Quantity", "Expiry"];

const FILTERS = [
  "All",
  "Fruit",
  "Vegetable",
  "Dairy",
  "Protein",
  "Spices",
  "Oils",
  "Other",
];
const COLORS = [
  "#3B82F6",
  "#22C55E",
  "#F97316",
  "#EF4444",
  "#A855F7",
  "#06B6D4",
  "#EAB308",
  "#EC4899",
  "#14B8A6",
  "#8B5CF6",
];

function Inventory() {
  // --------------------------------------------------
  // USER / AUTH STATE
  // --------------------------------------------------

  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // --------------------------------------------------
  // INVENTORY STATE
  // --------------------------------------------------

  const [view, setView] = useState<"list" | "grid">("list");
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("Name");
  const [modal, setModal] = useState(false);
  const [menu, setMenu] = useState<number | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --------------------------------------------------
  // FORM STATE
  // --------------------------------------------------

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("pcs");

  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [category, setCategory] = useState("Dairy");
  const [expiryDate, setExpiryDate] = useState("");

  const [search, setSearch] = useState("");

  // --------------------------------------------------
  // GET USER
  // --------------------------------------------------

  useEffect(() => {
    try {
      const currentUser = getUser();

      setUser(currentUser);
    } catch (error) {
      console.error("Failed to get user:", error);
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // --------------------------------------------------
  // FETCH INVENTORY
  // --------------------------------------------------

  const fetchInventory = async () => {
    if (!user?.id) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `http://127.0.0.1:8000/inventory/user/${user.id}`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch inventory: ${response.status}`
        );
      }

      const data = await response.json();

      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch inventory error:", error);

      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // LOAD INVENTORY AFTER USER IS AVAILABLE
  // --------------------------------------------------

  useEffect(() => {
    if (user?.id) {
      fetchInventory();
    }
  }, [user]);

  // --------------------------------------------------
  // OPEN EDIT MODAL
  // --------------------------------------------------

  const openEditModal = (item: any) => {
    setEditing(true);

    setEditingId(item.id);

    setName(item.item_name);

    setQuantity(String(item.quantity));

    setUnit(item.unit);

    setCategory(item.category);

    setExpiryDate(
      item.expiry_date
        ? item.expiry_date.substring(0, 10)
        : ""
    );

    setModal(true);

    setMenu(null);
  };

  // --------------------------------------------------
  // DELETE ITEM
  // --------------------------------------------------

  const deleteItem = async (id: number) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/inventory/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      toast.success("Deleted Successfully");

      await fetchInventory();

      setMenu(null);
    } catch (error) {
      console.error("Delete error:", error);

      toast.error("Delete Failed");
    }
  };

  // --------------------------------------------------
  // RESET FORM
  // --------------------------------------------------

  const resetForm = () => {
    setName("");
    setQuantity("");
    setUnit("pcs");
    setCategory("Dairy");
    setExpiryDate("");

    setEditing(false);
    setEditingId(null);
  };

  // --------------------------------------------------
  // ADD / UPDATE ITEM
  // --------------------------------------------------

  const saveItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error("User not found");
      return;
    }

    if (!name.trim()) {
      toast.error("Please enter item name");
      return;
    }

    if (!quantity || Number(quantity) <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    try {
      const body = {
        user_id: user.id,
        item_name: name.trim(),
        quantity: Number(quantity),
        unit: unit,
        category: category,
        expiry_date: expiryDate || null,
        image: null,
      };

      // ------------------------------------------------
      // UPDATE
      // ------------------------------------------------

      if (editing && editingId !== null) {
        const response = await fetch(
          `http://127.0.0.1:8000/inventory/${editingId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();

          console.error("Update error:", errorText);

          throw new Error("Update failed");
        }

        toast.success("Item Updated");
      }

      // ------------------------------------------------
      // ADD
      // ------------------------------------------------

      else {
        const response = await fetch(
          "http://127.0.0.1:8000/inventory/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();

          console.error("Add error:", errorText);

          throw new Error("Add failed");
        }

        toast.success("Item Added");
      }

      // Reload inventory
      await fetchInventory();

      // Close modal
      setModal(false);

      // Reset form
      resetForm();
    } catch (error) {
      console.error("Save item error:", error);

      toast.error(
        editing
          ? "Failed to update item"
          : "Failed to add item"
      );
    }
  };

  // --------------------------------------------------
  // FILTER + SEARCH + SORT
  // --------------------------------------------------

  const filteredItems = [...items]
    .filter((item) => {
      const itemName =
        item.item_name?.toLowerCase() || "";

      const itemCategory =
        item.category?.toLowerCase() || "";

      const searchText = search.toLowerCase();

      const matchesSearch =
        itemName.includes(searchText) ||
        itemCategory.includes(searchText);

      const matchesCategory =
        filter === "All"
          ? true
          : item.category === filter;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sort) {
        case "Name":
          return (a.item_name || "").localeCompare(
            b.item_name || ""
          );

        case "Quantity":
          return (
            Number(b.quantity || 0) -
            Number(a.quantity || 0)
          );

        case "Expiry":
          return (
            new Date(a.expiry_date || "").getTime() -
            new Date(b.expiry_date || "").getTime()
          );

        default:
          return 0;
      }
    });

  // --------------------------------------------------
  // FORMAT DATE
  // --------------------------------------------------

  const formatDate = (date: string | null) => {
    if (!date) {
      return "No expiry date";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "No expiry date";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  // --------------------------------------------------
  // EXPIRY STATUS
  // --------------------------------------------------

  const getStatus = (date: string | null) => {
    if (!date) {
      return "Fresh";
    }

    const today = new Date();

    const expiry = new Date(date);

    const diff =
      (expiry.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24);

    if (diff < 0) {
      return "Expired";
    }

    if (diff <= 3) {
      return "Expiring Soon";
    }

    return "Fresh";
  };

  // --------------------------------------------------
  // CATEGORY ICON
  // --------------------------------------------------

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Dairy":
        return "🥛";
  
      case "Vegetable":
        return "🥬";
  
      case "Fruit":
        return "🍎";
  
      case "Protein":
        return "🍗";
  
      case "Spices":
        return "🌶️";
  
      case "Oils":
        return "🫒";
  
      case "Other":
        return "📦";
  
      default:
        return "📦";
    }
  };

  // --------------------------------------------------
  // AUTH LOADING
  // --------------------------------------------------

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-gray-400">
          Loading...
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // NO USER
  // --------------------------------------------------

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-gray-400">
          Please login to view your inventory.
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <AppShell
      title="Your inventory"
      actions={
        <>
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

            <input
              placeholder="Search items..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-[280px] rounded-lg py-2 pl-9 pr-3 text-sm text-white outline-none focus:ring-2"
              style={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #2a2a2a",
              }}
            />
          </div>

          {/* Add item */}
          <button
            onClick={() => {
              resetForm();
              setModal(true);
            }}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white"
            style={{
              backgroundColor: TEAL,
            }}
          >
            <Plus className="h-4 w-4" />

            Add item
          </button>
        </>
      }
    >
      {/* ------------------------------------------------ */}
      {/* FILTERS */}
      {/* ------------------------------------------------ */}

      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="shrink-0 rounded-full px-3 py-1.5 text-sm"
            style={{
              backgroundColor:
                filter === f
                  ? TEAL
                  : "#1a1a1a",

              color:
                filter === f
                  ? "#fff"
                  : "#d1d5db",

              border:
                `1px solid ${
                  filter === f
                    ? TEAL
                    : "#2a2a2a"
                }`,
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ------------------------------------------------ */}
      {/* SORT + VIEW */}
      {/* ------------------------------------------------ */}

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm text-gray-400">
          <span>Sort by:</span>

          {SORTS.map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className="px-2 py-1"
              style={{
                color:
                  sort === s
                    ? "#fff"
                    : "#9ca3af",

                borderBottom:
                  sort === s
                    ? `2px solid ${TEAL}`
                    : "2px solid transparent",
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* View switch */}
        <div
          className="flex gap-1 rounded-lg p-1"
          style={{
            backgroundColor: "#1a1a1a",
            border: "1px solid #2a2a2a",
          }}
        >
          <button
            onClick={() => setView("list")}
            className="rounded p-1.5"
            style={{
              backgroundColor:
                view === "list"
                  ? "#2a2a2a"
                  : "transparent",
            }}
          >
            <List className="h-4 w-4 text-white" />
          </button>

          <button
            onClick={() => setView("grid")}
            className="rounded p-1.5"
            style={{
              backgroundColor:
                view === "grid"
                  ? "#2a2a2a"
                  : "transparent",
            }}
          >
            <Grid className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------ */}
      {/* LOADING */}
      {/* ------------------------------------------------ */}

      {loading ? (
        <div
          className="rounded-xl p-10 text-center"
          style={{
            backgroundColor: "#1a1a1a",
            border: "1px solid #2a2a2a",
          }}
        >
          <p className="text-gray-400">
            Loading inventory...
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        /* ------------------------------------------------ */
        /* EMPTY STATE */
        /* ------------------------------------------------ */

        <div
          className="rounded-xl p-10 text-center"
          style={{
            backgroundColor: "#1a1a1a",
            border: "1px solid #2a2a2a",
          }}
        >
          <div className="mb-3 text-5xl">
            📦
          </div>

          <h3 className="text-lg font-semibold text-white">
            No items found
          </h3>

          <p className="mt-1 text-sm text-gray-400">
            {filter === "All"
              ? "Add an item to your inventory."
              : `No items in ${filter}.`}
          </p>

          {filter === "All" && (
            <button
              onClick={() => {
                resetForm();
                setModal(true);
              }}
              className="mt-4 rounded-lg px-4 py-2 text-sm font-medium text-white"
              style={{
                backgroundColor: TEAL,
              }}
            >
              <Plus className="mr-1 inline h-4 w-4" />
              Add item
            </button>
          )}
        </div>
      ) : view === "list" ? (
        /* ------------------------------------------------ */
        /* LIST VIEW */
        /* ------------------------------------------------ */

        <div
          className="rounded-xl"
          style={{
            backgroundColor: "#1a1a1a",
            border: "1px solid #2a2a2a",
          }}
        >
          {filteredItems.map((it, i) => (
            <div
              key={it.id}
              className="grid grid-cols-[420px_220px_180px_60px] items-center p-5 transition-all hover:bg-white/5"
              style={{
                borderTop:
                  i
                    ? "1px solid #2a2a2a"
                    : "none",
              }}
            >
              {/* LEFT */}
              <div className="flex items-center gap-4">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-xl text-2xl"
                  style={{
                    backgroundColor:
                      COLORS[
                        i % COLORS.length
                      ],
                  }}
                >
                  {getCategoryIcon(
                    it.category
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {it.item_name}
                  </h3>

                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className="rounded-full px-2 py-1 text-xs font-semibold text-white"
                      style={{
                        backgroundColor:
                          COLORS[
                            i %
                              COLORS.length
                          ],
                      }}
                    >
                      {it.category}
                    </span>

                    <span className="text-xs text-gray-400">
                      {it.quantity}{" "}
                      {it.unit}
                    </span>
                  </div>
                </div>
              </div>

              {/* EXPIRY */}
              <div className="hidden lg:block">
                <div className="text-sm text-gray-400">
                  Expiry
                </div>

                <div className="font-medium text-white">
                  {formatDate(
                    it.expiry_date
                  )}
                </div>
              </div>

              {/* STATUS */}
              <div className="hidden justify-center md:flex">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    getStatus(
                      it.expiry_date
                    ) === "Fresh"
                      ? "bg-green-500/20 text-green-400"
                      : getStatus(
                            it.expiry_date
                          ) ===
                          "Expiring Soon"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {getStatus(
                    it.expiry_date
                  )}
                </span>
              </div>

              {/* MENU */}
              <div className="relative flex justify-end">
                <button
                  onClick={() =>
                    setMenu(
                      menu === it.id
                        ? null
                        : it.id
                    )
                  }
                  className="rounded-lg p-2 hover:bg-white/10"
                >
                  <MoreVertical className="h-5 w-5 text-gray-400" />
                </button>

                {menu === it.id && (
                  <div
                    className="absolute right-0 top-full z-20 mt-1 w-40 rounded-lg p-1 shadow-xl"
                    style={{
                      backgroundColor:
                        "#1a1a1a",
                      border:
                        "1px solid #2a2a2a",
                    }}
                  >
                    <button
                      onClick={() =>
                        openEditModal(it)
                      }
                      className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-white/5"
                    >
                      ✏️ Edit
                    </button>

                    <button
                      onClick={() =>
                        deleteItem(it.id)
                      }
                      className="block w-full rounded px-3 py-2 text-left text-sm text-red-400 hover:bg-white/5"
                    >
                      🗑 Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ------------------------------------------------ */
        /* GRID VIEW */
        /* ------------------------------------------------ */

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {filteredItems.map((it, i) => (
            <div
              key={it.id}
              className="overflow-hidden rounded-xl"
              style={{
                backgroundColor: "#1a1a1a",
                border:
                  "1px solid #2a2a2a",
              }}
            >
              <div
                className="h-2"
                style={{
                  backgroundColor:
                    COLORS[
                      i % COLORS.length
                    ],
                }}
              />

              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {it.item_name}
                    </h3>

                    <span
                      className="mt-2 inline-block rounded-full px-2 py-1 text-xs font-semibold text-white"
                      style={{
                        backgroundColor:
                          COLORS[
                            i %
                              COLORS.length
                          ],
                      }}
                    >
                      {it.category}
                    </span>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() =>
                        setMenu(
                          menu === it.id
                            ? null
                            : it.id
                        )
                      }
                      className="rounded-lg p-2 hover:bg-white/10"
                    >
                      <MoreVertical className="h-5 w-5 text-gray-400" />
                    </button>

                    {menu === it.id && (
                      <div
                        className="absolute right-0 top-full z-20 mt-1 w-40 rounded-lg p-1 shadow-xl"
                        style={{
                          backgroundColor:
                            "#1a1a1a",
                          border:
                            "1px solid #2a2a2a",
                        }}
                      >
                        <button
                          onClick={() =>
                            openEditModal(it)
                          }
                          className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-white/5"
                        >
                          ✏️ Edit
                        </button>

                        <button
                          onClick={() =>
                            deleteItem(it.id)
                          }
                          className="block w-full rounded px-3 py-2 text-left text-sm text-red-400 hover:bg-white/5"
                        >
                          🗑 Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">
                      Quantity
                    </span>

                    <span className="font-medium text-white">
                      {it.quantity}{" "}
                      {it.unit}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">
                      Expiry
                    </span>

                    <span className="text-white">
                      {formatDate(
                        it.expiry_date
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">
                      Status
                    </span>

                    <span
                      className={`font-medium ${
                        getStatus(
                          it.expiry_date
                        ) === "Fresh"
                          ? "text-green-400"
                          : getStatus(
                                it.expiry_date
                              ) ===
                              "Expiring Soon"
                            ? "text-yellow-400"
                            : "text-red-400"
                      }`}
                    >
                      {getStatus(
                        it.expiry_date
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ------------------------------------------------ */}
      {/* ADD / EDIT MODAL */}
      {/* ------------------------------------------------ */}

      {modal && (
        <Modal
          onClose={() => {
            setModal(false);
            resetForm();
          }}
          title={
            editing
              ? "Edit item"
              : "Add item"
          }
        >
          <form
            onSubmit={saveItem}
            className="space-y-3"
          >
            {/* NAME */}
            <Field label="Name">
              <input
                required
                className="field"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="e.g. Turmeric"
              />
            </Field>

            {/* QUANTITY */}
            <Field label="Quantity">
              <input
                required
                type="number"
                min="0"
                step="any"
                className="field"
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    e.target.value
                  )
                }
                placeholder="e.g. 500"
              />
            </Field>

            {/* UNIT */}
            <Field label="Unit">
              <select
                className="field"
                value={unit}
                onChange={(e) =>
                  setUnit(e.target.value)
                }
              >
                <option>pcs</option>
                <option>g</option>
                <option>kg</option>
                <option>ml</option>
                <option>L</option>
              </select>
            </Field>

            {/* CATEGORY */}
            <Field label="Category">
              <select
                className="field"
                value={category}
                onChange={(e) =>
                  setCategory(
                    e.target.value
                  )
                }
              >
                <option value="Fruit">Fruit</option>
<option value="Vegetable">Vegetable</option>
<option value="Dairy">Dairy</option>
<option value="Protein">Protein</option>
<option value="Spices">Spices</option>
<option value="Oils">Oils</option>
<option value="Other">Other</option>
              </select>
            </Field>

            {/* EXPIRY */}
            <Field label="Expiry date">
              <input
                type="date"
                className="field"
                value={expiryDate}
                onChange={(e) =>
                  setExpiryDate(
                    e.target.value
                  )
                }
              />
            </Field>

            {/* BUTTONS */}
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 rounded-lg py-2 text-sm font-medium text-white"
                style={{
                  backgroundColor: TEAL,
                }}
              >
                {editing
                  ? "Update item"
                  : "Save item"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setModal(false);
                  resetForm();
                }}
                className="flex-1 rounded-lg py-2 text-sm text-white"
                style={{
                  border:
                    "1px solid #2a2a2a",
                }}
              >
                Cancel
              </button>
            </div>
          </form>

          <style>
            {`
              .field {
                width: 100%;
                border-radius: 0.5rem;
                background: #0f0f0f;
                border: 1px solid #2a2a2a;
                color: #fff;
                padding: 0.55rem 0.75rem;
                font-size: 0.875rem;
                outline: none;
              }

              .field:focus {
                border-color: ${TEAL};
              }

              .field option {
                background: #0f0f0f;
                color: #fff;
              }
            `}
          </style>
        </Modal>
      )}
    </AppShell>
  );
}

// ======================================================
// FIELD COMPONENT
// ======================================================

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-gray-400">
        {label}
      </label>

      {children}
    </div>
  );
}

// ======================================================
// MODAL COMPONENT
// ======================================================

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-4 animate-in fade-in"
      style={{
        backgroundColor:
          "rgba(0,0,0,0.6)",
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] rounded-2xl p-6 animate-in zoom-in-95"
        style={{
          backgroundColor: "#1a1a1a",
          border:
            "1px solid #2a2a2a",
        }}
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}