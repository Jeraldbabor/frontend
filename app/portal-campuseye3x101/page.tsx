"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

// lucide-react icons
import { Eye, EyeOff, LogIn, ShieldCheck } from "lucide-react";

/**
 * Admin Login Page
 *
 * Allows admin users to log in with email and password.
 * On success, stores the Sanctum token in both localStorage and a cookie,
 * then redirects to /dashboard.
 */
export default function LoginPage() {
    const router = useRouter();

    // Form state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // UI state
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    /**
     * Handle form submission.
     * Sends POST /api/admin/login and stores the token on success.
     */
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Step 1: Send login request to the Laravel backend
            const response = await api.post("/admin/login", { email, password });

            // Step 2: Store the token in localStorage for API requests
            const token = response.data.token;
            localStorage.setItem("token", token);

            // Step 3: Also store in a cookie so Next.js middleware can read it
            document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days

            // Step 4: Fetch user profile to determine role
            // We can hit the standard /admin/me endpoint since it returns the user model regardless
            const meResponse = await api.get("/admin/me", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Step 5: Redirect based on role
            if (meResponse.data.user.role === "superadmin") {
                router.push("/superadmin/dashboard");
            } else {
                router.push("/admin/dashboard");
            }
        } catch (err: unknown) {
            // Handle validation or auth errors from the backend
            if (
                err &&
                typeof err === "object" &&
                "response" in err &&
                (err as { response?: { data?: { message?: string } } }).response?.data
                    ?.message
            ) {
                setError(
                    (err as { response: { data: { message: string } } }).response.data
                        .message
                );
            } else {
                setError("Login failed. Please check your credentials.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden relative p-4">
            {/* Background glowing orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />

            {/* Login Card */}
            <Card className="w-full max-w-md bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl relative z-10 sm:p-4">
                <CardHeader className="text-center space-y-3 pb-6">
                    {/* Logo / Icon */}
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 shadow-inner ring-1 ring-white/10">
                        <ShieldCheck className="h-8 w-8 text-primary shadow-sm" />
                    </div>
                    <CardTitle className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">Admin Portal</CardTitle>
                    <CardDescription className="text-slate-400 font-medium tracking-wide">
                        Sign in to CampusEye Gate System
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        {/* Error message */}
                        {error && (
                            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        {/* Email field */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@campuseye.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {/* Password field with toggle visibility */}
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit button */}
                        <Button
                            type="submit"
                            className="w-full h-12 text-md font-semibold mt-4 shadow-lg shadow-primary/30 transition-all hover:scale-[1.02]"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Authenticating...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <LogIn className="h-5 w-5" />
                                    Secure Sign In
                                </span>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
