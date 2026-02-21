"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, Menu, X, ChevronRight } from "lucide-react";

/**
 * Landing Page Header
 *
 * Enhanced premium design with stronger glassmorphism, floating pill layout,
 * interactive hover states, and smooth mobile transitions.
 */
export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Track scroll position for floating header effect
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { label: "Features", href: "#features" },
        { label: "How It Works", href: "#how-it-works" },
        { label: "About", href: "#about" },
        { label: "Contact", href: "#contact" },
    ];

    return (
        <header className="fixed left-0 right-0 top-0 z-50 pt-4 px-4 transition-all duration-300">
            <div
                className={`mx-auto flex h-16 max-w-6xl items-center justify-between rounded-full border transition-all duration-300 ${scrolled
                        ? "border-primary/10 bg-background/70 px-6 backdrop-blur-xl shadow-lg shadow-black/5"
                        : "border-transparent bg-transparent px-4"
                    }`}
            >
                {/* Logo */}
                <Link href="/" className="group flex items-center gap-2.5 transition-transform hover:scale-105">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md shadow-primary/20">
                        <ShieldCheck className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-foreground">
                        CampusEye
                    </span>
                </Link>

                {/* Desktop Navigation (Pill design) */}
                <nav className="hidden md:flex items-center gap-1 rounded-full border border-border/50 bg-background/50 p-1 backdrop-blur-md">
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="relative px-5 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-muted/50 rounded-full"
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                {/* Desktop CTA */}
                <div className="hidden md:flex items-center">
                    <a
                        href="#contact"
                        className="group flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-all hover:bg-foreground/90 hover:shadow-md"
                    >
                        Get Started
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </a>
                </div>

                {/* Mobile Hamburger */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="relative z-50 rounded-full bg-muted/50 p-2.5 text-foreground transition-all hover:bg-muted md:hidden"
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 z-40 bg-background/95 backdrop-blur-xl transition-all duration-300 md:hidden flex flex-col items-center justify-center ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
            >
                <nav className="flex flex-col items-center gap-8 text-center">
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            className="text-2xl font-semibold tracking-tight text-muted-foreground transition-colors hover:text-primary"
                        >
                            {link.label}
                        </a>
                    ))}
                    <a
                        href="#contact"
                        onClick={() => setMobileOpen(false)}
                        className="mt-4 flex h-14 items-center gap-2 rounded-full bg-primary px-8 text-lg font-medium text-primary-foreground transition-transform hover:scale-105"
                    >
                        Get Started
                        <ChevronRight className="h-5 w-5" />
                    </a>
                </nav>
            </div>
        </header>
    );
}
