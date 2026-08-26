import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChefHat, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — FridgeAI" }] }),
  component: Login,
});

const TEAL = "#1D9E75";

function Login() {
  const nav = useNavigate();
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const loginUser = async (e: React.FormEvent) => {

    e.preventDefault();

    try {

      setLoading(true);

      const res = await fetch(
        "http://127.0.0.1:8000/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.detail || "Login Failed");
        return;
      }

      localStorage.setItem(
        "token",
        data.access_token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      toast.success("Login Successful");

      nav({
        to: "/dashboard",
      });

    } catch (err) {

      console.log(err);

      toast.error("Server Error");

    } finally {

      setLoading(false);

    }

  };
  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: "#0f0f0f" }}>
      <div className="w-full max-w-[440px]">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg" style={{ backgroundColor: TEAL }}>
            <ChefHat className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">FridgeAI</span>
        </Link>
        <div className="rounded-2xl p-10" style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="mt-1 text-sm text-gray-400">Sign in to your account</p>
          <form
            onSubmit={loginUser}
            className="mt-6 space-y-4"
          >
            <div>
              <label className="mb-1.5 block text-sm text-gray-300">Email</label>
              <input type="email" required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-lg px-3 py-2.5 text-white outline-none focus:ring-2"
                style={{ backgroundColor: "#0f0f0f", border: "1px solid #2a2a2a" }} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-gray-300">Password</label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-lg px-3 py-2.5 pr-10 text-white outline-none focus:ring-2"
                  style={{ backgroundColor: "#0f0f0f", border: "1px solid #2a2a2a" }} />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute inset-y-0 right-0 grid w-10 place-items-center text-gray-400">
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-2.5 font-medium text-white disabled:opacity-60"
              style={{ backgroundColor: TEAL }}
            >

              {loading ? "Signing In..." : "Sign In"}

            </button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold transition hover:underline"
              style={{ color: TEAL }}
            >
              Create one now
            </Link>
          </div>


        </div>
      </div>
    </div>
  );
}
