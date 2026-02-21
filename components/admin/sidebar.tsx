"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import api from "@/lib/api";

// lucide-react icons
import {
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    ShieldCheck,
    ChevronsUpDown,
} from "lucide-react";

/**
 * Sidebar Navigation Item
 */
interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
}

/**
 * User data from API
 */
interface UserData {
    name: string;
    email: string;
    role: string;
}

interface SidebarProps {
    user: UserData | null;
}

/**
 * Admin Sidebar Component
 *
 * - Logo + app name at the top
 * - Navigation links with active state highlighting
 * - User info + logout button at the bottom
 * - Collapsible on mobile via hamburger toggle
 */
export default function Sidebar({ user }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [dropUpOpen, setDropUpOpen] = useState(false);
    const dropUpRef = useRef<HTMLDivElement>(null);

    // Close drop-up when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropUpRef.current && !dropUpRef.current.contains(e.target as Node)) {
                setDropUpOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Navigation items
    const navItems: NavItem[] = [
        {
            label: "Dashboard",
            href: "/dashboard",
            icon: <LayoutDashboard className="h-5 w-5" />,
        },
        {
            label: "Users",
            href: "/users",
            icon: <Users className="h-5 w-5" />,
        },
    ];

    /**
     * Handle logout: revoke token, clear storage, redirect to login
     */
    const handleLogout = async () => {
        try {
            await api.post("/admin/logout");
        } catch {
            // Even if API call fails, clear local state
        } finally {
            localStorage.removeItem("token");
            document.cookie = "token=; path=/; max-age=0";
            router.push("/potal-campuseye3x101");
        }
    };

    /**
     * Navigate to a page and close mobile menu
     */
    const navigateTo = (href: string) => {
        router.push(href);
        setMobileOpen(false);
    };

    /**
     * Check if a nav item is active based on current pathname
     */
    const isActive = (href: string) => pathname === href;

    // Shared sidebar content (used in both mobile and desktop)
    const sidebarContent = (
        <div className="flex h-full flex-col">
            {/* Logo / Brand */}
            <div className="flex h-16 items-center gap-3 border-b border-border px-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                    <ShieldCheck className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold tracking-tight">CampusEye</span>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 space-y-1 px-3 py-4">
                {navItems.map((item) => (
                    <button
                        key={item.href}
                        onClick={() => navigateTo(item.href)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive(item.href)
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            }`}
                    >
                        {item.icon}
                        {item.label}
                    </button>
                ))}
            </nav>

            {/* Bottom Section: User info with drop-up menu */}
            <div className="relative border-t border-border p-3" ref={dropUpRef}>
                {/* Drop-up menu */}
                {dropUpOpen && (
                    <div className="absolute bottom-full left-3 right-3 mb-2 rounded-lg border border-border bg-card p-1 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <button
                            onClick={() => {
                                navigateTo("/settings");
                                setDropUpOpen(false);
                            }}
                            className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive("/settings")
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                }`}
                        >
                            <Settings className="h-4 w-4" />
                            Settings
                        </button>
                        <div className="my-1 border-t border-border" />
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                            <LogOut className="h-4 w-4" />
                            Log out
                        </button>
                    </div>
                )}

                {/* Clickable user info trigger */}
                <button
                    onClick={() => setDropUpOpen(!dropUpOpen)}
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-accent"
                >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {user?.name?.charAt(0)?.toUpperCase() || "A"}
                    </div>
                    <div className="flex-1 overflow-hidden text-left">
                        <p className="truncate text-sm font-medium">{user?.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                            {user?.email}
                        </p>
                    </div>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile: Hamburger toggle button */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="fixed left-4 top-4 z-50 rounded-lg border border-border bg-card p-2 shadow-sm lg:hidden"
            >
                {mobileOpen ? (
                    <X className="h-5 w-5" />
                ) : (
                    <Menu className="h-5 w-5" />
                )}
            </button>

            {/* Mobile: Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile: Slide-in sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-border bg-card transition-transform duration-200 lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {sidebarContent}
            </aside>

            {/* Desktop: Fixed sidebar */}
            <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:block lg:w-64 lg:border-r lg:border-border lg:bg-card">
                {sidebarContent}
            </aside>
        </>
    );
}
