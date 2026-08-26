// import { createFileRoute, useNavigate } from "@tanstack/react-router";
// import { AppShell, TEAL } from "@/components/AppShell";
// import { useEffect, useRef, useState } from "react";
// import { getUser } from "@/utils/auth";
// import {
//   ChefHat,
//   MoreVertical,
//   Mic,
//   Send,
//   Plus,
//   MessageSquare,
//   Trash2
// } from "lucide-react";
// export const Route = createFileRoute("/chat")({
//   head: () => ({ meta: [{ title: "AI Chat — FridgeAI" }] }),
//   component: Chat,
// });

// type Msg = { role: "ai" | "user"; text: string; chips?: { label: string; action: "msg" | "recipe" }[] };


// function Chat() {
//   const nav = useNavigate();

//   const user = getUser();
//   if (!user) {

//     nav({
//       to: "/login"
//     });

//     return null;

//   }
//   const INITIAL: Msg[] = [

//     {

//       role: "ai",

//       text: `Hi ${user.name}! 👋

// I'm your personal FridgeAI Chef.

// I already know your inventory and food preferences.

// How can I help you today?`

//     }

//   ];
//   const [msgs, setMsgs] = useState<Msg[]>([]);
//   const [typing, setTyping] = useState(false);
//   const [input, setInput] = useState("");
//   const [activeConversation, setActiveConversation] = useState<number | null>(null);

//   const [conversations, setConversations] = useState<any[]>([]);
//   const scroll = useRef<HTMLDivElement>(null);

//   const loadChatHistory = async (conversationId: number) => {

//     try {

//       const response = await fetch(
//         `http://127.0.0.1:8000/chat/history/${conversationId}`
//       );

//       const data = await response.json();

//       if (data.length > 0) {

//         setMsgs(
//           data.map((m: any) => ({
//             role: m.role === "assistant" ? "ai" : "user",
//             text: m.message,
//           }))
//         );

//       } else {

//         setMsgs(INITIAL);

//       }

//     } catch (err) {

//       console.log(err);

//       setMsgs(INITIAL);

//     }

//   };
//   const deleteConversation = async (id: number) => {

//     const ok = window.confirm(
//       "Delete this conversation?"
//     );

//     if (!ok) return;

//     await fetch(
//       `http://127.0.0.1:8000/conversation/${id}`,
//       {
//         method: "DELETE",
//       }
//     );

//     await loadConversations();

//     if (activeConversation === id) {

//       setMsgs(INITIAL);

//       setActiveConversation(null);

//     }

//   };
//   const loadConversations = async () => {

//     const res = await fetch(
//       `http://127.0.0.1:8000/conversation/${user.id}`
//     );

//     const data = await res.json();
//     console.log(data);
//     setConversations(data);

//     if (data.length > 0) {

//       setActiveConversation(data[0].id);

//       loadChatHistory(data[0].id);

//     } else {

//       setMsgs(INITIAL);

//     }

//   };
//   useEffect(() => {

//     loadConversations();

//   }, []);

//   useEffect(() => {

//     scroll.current?.scrollTo({
//       top: scroll.current.scrollHeight,
//       behavior: "smooth"
//     });

//   }, [msgs, typing]);
//   const send = async (text: string) => {
//     if (!text.trim()) return;
//     setMsgs((m) => [...m, { role: "user", text }]);
//     setInput("");
//     setTyping(true);
//     try {

//       const response = await fetch("http://127.0.0.1:8000/chat", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           user_id: user.id,
//           conversation_id: activeConversation,

//           message: text,
//         }),

//       });
//       if (!response.ok) {

//         throw new Error("Server Error");

//       }
//       const data = await response.json();

//       setMsgs((m) => [
//         ...m,
//         {
//           role: "ai",
//           text: data.reply || "I couldn't generate a response.",
//         },
//       ]);
//       if (activeConversation) {
//         loadChatHistory(activeConversation);
//       }
//     } catch (error) {

//       setMsgs((m) => [
//         ...m,
//         {
//           role: "ai",
//           text: "first create new chat :).",
//         },
//       ]);

//     } finally {
//       setTyping(false);
//     }
//   };

