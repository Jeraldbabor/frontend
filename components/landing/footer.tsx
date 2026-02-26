import Link from "next/link";
import { ShieldCheck, Mail, MapPin, Phone } from "lucide-react";

/**
 * Landing Page Footer
 *
 * Multi-column footer with brand info, quick links, contact info, and copyright.
 */
export default function Footer() {
    const currentYear = new Date().getFullYear();

    const quickLinks = [
        { label: "Features", href: "#features" },
        { label: "How It Works", href: "#how-it-works" },
        { label: "About", href: "#about" },
        { label: "Contact", href: "#contact" },
    ];

    return (
        <footer className="border-t border-border bg-card">
            <div className="container mx-auto px-4 py-12 lg:px-8">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {/* Brand */}
                    <div className="space-y-4 lg:col-span-2">
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                                <ShieldCheck className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <span className="text-xl font-bold tracking-tight">
                                CampusEye
                            </span>
                        </Link>
                        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                            A modern campus gate monitoring system designed to enhance student
                            safety, streamline attendance tracking, and provide real-time
                            notifications to parents and administrators.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
                            Quick Links
                        </h3>
                        <ul className="space-y-2.5">
                            {quickLinks.map((link) => (
                                <li key={link.href}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
                            Contact
                        </h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                                <span>Campus Main Gate, School Ave</span>
                            </li>
                            <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                <Mail className="h-4 w-4 shrink-0" />
                                <span>support@campuseye.com</span>
                            </li>
                            <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                <Phone className="h-4 w-4 shrink-0" />
                                <span>+63 912 345 6789</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
                    <p className="text-xs text-muted-foreground">
                        &copy; {currentYear} CampusEye Gate System. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <a
                            href="#"
                            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Privacy Policy
                        </a>
                        <a
                            href="#"
                            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Terms of Service
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
