import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner"; import { ChefHat, Loader2, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account — FridgeAI" }] }),
  component: Signup,
});

const TEAL = "#1D9E75";

function Signup() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const signupUser = async (e: React.FormEvent) => {

    e.preventDefault();

    if (password !== confirmPassword) {

      toast.error("Passwords do not match");

      return;

    }

    try {

      setLoading(true);

      const res = await fetch(
        "http://127.0.0.1:8000/auth/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name,
            email,
            password
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {

        toast.error(data.detail);

        return;

      }

      toast.success("Account Created Successfully");

      nav({
        to: "/login"
      });

    } catch {

      toast.error("Server Error");

    } finally {

      setLoading(false);

    }

  };
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10" style={{ backgroundColor: "#0f0f0f" }}>
      <div className="w-full max-w-[440px]">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg" style={{ backgroundColor: TEAL }}>
            <ChefHat className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">FridgeAI</span>
        </Link>
        <div className="rounded-2xl p-10" style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="mt-1 text-sm text-gray-400">Start cooking smarter today</p>
          <form
            onSubmit={signupUser}
            className="mt-6 space-y-4"
          >
            {/* Full Name */}
            <div>
              <label className="mb-1.5 block text-sm text-gray-300">
                Full Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
                className="w-full rounded-lg px-3 py-2.5 text-white outline-none"
                style={{
                  backgroundColor: "#0f0f0f",
                  border: "1px solid #2a2a2a",
                }}
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm text-gray-300">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full rounded-lg px-3 py-2.5 text-white outline-none"
                style={{
                  backgroundColor: "#0f0f0f",
                  border: "1px solid #2a2a2a",
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-sm text-gray-300">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create password"
                  required
                  className="w-full rounded-lg px-3 py-2.5 pr-10 text-white outline-none"
                  style={{
                    backgroundColor: "#0f0f0f",
                    border: "1px solid #2a2a2a",
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-1.5 block text-sm text-gray-300">
                Confirm Password
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  required
                  className="w-full rounded-lg px-3 py-2.5 pr-10 text-white outline-none"
                  style={{
                    backgroundColor: "#0f0f0f",
                    border: "1px solid #2a2a2a",
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3 top-3 text-gray-400"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>
            <label className="flex items-start gap-2 text-sm text-gray-300">
              <input type="checkbox" required className="mt-1 accent-[#1D9E75]" />
              I agree to the Terms of Service and Privacy Policy
            </label>
            <button type="submit" className="w-full rounded-lg py-2.5 font-medium text-white" style={{ backgroundColor: TEAL }}>
              Create account
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="font-medium" style={{ color: TEAL }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
