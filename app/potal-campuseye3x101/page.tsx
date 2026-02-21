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
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            {/* Login Card */}
            <Card className="w-full max-w-md">
                <CardHeader className="text-center space-y-2">
                    {/* Logo / Icon */}
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                        <ShieldCheck className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
                    <CardDescription>
                        Sign in to the CampusEye Gate System
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
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    Signing in...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <LogIn className="h-4 w-4" />
                                    Sign In
                                </span>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
