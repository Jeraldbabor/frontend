import {
    ScanFace,
    Bell,
    BarChart3,
    Users,
    Clock,
    Smartphone,
    CheckCircle2,
    ChevronRight,
    ArrowRight,
    Shield,
    Zap,
} from "lucide-react";

/**
 * CampusEye Gate System — Premium Landing Page
 */
export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background selection:bg-primary/20">

            {/* ============================================================
          HERO SECTION (Floating design with complex gradients)
          ============================================================ */}
            <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
                {/* Background Gradients */}
                <div className="absolute top-0 left-1/2 -z-10 -translate-x-1/2 w-[1000px] h-[600px] opacity-30 dark:opacity-20 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-blue-500/30 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen" />
                </div>

                {/* Subtle grid pattern overlay */}
                <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

                <div className="container mx-auto px-4 lg:px-8 relative z-10 flex flex-col items-center text-center">
                    {/* Badge */}
                    <div className="group relative mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-5 py-2 text-sm font-medium text-primary transition-all hover:bg-primary/10 hover:border-primary/30 cursor-default">
                        <span className="absolute inset-0 rounded-full bg-primary/20 blur-md opacity-0 transition-opacity group-hover:opacity-100" />
                        <Zap className="h-4 w-4 relative z-10" />
                        <span className="relative z-10">Next-Generation Campus Security</span>
                    </div>

                    {/* Headline */}
                    <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight sm:text-6xl xl:text-7xl">
                        Smart Gate Monitoring for{" "}
                        <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-primary pb-2 animate-gradient-x">
                            Safer Campuses
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl leading-relaxed text-muted-foreground">
                        Track student entry and exit in real-time. Instantly notify parents.
                        Give administrators complete visibility over campus gate activity with zero friction.
                    </p>

                    {/* CTA Buttons */}
                    <div className="mt-10 flex flex-col w-full sm:w-auto sm:flex-row gap-4 justify-center items-center">
                        <a
                            href="#contact"
                            className="group relative flex h-14 w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground transition-all hover:scale-105 shadow-[0_0_40px_-10px_rgba(var(--color-primary),0.5)]"
                        >
                            Request a Demo
                            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </a>
                        <a
                            href="#features"
                            className="group flex h-14 w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-border bg-background/50 backdrop-blur-sm px-8 text-base font-semibold text-foreground transition-all hover:bg-muted"
                        >
                            Explore Features
                        </a>
                    </div>

                    {/* Trust Indicators */}
                    <div className="mt-20 pt-10 border-t border-border/50 max-w-3xl flex flex-col items-center">
                        <p className="text-sm font-medium text-muted-foreground mb-6 uppercase tracking-widest">Built for modern educational institutions</p>
                        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale">
                            {/* Placeholders for partner logos */}
                            <div className="flex items-center gap-2 font-bold text-xl"><Shield className="h-6 w-6" /> DATA SECURE</div>
                            <div className="flex items-center gap-2 font-bold text-xl"><Clock className="h-6 w-6" /> 99.9% UPTIME</div>
                            <div className="flex items-center gap-2 font-bold text-xl"><Users className="h-6 w-6" /> 50k+ USERS</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================================
          FEATURES SECTION (Interactive Grid)
          ============================================================ */}
            <section id="features" className="relative py-24 lg:py-32 bg-muted/30">
                <div className="container mx-auto px-4 lg:px-8">
                    {/* Section Header */}
                    <div className="mx-auto mb-16 max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
                            Everything you need for ironclad security
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Powerful, intuitive tools designed specifically for schools to keep students safe and parents informed without slowing down gate traffic.
                        </p>
                    </div>

                    {/* Feature Cards Grid */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                icon: <ScanFace className="h-6 w-6" />,
                                title: "Lightning-Fast Scanning",
                                description: "Process hundreds of students per minute. Tap-and-go ID scanning ensures zero bottleneck at the main gates.",
                                gradient: "from-blue-500/20 to-cyan-500/20",
                                iconColor: "text-blue-500",
                            },
                            {
                                icon: <Bell className="h-6 w-6" />,
                                title: "Instant Parent Alerts",
                                description: "Parents receive automated real-time SMS or push notifications the exact second their child taps their ID.",
                                gradient: "from-green-500/20 to-emerald-500/20",
                                iconColor: "text-green-500",
                            },
                            {
                                icon: <BarChart3 className="h-6 w-6" />,
                                title: "Live Command Dashboard",
                                description: "Administrators get a bird's-eye view of campus occupancy, live gate streams, and historical analytics.",
                                gradient: "from-purple-500/20 to-fuchsia-500/20",
                                iconColor: "text-purple-500",
                            },
                            {
                                icon: <Clock className="h-6 w-6" />,
                                title: "Automated Attendance",
                                description: "Export clean, accurate time-in and time-out logs directly to your school's existing SIS or accounting software.",
                                gradient: "from-orange-500/20 to-red-500/20",
                                iconColor: "text-orange-500",
                            },
                            {
                                icon: <Users className="h-6 w-6" />,
                                title: "Granular Access Control",
                                description: "Assign distinct roles for super-admins, guards, and parents. Ensure everyone only sees the data they are authorized to see.",
                                gradient: "from-indigo-500/20 to-blue-500/20",
                                iconColor: "text-indigo-500",
                            },
                            {
                                icon: <Smartphone className="h-6 w-6" />,
                                title: "Anywhere Access",
                                description: "Our responsive progressive web app means guards can use tablets, and admins can monitor from their phones.",
                                gradient: "from-pink-500/20 to-rose-500/20",
                                iconColor: "text-pink-500",
                            },
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="group relative overflow-hidden rounded-3xl border border-border/50 bg-background p-8 transition-all hover:shadow-xl hover:-translate-y-1"
                            >
                                {/* Hover Gradient Background */}
                                <div className={`absolute inset - 0 bg - gradient - to - br ${feature.gradient} opacity - 0 transition - opacity duration - 500 group - hover: opacity - 100 z - 0`} />

                                <div className="relative z-10">
                                    <div className={`mb - 6 flex h - 14 w - 14 items - center justify - center rounded - 2xl bg - muted transition - transform group - hover: scale - 110 group - hover: bg - background shadow - sm ${feature.iconColor} `}>
                                        {feature.icon}
                                    </div>
                                    <h3 className="mb-3 text-xl font-bold tracking-tight">{feature.title}</h3>
                                    <p className="leading-relaxed text-muted-foreground">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================================
          HOW IT WORKS (Linear Path Visual)
          ============================================================ */}
            <section id="how-it-works" className="py-24 lg:py-32">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="mx-auto mb-16 max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
                            Effortless operation
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            We built CampusEye to work invisibly in the background. Setup takes minutes, processing takes milliseconds.
                        </p>
                    </div>

                    <div className="relative max-w-5xl mx-auto">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-[45px] left-[10%] right-[10%] h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

                        <div className="grid gap-12 md:grid-cols-4 relative z-10">
                            {[
                                {
                                    step: "1",
                                    title: "Deploy",
                                    desc: "Install our plug-and-play RFID/Barcode scanners at your gates.",
                                },
                                {
                                    step: "2",
                                    title: "Scan",
                                    desc: "Students tap their existing IDs. Sub-second verification.",
                                },
                                {
                                    step: "3",
                                    title: "Notify",
                                    desc: "System instantly routes a notification to the parent's app.",
                                },
                                {
                                    step: "4",
                                    title: "Analyze",
                                    desc: "Admins review daily attendance grids and absentee reports.",
                                },
                            ].map((item, i) => (
                                <div key={i} className="relative flex flex-col items-center text-center">
                                    <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border-[6px] border-background bg-muted text-3xl font-black text-foreground shadow-xl transition-transform hover:scale-110 hover:bg-primary hover:text-primary-foreground">
                                        {item.step}
                                    </div>
                                    <h3 className="mb-2 text-xl font-bold">{item.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================================
          ABOUT & STATS SECTION (Split Layout)
          ============================================================ */}
            <section id="about" className="py-24 lg:py-32 bg-muted/30 border-t border-border/50">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="grid items-center gap-16 lg:grid-cols-2">
                        {/* Left Image / Visual Block */}
                        <div className="relative aspect-square md:aspect-[4/3] rounded-3xl bg-gradient-to-tr from-primary/20 via-primary/5 to-background border border-primary/10 overflow-hidden shadow-2xl flex items-center justify-center">
                            {/* Decorative UI elements inside */}
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px]" />
                            <div className="relative z-10 w-3/4 bg-background rounded-xl border border-border shadow-2xl p-6 transform -rotate-2 hover:rotate-0 transition-all duration-500">
                                <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                                    <span className="font-bold">Live Feed</span>
                                    <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                </div>
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-muted" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-2 w-24 bg-muted rounded" />
                                                <div className="h-2 w-16 bg-primary/20 rounded" />
                                            </div>
                                            <div className="text-xs font-mono text-muted-foreground">08:14 AM</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Text */}
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6">
                                    Peace of mind for parents, power for admins.
                                </h2>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    We bridge the gap between school security and home. CampusEye automates the tedious parts of gate management so security personnel can focus on actual threats, not paperwork.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-6 pt-4">
                                {[
                                    { value: "0.2s", label: "Scan Speed" },
                                    { value: "100%", label: "Cloud Backups" },
                                    { value: "256-bit", label: "Encryption" },
                                    { value: "24/7", label: "Support" },
                                ].map((stat, i) => (
                                    <div key={i} className="border-l-4 border-primary pl-4">
                                        <p className="text-3xl font-black">{stat.value}</p>
                                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</p>
                                    </div>
                                ))}
                            </div>

                            <ul className="space-y-3 pt-4">
                                {[
                                    "Eliminate manual logbooks entirely",
                                    "Reduce truancy through immediate parent alerts",
                                    "Export attendance data directly to Excel/CSV",
                                ].map((item, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
                                        <span className="font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================================
          CONTACT / CTA (Full Width Dark Banner)
          ============================================================ */}
            <section id="contact" className="py-24 lg:py-32">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="relative overflow-hidden rounded-[3rem] bg-foreground px-6 py-24 text-center sm:px-16 lg:px-24">
                        {/* Background noise texture */}
                        <div className="absolute inset-0 opacity-5 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

                        {/* Giant glowing orb */}
                        <div className="absolute left-1/2 top-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/40 blur-[120px]" />

                        <div className="relative z-10 max-w-2xl mx-auto">
                            <h2 className="text-4xl font-black text-background sm:text-5xl lg:text-6xl tracking-tight mb-6">
                                Ready to secure your gates?
                            </h2>
                            <p className="text-xl text-background/80 mb-10">
                                Join dozens of institutions already using CampusEye to protect their students and streamline attendance.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <a
                                    href="mailto:consulting@campuseye.com"
                                    className="inline-flex h-14 items-center justify-center gap-3 rounded-full bg-primary px-10 text-lg font-bold text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90"
                                >
                                    Contact Sales
                                    <ArrowRight className="h-5 w-5" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
