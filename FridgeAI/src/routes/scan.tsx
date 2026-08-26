import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  UploadCloud,
  Camera,
  Mic,
  Brain,
  X,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getUser } from "@/utils/auth";
import { AppShell, TEAL } from "@/components/AppShell";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [{ title: "Scan fridge — FridgeAI" }],
  }),
  component: Scan,
});


// =========================================================
// TYPES
// =========================================================

type Tab =
  | "camera"
  | "voice"
  | "type";


type DetectedItem = {
  item_name: string;
  quantity: number;
  unit: string;
  category: string;
  expiry_date: string | null;
};


// =========================================================
// AI SUPPORTED CATEGORIES
// =========================================================

const AI_CATEGORIES = [
  "Fruit",
  "Vegetable",
  "Dairy",
  "Protein",
  "Spices",
  "Oils",
];


// =========================================================
// NORMALIZE AI CATEGORY
// =========================================================

const normalizeCategory = (
  category: string | null | undefined
): string => {

  if (!category) {
    return "Other";
  }

  const normalized =
    category
      .trim()
      .toLowerCase();

  const match =
    AI_CATEGORIES.find(
      (allowedCategory) =>
        allowedCategory.toLowerCase() ===
        normalized
    );

  if (match) {
    return match;
  }

  // If AI returns anything outside
  // the six supported categories,
  // do not force a category.
  return "Other";
};


// =========================================================
// MAIN COMPONENT
// =========================================================

