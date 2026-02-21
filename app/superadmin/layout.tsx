"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Sidebar from "@/components/superadmin/sidebar";

/**
 * Super Admin Layout
 *
 * Wraps all superadmin pages.
 * Redirects if the user is not authenticated or not a superadmin.
 */

interface UserData {
    name: string;
    email: string;
    role: string;
    university?: {
        id: number;
        name: string;
    };
}

export default function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch authenticated user data on mount
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get("/superadmin/me");
                if (response.data.user.role !== "superadmin") {
                    // Force them into standard admin portal
                    router.push("/admin/dashboard");
                    return;
                }
                setUser(response.data.user);
            } catch {
                // If token is invalid, clear and redirect to login
                localStorage.removeItem("token");
                document.cookie = "token=; path=/; max-age=0";
                router.push("/potal-campuseye3x101");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [router]);

    // Show loading spinner while fetching user data
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Sidebar */}
            <Sidebar user={user} />

            {/* Main content area — offset by sidebar width on desktop */}
            <main className="lg:pl-64">
                <div className="p-6 pt-16 lg:pt-6">{children}</div>
            </main>
        </div>
    );
}
