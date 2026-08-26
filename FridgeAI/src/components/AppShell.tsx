import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Home,
  Refrigerator,
  Camera,
  MessageSquare,
  Calendar,
  ShoppingCart,
  Settings,
  ChefHat,
  Bell,
  Settings as SettingsIcon,
} from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import { getUser } from "@/utils/auth";
const NAV = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/inventory", label: "Fridge", icon: Refrigerator },
  { to: "/scan", label: "Scan", icon: Camera },
  { to: "/chat", label: "AI Chat", icon: MessageSquare },
  { to: "/meal-plan", label: "Meal Plan", icon: Calendar },
  { to: "/shopping", label: "Shopping", icon: ShoppingCart },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [showNotifications, setShowNotifications] = useState(false);
  const user = getUser();

  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const fetchNotifications = async () => {
    if (!user) return;
    try {

      const res = await fetch(
        `http://127.0.0.1:8000/notifications/${user.id}`
      );

      const data = await res.json();

      setNotifications(data);

    } catch (err) {

      console.error(err);

    }

  };
  const logout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    navigate({
      to: "/login",
    });

  };
  const dismissNotification = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };
  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: "#0f0f0f" }}>
      {/* Desktop + tablet sidebar */}
      <aside
        className="fixed inset-y-0 left-0 z-30 hidden flex-col border-r sm:flex"
        style={{
          width: 240,
          backgroundColor: "#141414",
          borderColor: "#2a2a2a",
        }}
      >
        <div className="flex items-center gap-2 px-5 py-5">
          <div
            className="grid h-9 w-9 place-items-center rounded-lg"
            style={{ backgroundColor: "#1D9E75" }}
          >
            <ChefHat className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white md:inline hidden lg:inline">FridgeAI</span>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors"
                style={{
                  backgroundColor: active ? "#1D9E75" : "transparent",
                  color: active ? "#fff" : "#9ca3af",
                }}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <Link
          to="/profile"
          className="m-3 flex items-center gap-3 rounded-lg p-3 hover:bg-white/5"
        >
          <div
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full font-semibold text-white"
            style={{ backgroundColor: "#1D9E75" }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden min-w-0 flex-1 lg:block">
            <div className="truncate text-sm font-medium text-white">{user?.name}</div>
            <div className="truncate text-xs text-gray-500">{user?.email}</div>
          </div>
          <SettingsIcon className="hidden h-4 w-4 text-gray-500 lg:block" />
        </Link>
      </aside>
          <button
    onClick={logout}
    className="rounded-lg border border-[#2a2a2a] px-3 py-2 text-sm text-white hover:bg-white/10"
>
    Logout
</button>
      {/* Mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t py-2 sm:hidden"
        style={{ backgroundColor: "#141414", borderColor: "#2a2a2a" }}
      >
        {NAV.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex flex-col items-center gap-1 px-3 py-1 text-xs"
              style={{ color: active ? "#1D9E75" : "#9ca3af" }}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main content */}
      <main className="sm:pl-[240px] min-h-screen">
        <div className="mx-auto max-w-[1400px]  px-4 py-6 sm:px-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div> <h1 className="text-[22px] font-bold text-white">{title}</h1><p className="text-sm text-gray-400">

              Welcome back, {user?.name}

            </p></div>
            <div className="flex items-center gap-3">
              {actions}
              <div className="relative"></div>
              <button
                className="relative rounded-lg p-2 hover:bg-white/5"
                aria-label="Notifications"
                onClick={async () => {

                  await fetchNotifications();

                  setShowNotifications(!showNotifications);

                }}
              >
                <Bell className="h-5 w-5 text-gray-300" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
              </button>
              {showNotifications && (

                <div
                  className="absolute right-0 top-12 z-50 w-[420px] max-h-[500px] overflow-y-auto rounded-2xl border border-[#2a2a2a] bg-[#181818] p-5 shadow-2xl"
                >

                  <div className="mb-5 flex items-center justify-between">

                    <div>

                      <h2 className="text-lg font-bold text-white">
                        Notifications
                      </h2>

                      <p className="text-sm text-gray-500">
                        {notifications.length} Alerts
                      </p>

                    </div>

                    <button
                      onClick={() => setShowNotifications(false)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white"
                    >
                      ✕
                    </button>

                  </div>

                  {notifications.length === 0 ? (

                    <div className="py-10 text-center text-gray-500">

                      No Notifications

                    </div>

                  ) : (

                    notifications.map((n: any, index: number) => (

                      <div
                        key={index}
                        className="mb-3 rounded-xl border border-[#2a2a2a] bg-[#202020] p-4 transition hover:border-[#1D9E75]"
                      >

                        <div className="flex justify-between">

                          <div className="flex gap-3">

                            <div className="mt-1 text-xl">

                              {n.type === "danger" && "🔴"}

                              {n.type === "warning" && "🟡"}

                              {n.type === "info" && "🟢"}

                            </div>

                            <div>

                              <div className="font-semibold text-white">

                                {n.title}

                              </div>

                              <div className="mt-1 text-sm text-gray-400">

                                {n.message}

                              </div>

                              <div className="mt-2 text-xs text-gray-500">

                                Just now

                              </div>

                            </div>

                          </div>

                          <button
                            onClick={() => dismissNotification(index)}
                            className="rounded p-1 text-gray-500 hover:bg-white/10 hover:text-white"
                          >

                            ✕

                          </button>

                        </div>

                      </div>

                    ))

                  )}

                  {notifications.length > 0 && (

                    <button
                      onClick={() => setNotifications([])}
                      className="mt-4 w-full rounded-xl bg-[#1D9E75] py-3 font-medium text-white hover:opacity-90"
                    >

                      Clear All

                    </button>

                  )}

                </div>

              )}
              <Link
                to="/profile"
                className="grid h-9 w-9 place-items-center rounded-full font-semibold text-white"
                style={{ backgroundColor: "#1D9E75" }}
              >
                P
              </Link>
            </div>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}

export function Card({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl p-5 ${className}`}
      style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
      {...props}
    >
      {children}
    </div>
  );
}

export const TEAL = "#1D9E75";