//   const onChip = (c: { label: string; action: "msg" | "recipe" }) => {
//     if (c.action === "recipe") nav({
//       to: "/recipe/$id", params: {
//         id: c.label.toLowerCase().replace(/\s+/g, "-")
//       }
//     });
//     else send(c.label);
//   };
//   useEffect(() => {

//     if (activeConversation) {
//       loadChatHistory(activeConversation);
//     }
//   }, []);

//   return (
//     <AppShell title="AI Chat">
//       <div className="h-[calc(100vh-120px)]">
//       <div className="grid h-full overflow-hidden rounded-xl lg:grid-cols-[320px_1fr]" style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a", }}>
//         <aside className="hidden h-full flex-col lg:flex" style={{ backgroundColor: "#141414", borderRight: "1px solid #2a2a2a" }}>
//           <div className="flex items-center justify-between p-4">
//             <div className="font-semibold text-white">Conversations</div>
//             <button className="rounded p-1 hover:bg-white/5" onClick={async () => {

//               const res = await fetch(
//                 `http://127.0.0.1:8000/conversation?user_id=${user.id}`,
//                 {
//                   method: "POST"
//                 }
//               );

//               const conversation = await res.json();

//               await loadConversations();

//               setActiveConversation(conversation.id);

//               setMsgs(INITIAL);

//             }}>
//               <Plus className="h-4 w-4 text-gray-300" />
//             </button>
//           </div>
//           <div className="flex-1 overflow-y-auto px-2">
//             {conversations.map((c) => (
//               <button key={c.id} onClick={() => { setActiveConversation(c.id); loadChatHistory(c.id) }}
//                 className="flex w-full items-start gap-2 rounded-lg p-3 text-left"
//                 style={{ borderLeft: activeConversation === c.id ? `3px solid ${TEAL}` : "3px solid transparent" }}>
//                 <MessageSquare className="mt-0.5 h-4 w-4 text-gray-400" />
//                 <div className="flex flex-1 items-start justify-between">
//                   <div className="min-w-0">
//                     <div className="truncate text-sm text-white">
//                       {c.title}
//                     </div>

//                     <div className="text-xs text-gray-500">
//                       {new Date(c.created_at).toLocaleDateString()}
//                     </div>
//                   </div>

//                   <button
//                     onClick={(e) => {

//                       e.stopPropagation();

//                       deleteConversation(c.id);

//                     }}
//                   >
//                     <Trash2
//                       className="h-4 w-4 text-red-400 hover:text-red-600"
//                     />
//                   </button>
//                 </div>
//               </button>
//             ))}
//           </div>
//           <button className="m-3 rounded-lg py-2 text-sm font-medium text-white" style={{ backgroundColor: TEAL }}
//             onClick={async () => {

//               const res = await fetch(

//                 `http://127.0.0.1:8000/conversation?user_id=${user.id}`,

//                 {

//                   method: "POST"

//                 }

//               );

//               const conversation = await res.json();

//               await loadConversations();

//               setActiveConversation(conversation.id);

//               setMsgs(INITIAL);

//             }}>
//             + New chat
//           </button>
//         </aside>

//         <div className="flex h-full min-w-0 min-h-0 flex-1 flex-col">
//           <div className="flex items-center justify-between border-b p-4" style={{ borderColor: "#2a2a2a" }}>
//             <div className="flex items-center gap-3">
//               <div className="grid h-9 w-9 place-items-center rounded-full" style={{ backgroundColor: TEAL }}>
//                 <ChefHat className="h-5 w-5 text-white" />
//               </div>
//               <div>
//                 <div className="font-semibold text-white">FridgeAI Chef</div>
//                 <div className="text-xs text-gray-400">Online · uses your inventory</div>
//               </div>
//             </div>
//             <MoreVertical className="h-5 w-5 text-gray-400" />
//           </div>

