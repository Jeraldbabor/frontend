"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Sidebar from "@/components/admin/sidebar";

/**
 * Admin Layout
 *
 * Wraps all admin pages (dashboard, settings, etc.) with the sidebar.
 * Fetches the authenticated user's data and passes it to the sidebar.
 * Redirects to the secret login page if the user is not authenticated.
 */

interface UserData {
    name: string;
    email: string;
    role: string;
}

export default function AdminLayout({
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
                const response = await api.get("/admin/me");
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