function Scan() {

  const nav = useNavigate();

  // =======================================================
  // STATE
  // =======================================================

  const [tab, setTab] =
    useState<Tab>("camera");

  const [newItem, setNewItem] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [file, setFile] =
    useState<File | null>(null);

  const [recognition, setRecognition] =
    useState<any>(null);

  const [items, setItems] =
    useState<DetectedItem[]>([]);

  const [preview, setPreview] =
    useState<string | null>(null);

  const [recording, setRecording] =
    useState(false);

  const [transcript, setTranscript] =
    useState("");

  const [typed, setTyped] =
    useState("");

  const user = getUser();


  // =======================================================
  // AUTH
  // =======================================================

  if (!user) {
    return null;
  }


  // =======================================================
  // SCAN IMAGE
  // =======================================================

  const scanImage = async () => {

    if (!file) {

      toast.error(
        "Please select an image first."
      );

      return;
    }


    setLoading(true);


    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );


    try {

      const response =
        await fetch(
          "http://127.0.0.1:8000/scan",
          {
            method: "POST",
            body: formData,
          }
        );


      if (!response.ok) {

        throw new Error(
          "Scan failed"
        );
      }


      const data =
        await response.json();


      // =================================================
      // AI DETECTED ITEMS
      // =================================================

      const detectedItems: DetectedItem[] =
        (data.items || []).map(
          (item: any) => ({

            item_name:
              item.item_name ||
              "Unknown item",

            quantity:
              Number(
                item.quantity || 1
              ),

            unit:
              item.unit ||
              "pcs",

            // IMPORTANT:
            // Category comes from AI.
            // We DO NOT use our own
            // keyword/category rules.

            category:
              normalizeCategory(
                item.category
              ),

            expiry_date:
              item.expiry_date ||
              null,
          })
        );


      setItems(
        detectedItems
      );


      if (
        detectedItems.length === 0
      ) {

        toast.warning(
          "No food items were detected."
        );

      } else {

        toast.success(
          `${detectedItems.length} item(s) detected by AI`
        );
      }


    } catch (error) {

      console.error(
        "Scan error:",
        error
      );

      toast.error(
        "Unable to scan image."
      );

    } finally {

      setLoading(false);
    }
  };


  // =======================================================
  // SAVE INVENTORY
  // =======================================================

  const saveInventory = async () => {

    if (items.length === 0) {

      toast.error(
        "No items to save."
      );

      return;
    }


    try {

      const response =
        await fetch(
          "http://127.0.0.1:8000/inventory/save",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({

              user_id:
                user.id,

              items:
                items.map(
                  (item) => ({
                    ...item,

                    // Final category
                    // comes from AI or
                    // Other fallback.
                    category:
                      normalizeCategory(
                        item.category
                      ),
                  })
                ),
            }),
          }
        );


      if (!response.ok) {

        throw new Error(
          "Failed to save inventory"
        );
      }


      const data =
        await response.json();


      toast.success(
        data.message ||
        "Inventory saved successfully"
      );


      nav({
        to: "/inventory",
      });


    } catch (error) {

      console.error(
        "Save inventory error:",
        error
      );

      toast.error(
        "Unable to save inventory."
      );
    }
  };


  // =======================================================
  // PARSE MANUAL / VOICE ITEMS
  // =======================================================

  const parseTypedItems = (
    text: string
  ): DetectedItem[] => {

    const unitMap:
      Record<string, string> = {

      kg: "kg",

      g: "g",

      gm: "g",

      gram: "g",

      grams: "g",

      ml: "ml",

      l: "L",

      litre: "L",

      liter: "L",

      litres: "L",

      liters: "L",

      pcs: "pcs",

      piece: "pcs",

      pieces: "pcs",

      bottle: "bottle",

      bottles: "bottle",

      pack: "pack",

      packs: "pack",
    };


    return text

      .split("\n")

      .map(
        (line) =>
          line.trim()
      )

      .filter(Boolean)

      .map((line) => {

        let quantity = 1;

        let unit = "pcs";

        let itemName = line;


        const match =
          line.match(
            /^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?\s+(.*)$/i
          );


        if (match) {

          quantity =
            Number(
              match[1]
            );


          if (match[2]) {

            const u =
              match[2]
                .toLowerCase();


            if (
              unitMap[u]
            ) {

              unit =
                unitMap[u];

            } else {

              itemName =
                `${match[2]} ${match[3]}`;

              return {

                item_name:
                  itemName.trim(),

                quantity,

                unit,

                // Manual input:
                // DO NOT GUESS CATEGORY
                category:
                  "Other",

                expiry_date:
                  "",
              };
            }
          }


          itemName =
            match[3];
        }


        return {

          item_name:
            itemName.trim(),

          quantity,

          unit,

          // Manual / voice input
          // does NOT use our own
          // category prediction.
          category:
            "Other",

          expiry_date:
            "",
        };
      });
  };


  // =======================================================
  // VOICE RECOGNITION
  // =======================================================

  const startVoiceRecognition =
    () => {

      const SpeechRecognition =
        (window as any)
          .SpeechRecognition ||
        (window as any)
          .webkitSpeechRecognition;


      if (!SpeechRecognition) {

        toast.error(
          "Speech recognition is not supported in this browser."
        );

        return;
      }


      const speech =
        new SpeechRecognition();


      speech.lang =
        "en-IN";

      speech.interimResults =
        false;

      speech.continuous =
        false;


      speech.onstart =
        () => {

          setRecording(
            true
          );
        };


      speech.onend =
        () => {

          setRecording(
            false
          );
        };


      speech.onerror =
        (event: any) => {

          console.error(
            "Voice error:",
            event
          );

          setRecording(
            false
          );

          toast.error(
            "Voice recognition failed."
          );
        };


      speech.onresult =
        (event: any) => {

          const text =
            event.results[0][0]
              .transcript;


          setTranscript(
            text
          );


          const parsedItems =
            parseTypedItems(
              text.replace(
                /,/g,
                "\n"
              )
            );


          setItems(
            (previous) => [
              ...previous,
              ...parsedItems,
            ]
          );


          toast.success(
            `${parsedItems.length} item(s) added`
          );
        };


      setRecognition(
        speech
      );


      speech.start();
    };


  // =======================================================
  // REMOVE ITEM
  // =======================================================

  const removeItem = (
    index: number
  ) => {

    setItems(
      (previous) =>
        previous.filter(
          (_, i) =>
            i !== index
        )
    );
  };


  // =======================================================
  // UPDATE ITEM
  // =======================================================

  const updateItem = (
    index: number,
    field: keyof DetectedItem,
    value: any
  ) => {

    setItems(
      (previous) => {

        const updated =
          [...previous];

        updated[index] = {
          ...updated[index],
          [field]: value,
        };

        return updated;
      }
    );
  };


  // =======================================================
  // ADD MANUAL ITEM
  // =======================================================

  const addManualItem =
    () => {

      if (!newItem.trim()) {

        toast.error(
          "Enter an item name."
        );

        return;
      }


      setItems(
        (previous) => [

          ...previous,

          {

            item_name:
              newItem.trim(),

            quantity:
              1,

            unit:
              "pcs",

            // No category
            // prediction for
            // manual items.
            category:
              "Other",

            expiry_date:
              "",
          },
        ]
      );


      setNewItem("");


      toast.success(
        "Item added. Select its category before saving."
      );
    };


  // =======================================================
  // UI
  // =======================================================

  return (

    <AppShell
      title="Scan your fridge"
    >

      <div className="grid gap-6 lg:grid-cols-[55%_45%]">

        {/* ================================================= */}
        {/* LEFT */}
        {/* ================================================= */}

        <div>

          <h2 className="mb-3 text-lg font-semibold text-white">
            Add to your fridge
          </h2>


          {/* TABS */}

          <div
            className="mb-4 inline-flex rounded-full p-1"
            style={{
              backgroundColor:
                "#1a1a1a",

              border:
                "1px solid #2a2a2a",
            }}
          >

            {(
              [
                "camera",
                "voice",
                "type",
              ] as Tab[]
            ).map(
              (tabName) => (

                <button
                  key={tabName}
                  onClick={() =>
                    setTab(
                      tabName
                    )
                  }
                  className="rounded-full px-4 py-1.5 text-sm capitalize"
                  style={{
                    backgroundColor:
                      tab ===
                      tabName
                        ? TEAL
                        : "transparent",

                    color:
                      tab ===
                      tabName
                        ? "#fff"
                        : "#9ca3af",
                  }}
                >

                  {tabName ===
                  "camera"
                    ? "Camera / Upload"
                    : tabName ===
                      "voice"
                    ? "Voice input"
                    : "Type manually"}

                </button>
              )
            )}

          </div>


          {/* ================================================= */}
          {/* CAMERA */}
          {/* ================================================= */}

          {tab ===
            "camera" && (

            <div>

              <label
                className="block cursor-pointer rounded-xl p-10 text-center transition-colors"
                style={{
                  backgroundColor:
                    "#1a1a1a",

                  border:
                    `2px dashed ${TEAL}`,
                }}
              >

                {preview ? (

                  <div className="relative">

                    <img
                      src={preview}
                      alt="Fridge preview"
                      className="mx-auto max-h-60 rounded-lg"
                    />


                    <button
                      onClick={(
                        event
                      ) => {

                        event.preventDefault();

                        setPreview(
                          null
                        );

                        setFile(
                          null
                        );
                      }}
                      className="absolute right-2 top-2 rounded-full bg-black/70 p-1 text-white"
                    >

                      <X className="h-4 w-4" />

                    </button>

                  </div>

                ) : (

                  <>

                    <UploadCloud
                      className="mx-auto h-12 w-12"
                      style={{
                        color: TEAL,
                      }}
                    />


                    <div className="mt-3 font-semibold text-white">
                      Drop your fridge photo here
                    </div>


                    <div className="text-sm text-gray-400">
                      or click to browse
                    </div>


                    <div className="mt-1 text-xs text-gray-500">
                      Supports JPG, PNG up to 10MB
                    </div>

                  </>
                )}


                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(
                    event
                  ) => {

                    const selectedFile =
                      event.target.files?.[0];

                    if (!selectedFile) {
                      return;
                    }

                    setFile(
                      selectedFile
                    );

                    setPreview(
                      URL.createObjectURL(
                        selectedFile
                      )
                    );
                  }}
                />

              </label>


              <button
                className="mt-3 flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-white"
                style={{
                  border:
                    "1px solid #2a2a2a",
                }}
              >

                <Camera className="h-4 w-4" />

                Or use your camera

              </button>

            </div>
          )}


          {/* ================================================= */}
          {/* VOICE */}
          {/* ================================================= */}

          {tab ===
            "voice" && (

            <div
              className="rounded-xl p-8 text-center"
              style={{
                backgroundColor:
                  "#1a1a1a",

                border:
                  "1px solid #2a2a2a",
              }}
            >

              <Mic
                className="mx-auto h-16 w-16"
                style={{
                  color: TEAL,
                }}
              />


              <div className="mt-3 font-semibold text-white">

                {recording
                  ? "Listening..."
                  : "Click to start recording"}

              </div>


              <p className="mt-1 text-sm text-gray-400">
                Speak your ingredients naturally
              </p>


              <button
                onClick={() => {

                  if (!recording) {

                    startVoiceRecognition();

                  } else {

                    recognition?.stop();

                  }
                }}
                className="mx-auto mt-6 grid h-20 w-20 place-items-center rounded-full transition-all"
                style={{
                  backgroundColor:
                    recording
                      ? "#dc2626"
                      : TEAL,

                  boxShadow:
                    recording
                      ? "0 0 0 8px rgba(220,38,38,0.3)"
                      : "none",
                }}
              >

                <Mic className="h-8 w-8 text-white" />

              </button>


              {transcript && (

                <div
                  className="mt-6 rounded-lg p-3 text-left text-sm text-gray-200"
                  style={{
                    backgroundColor:
                      "#0f0f0f",
                  }}
                >

                  "{transcript}"

                </div>
              )}

            </div>
          )}


          {/* ================================================= */}
          {/* TYPE MANUALLY */}
          {/* ================================================= */}

          {tab ===
            "type" && (

            <div>

              <textarea
                value={typed}
                onChange={(
                  event
                ) =>
                  setTyped(
                    event.target.value
                  )
                }
                placeholder={`List your ingredients, one per line...
For example:
Milk, 500ml
6 eggs
200g spinach`}
                rows={8}
                className="w-full rounded-xl p-4 text-white outline-none focus:ring-2"
                style={{
                  backgroundColor:
                    "#1a1a1a",

                  border:
                    "1px solid #2a2a2a",
                }}
              />


              <button
                onClick={() => {

                  if (!typed.trim()) {

                    toast.error(
                      "Enter some ingredients"
                    );

                    return;
                  }


                  const parsedItems =
                    parseTypedItems(
                      typed
                    );


                  setItems(
                    (previous) => [
                      ...previous,
                      ...parsedItems,
                    ]
                  );


                  toast.success(
                    `${parsedItems.length} item(s) added`
                  );


                  setTyped("");

                }}
                className="mt-3 rounded-lg px-4 py-2 text-sm font-medium text-white"
                style={{
                  backgroundColor:
                    TEAL,
                }}
              >

                Add items

              </button>

            </div>
          )}


          {/* ================================================= */}
          {/* SCAN BUTTON */}
          {/* ================================================= */}

          <button
            disabled={
              loading ||
              !file
            }
            onClick={
              scanImage
            }
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              backgroundColor:
                TEAL,
            }}
          >

            {loading && (

              <Loader2
                className="h-4 w-4 animate-spin"
              />

            )}

            {loading
              ? "AI is analyzing..."
              : "Scan and detect items"}

          </button>


          {/* ================================================= */}
          {/* AI CATEGORY INFORMATION */}
          {/* ================================================= */}

          <div
            className="mt-4 rounded-xl p-4"
            style={{
              backgroundColor:
                "rgba(29,158,117,0.08)",

              border:
                "1px solid rgba(29,158,117,0.25)",
            }}
          >

            <div className="font-semibold text-white">
              AI Categories
            </div>

            <p className="mt-1 text-sm text-gray-400">
              The AI can classify scanned food into:
            </p>

            <div className="mt-3 flex flex-wrap gap-2">

              {AI_CATEGORIES.map(
                (category) => (

                  <span
                    key={category}
                    className="rounded-full px-3 py-1 text-xs"
                    style={{
                      backgroundColor:
                        "rgba(29,158,117,0.15)",

                      color:
                        TEAL,
                    }}
                  >
                    {category}
                  </span>

                )
              )}

            </div>

            <p className="mt-3 text-xs text-gray-500">
              Items outside these categories are
              marked as Other and are not automatically
              classified.
            </p>

          </div>

        </div>


        {/* ================================================= */}
        {/* RIGHT - DETECTED ITEMS */}
        {/* ================================================= */}

        <div>

          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">

            Detected items

            <span
              className="rounded-full px-2 py-0.5 text-xs"
              style={{
                backgroundColor:
                  "rgba(29,158,117,0.2)",

                color:
                  TEAL,
              }}
            >
              {items.length}
            </span>

          </h2>


          <div
            className="space-y-4 overflow-y-auto"
            style={{
              maxHeight:
                "500px",
            }}
          >

            {items.length ===
              0 && (

              <div
                className="rounded-xl p-8 text-center text-sm text-gray-500"
                style={{
                  backgroundColor:
                    "#1a1a1a",

                  border:
                    "1px solid #2a2a2a",
                }}
              >
                Scan an image to detect
                ingredients.
              </div>

            )}


            {items.map(
              (
                item,
                index
              ) => (

                <div
                  key={index}
                  className="rounded-xl p-4"
                  style={{
                    background:
                      "#1a1a1a",

                    border:
                      "1px solid #2a2a2a",
                  }}
                >

                  {/* ITEM HEADER */}

                  <div className="flex items-center justify-between">

                    <div>

                      <h3 className="font-semibold text-white text-lg">
                        {item.item_name}
                      </h3>


                      <span
                        className="mt-1 inline-block rounded-full px-2 py-1 text-xs"
                        style={{
                          backgroundColor:
                            item.category ===
                            "Other"
                              ? "rgba(156,163,175,0.15)"
                              : "rgba(29,158,117,0.15)",

                          color:
                            item.category ===
                            "Other"
                              ? "#9ca3af"
                              : TEAL,
                        }}
                      >

                        {item.category ===
                        "Other"
                          ? "AI: Not classified"
                          : `AI: ${item.category}`}

                      </span>

                    </div>


                    <button
                      onClick={() =>
                        removeItem(
                          index
                        )
                      }
                      className="text-red-400 hover:text-red-500"
                    >

                      <X size={18} />

                    </button>

                  </div>


                  {/* FIELDS */}

                  <div className="mt-4 grid grid-cols-2 gap-4">

                    {/* QUANTITY */}

                    <div>

                      <label className="text-xs text-gray-400">
                        Quantity
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={
                          item.quantity
                        }
                        onChange={(
                          event
                        ) =>
                          updateItem(
                            index,
                            "quantity",
                            Number(
                              event.target.value
                            )
                          )
                        }
                        className="mt-1 w-full rounded-lg bg-[#0f0f0f] border border-[#2a2a2a] px-3 py-2 text-white"
                      />

                    </div>


                    {/* UNIT */}

                    <div>

                      <label className="text-xs text-gray-400">
                        Unit
                      </label>

                      <select
                        value={
                          item.unit
                        }
                        onChange={(
                          event
                        ) =>
                          updateItem(
                            index,
                            "unit",
                            event.target.value
                          )
                        }
                        className="mt-1 w-full rounded-lg bg-[#0f0f0f] border border-[#2a2a2a] px-3 py-2 text-white"
                      >

                        <option>
                          pcs
                        </option>

                        <option>
                          kg
                        </option>

                        <option>
                          g
                        </option>

                        <option>
                          L
                        </option>

                        <option>
                          ml
                        </option>

                        <option>
                          bottle
                        </option>

                        <option>
                          pack
                        </option>

                      </select>

                    </div>


                    {/* CATEGORY */}

                    <div>

                      <label className="text-xs text-gray-400">
                        Category
                      </label>

                      <select
                        value={
                          item.category
                        }
                        onChange={(
                          event
                        ) =>
                          updateItem(
                            index,
                            "category",
                            event.target.value
                          )
                        }
                        className="mt-1 w-full rounded-lg bg-[#0f0f0f] border border-[#2a2a2a] px-3 py-2 text-white"
                      >

                        <option value="Other">
                          Other / Not classified
                        </option>

                        {AI_CATEGORIES.map(
                          (
                            category
                          ) => (

                            <option
                              key={
                                category
                              }
                              value={
                                category
                              }
                            >
                              {category}
                            </option>

                          )
                        )}

                      </select>

                    </div>


                    {/* EXPIRY */}

                    <div>

                      <label className="text-xs text-gray-400">
                        Expiry Date
                      </label>

                      <input
                        type="date"
                        value={
                          item.expiry_date ??
                          ""
                        }
                        onChange={(
                          event
                        ) =>
                          updateItem(
                            index,
                            "expiry_date",
                            event.target.value
                          )
                        }
                        className="mt-1 w-full rounded-lg bg-[#0f0f0f] border border-[#2a2a2a] px-3 py-2 text-white"
                      />

                    </div>

                  </div>

                </div>
              )
            )}

          </div>


          {/* ================================================= */}
          {/* MANUAL ADD */}
          {/* ================================================= */}

          <div className="mt-4 flex gap-2">

            <input
              value={
                newItem
              }
              onChange={(
                event
              ) =>
                setNewItem(
                  event.target.value
                )
              }
              placeholder="Add item manually"
              className="flex-1 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2"
              style={{
                backgroundColor:
                  "#1a1a1a",

                border:
                  "1px solid #2a2a2a",
              }}
            />


            <button
              onClick={
                addManualItem
              }
              className="rounded-lg px-4 py-2 text-sm font-medium text-white"
              style={{
                backgroundColor:
                  TEAL,
              }}
            >

              Add

            </button>

          </div>


          {/* ================================================= */}
          {/* SAVE */}
          {/* ================================================= */}

          <div
            className="mt-4 rounded-xl p-4"
            style={{
              backgroundColor:
                "rgba(29,158,117,0.1)",

              border:
                "1px solid rgba(29,158,117,0.3)",
            }}
          >

            <div className="flex items-start gap-3">

              <Brain
                className="h-5 w-5 shrink-0"
                style={{
                  color: TEAL,
                }}
              />


              <div>

                <div className="font-semibold text-white">
                  AI detected{" "}
                  {items.length}{" "}
                  items
                </div>


                <p className="text-sm text-gray-400">
                  Review the AI category before
                  saving to your inventory.
                </p>

              </div>

            </div>


            <button
              disabled={
                items.length ===
                0
              }
              onClick={
                saveInventory
              }
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-white disabled:opacity-50"
              style={{
                backgroundColor:
                  TEAL,
              }}
            >

              Go to Inventory

            </button>

          </div>

        </div>

      </div>

    </AppShell>
  );
}


export default Scan;