//           <div ref={scroll} className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
//             {msgs.map((m, i) => (
//               <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
//                 <div className="max-w-[70%]">
//                   <div className="whitespace-pre-line rounded-2xl px-4 py-3 text-sm"
//                     style={{
//                       backgroundColor: m.role === "user" ? TEAL : "#1a1a1a",
//                       color: "#fff",
//                       border: m.role === "user" ? "none" : "1px solid #2a2a2a",
//                       borderBottomRightRadius: m.role === "user" ? 4 : undefined,
//                       borderBottomLeftRadius: m.role === "ai" ? 4 : undefined,
//                     }}>
//                     {m.text}
//                   </div>
//                   {m.chips && (
//                     <div className="mt-2 flex flex-wrap gap-2">
//                       {m.chips.map((c) => (
//                         <button key={c.label} onClick={() => onChip(c)}
//                           className="rounded-full px-3 py-1 text-xs"
//                           style={{ border: `1px solid ${TEAL}`, color: TEAL }}>
//                           {c.label}
//                         </button>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))}
//             {typing && (
//               <div className="flex justify-start">
//                 <div className="flex gap-1 rounded-2xl px-4 py-3" style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}>
//                   {[0, 150, 300].map((d) => (
//                     <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-gray-500" style={{ animationDelay: `${d}ms` }} />
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>

//           <form onSubmit={(e) => { e.preventDefault(); send(input); }}
//             className="shrink-0 flex items-center gap-2 border-t p-4" style={{ borderColor: "#2a2a2a" }}>
//             <button type="button" className="grid h-10 w-10 place-items-center rounded-full" style={{ border: "1px solid #2a2a2a" }}>
//               <Mic className="h-4 w-4 text-gray-300" />
//             </button>
//             <input value={input} onChange={(e) => setInput(e.target.value)}
//               placeholder="Ask me anything about your fridge…"
//               className="flex-1 rounded-full px-4 py-2.5 text-sm text-white outline-none focus:ring-2"
//               style={{ backgroundColor: "#0f0f0f", border: "1px solid #2a2a2a" }} />
//             <button type="submit" className="grid h-10 w-10 place-items-center rounded-full" style={{ backgroundColor: TEAL }}>
//               <Send className="h-4 w-4 text-white" />
//             </button>
//           </form>
//         </div>
//       </div>
//       </div>
//     </AppShell>
//   );
// }
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell, TEAL } from "@/components/AppShell";
import { useEffect, useRef, useState } from "react";
import { getUser } from "@/utils/auth";

import {
  ChefHat,
  MoreVertical,
  Mic,
  Send,
  Plus,
  MessageSquare,
  Trash2,
  MicOff,
} from "lucide-react";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [{ title: "AI Chat — FridgeAI" }],
  }),
  component: Chat,
});

type Msg = {
  role: "ai" | "user";
  text: string;
  chips?: {
    label: string;
    action: "msg" | "recipe";
  }[];
};

function Chat() {
  const nav = useNavigate();

  // =====================================================
  // USER
  // =====================================================

  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // =====================================================
  // CHAT STATE
  // =====================================================

  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");

  const [activeConversation, setActiveConversation] =
    useState<number | null>(null);

  const [conversations, setConversations] =
    useState<any[]>([]);

  const scroll = useRef<HTMLDivElement>(null);

  // =====================================================
  // VOICE STATE
  // =====================================================

  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef<any>(null);

  // =====================================================
  // INITIAL MESSAGE
  // =====================================================

  const INITIAL: Msg[] = [
    {
      role: "ai",
      text: `Hi ${user?.name || "there"}! 👋

I'm your personal FridgeAI Chef.

I already know your inventory and food preferences.

How can I help you today?`,
    },
  ];

  // =====================================================
  // GET USER
  // =====================================================

  useEffect(() => {
    try {
      const currentUser = getUser();

      if (!currentUser) {
        nav({
          to: "/login",
        });

        return;
      }

      setUser(currentUser);
    } catch (error) {
      console.error("User error:", error);

      nav({
        to: "/login",
      });
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // =====================================================
  // LOAD CHAT HISTORY
  // =====================================================

  const loadChatHistory = async (
    conversationId: number
  ) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/chat/history/${conversationId}`
      );

      if (!response.ok) {
        throw new Error("Failed to load chat history");
      }

      const data = await response.json();

      if (data.length > 0) {
        setMsgs(
          data.map((m: any) => ({
            role:
              m.role === "assistant"
                ? "ai"
                : "user",
            text: m.message,
          }))
        );
      } else {
        setMsgs(INITIAL);
      }
    } catch (err) {
      console.log(err);

      setMsgs(INITIAL);
    }
  };

  // =====================================================
  // LOAD CONVERSATIONS
  // =====================================================

  const loadConversations = async () => {
    if (!user?.id) return;

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/conversation/${user.id}`
      );

      if (!res.ok) {
        throw new Error(
          "Failed to load conversations"
        );
      }

      const data = await res.json();

      setConversations(data);

      if (data.length > 0) {
        setActiveConversation(data[0].id);

        await loadChatHistory(data[0].id);
      } else {
        setMsgs(INITIAL);
      }
    } catch (error) {
      console.error(
        "Conversation error:",
        error
      );

      setMsgs(INITIAL);
    }
  };

  // =====================================================
  // LOAD CONVERSATIONS AFTER USER
  // =====================================================

  useEffect(() => {
    if (user?.id) {
      loadConversations();
    }
  }, [user]);

  // =====================================================
  // AUTO SCROLL
  // =====================================================

  useEffect(() => {
    scroll.current?.scrollTo({
      top: scroll.current.scrollHeight,
      behavior: "smooth",
    });
  }, [msgs, typing]);

  // =====================================================
  // VOICE RECOGNITION
  // =====================================================

  const startVoice = () => {
    // Browser support
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Voice recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge."
      );

      return;
    }

    // If already listening, stop
    if (isListening) {
      recognitionRef.current?.stop();

      setIsListening(false);

      return;
    }

    const recognition =
      new SpeechRecognition();

    recognitionRef.current = recognition;

    // =================================================
    // SETTINGS
    // =================================================

    recognition.continuous = false;

    recognition.interimResults = true;

    recognition.lang = "en-IN";

    // =================================================
    // START
    // =================================================

    recognition.start();

    setIsListening(true);

    // =================================================
    // SPEECH RESULT
    // =================================================

    recognition.onresult = (
      event: any
    ) => {
      let transcript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        transcript +=
          event.results[i][0].transcript;
      }

      setInput(transcript);
    };

    // =================================================
    // END
    // =================================================

    recognition.onend = () => {
      setIsListening(false);
    };

    // =================================================
    // ERROR
    // =================================================

    recognition.onerror = (
      event: any
    ) => {
      console.error(
        "Speech recognition error:",
        event.error
      );

      setIsListening(false);

      if (event.error === "not-allowed") {
        alert(
          "Microphone permission was denied. Please allow microphone access in your browser."
        );
      }
    };
  };

  // =====================================================
  // SEND MESSAGE
  // =====================================================

  const send = async (text: string) => {
    if (!text.trim()) return;

    if (!activeConversation) {
      setMsgs((m) => [
        ...m,
        {
          role: "ai",
          text: "Please create a new chat first 🙂",
        },
      ]);

      return;
    }

    setMsgs((m) => [
      ...m,
      {
        role: "user",
        text,
      },
    ]);

    setInput("");

    setTyping(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/chat",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            user_id: user.id,
            conversation_id:
              activeConversation,
            message: text,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Server Error");
      }

      const data = await response.json();

      setMsgs((m) => [
        ...m,
        {
          role: "ai",
          text:
            data.reply ||
            "I couldn't generate a response.",
        },
      ]);

      if (activeConversation) {
        await loadChatHistory(
          activeConversation
        );
      }
    } catch (error) {
      console.error(
        "Chat error:",
        error
      );

      setMsgs((m) => [
        ...m,
        {
          role: "ai",
          text:
            "Unable to connect to FridgeAI server.",
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  // =====================================================
  // CHIP
  // =====================================================

  const onChip = (
    c: {
      label: string;
      action: "msg" | "recipe";
    }
  ) => {
    if (c.action === "recipe") {
      nav({
        to: "/recipe/$id",
        params: {
          id: c.label
            .toLowerCase()
            .replace(/\s+/g, "-"),
        },
      });
    } else {
      send(c.label);
    }
  };

  // =====================================================
  // NEW CHAT
  // =====================================================

  const createNewChat = async () => {
    if (!user?.id) return;

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/conversation?user_id=${user.id}`,
        {
          method: "POST",
        }
      );

      if (!res.ok) {
        throw new Error(
          "Failed to create conversation"
        );
      }

      const conversation =
        await res.json();

      await loadConversations();

      setActiveConversation(
        conversation.id
      );

      setMsgs(INITIAL);
    } catch (error) {
      console.error(
        "New chat error:",
        error
      );
    }
  };

  // =====================================================
  // DELETE CONVERSATION
  // =====================================================

  const deleteConversation = async (
    id: number
  ) => {
    const ok = window.confirm(
      "Delete this conversation?"
    );

    if (!ok) return;

    try {
      await fetch(
        `http://127.0.0.1:8000/conversation/${id}`,
        {
          method: "DELETE",
        }
      );

      await loadConversations();

      if (activeConversation === id) {
        setMsgs(INITIAL);

        setActiveConversation(null);
      }
    } catch (error) {
      console.error(
        "Delete conversation error:",
        error
      );
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // =====================================================
  // NO USER
  // =====================================================

  if (!user) {
    return null;
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <AppShell title="AI Chat">

      <div className="h-[calc(100vh-120px)]">

        <div
          className="grid h-full overflow-hidden rounded-xl lg:grid-cols-[320px_1fr]"
          style={{
            backgroundColor: "#1a1a1a",
            border:
              "1px solid #2a2a2a",
          }}
        >

          {/* ================================================= */}
          {/* CONVERSATIONS SIDEBAR */}
          {/* ================================================= */}

          <aside
            className="hidden h-full flex-col lg:flex"
            style={{
              backgroundColor: "#141414",
              borderRight:
                "1px solid #2a2a2a",
            }}
          >

            <div className="flex items-center justify-between p-4">

              <div className="font-semibold text-white">
                Conversations
              </div>

              <button
                className="rounded p-1 hover:bg-white/5"
                onClick={createNewChat}
              >
                <Plus className="h-4 w-4 text-gray-300" />
              </button>

            </div>

            <div className="flex-1 overflow-y-auto px-2">

              {conversations.map(
                (c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setActiveConversation(
                        c.id
                      );

                      loadChatHistory(
                        c.id
                      );
                    }}
                    className="flex w-full items-start gap-2 rounded-lg p-3 text-left"
                    style={{
                      borderLeft:
                        activeConversation ===
                        c.id
                          ? `3px solid ${TEAL}`
                          : "3px solid transparent",
                    }}
                  >

                    <MessageSquare className="mt-0.5 h-4 w-4 text-gray-400" />

                    <div className="flex flex-1 items-start justify-between">

                      <div className="min-w-0">

                        <div className="truncate text-sm text-white">
                          {c.title}
                        </div>

                        <div className="text-xs text-gray-500">
                          {new Date(
                            c.created_at
                          ).toLocaleDateString()}
                        </div>

                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();

                          deleteConversation(
                            c.id
                          );
                        }}
                      >
                        <Trash2
                          className="h-4 w-4 text-red-400 hover:text-red-600"
                        />
                      </button>

                    </div>

                  </button>
                )
              )}

            </div>

            <button
              className="m-3 rounded-lg py-2 text-sm font-medium text-white"
              style={{
                backgroundColor: TEAL,
              }}
              onClick={createNewChat}
            >
              + New chat
            </button>

          </aside>

          {/* ================================================= */}
          {/* CHAT */}
          {/* ================================================= */}

          <div className="flex h-full min-w-0 min-h-0 flex-1 flex-col">

            {/* HEADER */}

            <div
              className="flex items-center justify-between border-b p-4"
              style={{
                borderColor:
                  "#2a2a2a",
              }}
            >

              <div className="flex items-center gap-3">

                <div
                  className="grid h-9 w-9 place-items-center rounded-full"
                  style={{
                    backgroundColor: TEAL,
                  }}
                >
                  <ChefHat className="h-5 w-5 text-white" />
                </div>

                <div>

                  <div className="font-semibold text-white">
                    FridgeAI Chef
                  </div>

                  <div className="text-xs text-gray-400">
                    Online · uses your inventory
                  </div>

                </div>

              </div>

              <MoreVertical className="h-5 w-5 text-gray-400" />

            </div>

            {/* ================================================= */}
            {/* MESSAGES */}
            {/* ================================================= */}

            <div
              ref={scroll}
              className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4"
            >

              {msgs.map(
                (m, i) => (

                  <div
                    key={i}
                    className={`flex ${
                      m.role === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >

                    <div className="max-w-[70%]">

                      <div
                        className="whitespace-pre-line rounded-2xl px-4 py-3 text-sm"
                        style={{
                          backgroundColor:
                            m.role === "user"
                              ? TEAL
                              : "#1a1a1a",

                          color: "#fff",

                          border:
                            m.role === "user"
                              ? "none"
                              : "1px solid #2a2a2a",

                          borderBottomRightRadius:
                            m.role === "user"
                              ? 4
                              : undefined,

                          borderBottomLeftRadius:
                            m.role === "ai"
                              ? 4
                              : undefined,
                        }}
                      >
                        {m.text}
                      </div>

                      {m.chips && (
                        <div className="mt-2 flex flex-wrap gap-2">

                          {m.chips.map(
                            (c) => (
                              <button
                                key={
                                  c.label
                                }
                                onClick={() =>
                                  onChip(
                                    c
                                  )
                                }
                                className="rounded-full px-3 py-1 text-xs"
                                style={{
                                  border:
                                    `1px solid ${TEAL}`,
                                  color: TEAL,
                                }}
                              >
                                {c.label}
                              </button>
                            )
                          )}

                        </div>
                      )}

                    </div>

                  </div>

                )
              )}

              {/* TYPING */}

              {typing && (
                <div className="flex justify-start">

                  <div
                    className="flex gap-1 rounded-2xl px-4 py-3"
                    style={{
                      backgroundColor:
                        "#1a1a1a",
                      border:
                        "1px solid #2a2a2a",
                    }}
                  >

                    {[0, 150, 300].map(
                      (d) => (
                        <span
                          key={d}
                          className="h-2 w-2 animate-bounce rounded-full bg-gray-500"
                          style={{
                            animationDelay:
                              `${d}ms`,
                          }}
                        />
                      )
                    )}

                  </div>

                </div>
              )}

            </div>

            {/* ================================================= */}
            {/* INPUT */}
            {/* ================================================= */}

            <form
              onSubmit={(e) => {
                e.preventDefault();

                send(input);
              }}
              className="shrink-0 flex items-center gap-2 border-t p-4"
              style={{
                borderColor:
                  "#2a2a2a",
              }}
            >

              {/* ================================================= */}
              {/* MICROPHONE */}
              {/* ================================================= */}

              <button
                type="button"
                onClick={startVoice}
                className="grid h-10 w-10 place-items-center rounded-full transition-all"
                title={
                  isListening
                    ? "Stop listening"
                    : "Start voice input"
                }
                style={{
                  border: isListening
                    ? `2px solid ${TEAL}`
                    : "1px solid #2a2a2a",

                  backgroundColor:
                    isListening
                      ? `${TEAL}22`
                      : "transparent",
                }}
              >

                {isListening ? (
                  <MicOff
                    className="h-4 w-4"
                    style={{
                      color: TEAL,
                    }}
                  />
                ) : (
                  <Mic className="h-4 w-4 text-gray-300" />
                )}

              </button>

              {/* ================================================= */}
              {/* INPUT */}
              {/* ================================================= */}

              <input
                value={input}
                onChange={(e) =>
                  setInput(
                    e.target.value
                  )
                }
                placeholder={
                  isListening
                    ? "Listening..."
                    : "Ask me anything about your fridge…"
                }
                className="flex-1 rounded-full px-4 py-2.5 text-sm text-white outline-none focus:ring-2"
                style={{
                  backgroundColor:
                    "#0f0f0f",
                  border:
                    "1px solid #2a2a2a",
                }}
              />

              {/* ================================================= */}
              {/* SEND */}
              {/* ================================================= */}

              <button
                type="submit"
                className="grid h-10 w-10 place-items-center rounded-full"
                style={{
                  backgroundColor: TEAL,
                }}
              >

                <Send className="h-4 w-4 text-white" />

              </button>

            </form>

          </div>

        </div>

      </div>

    </AppShell>
  );
}

export default Chat;