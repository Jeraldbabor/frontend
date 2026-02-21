"use client";

// lucide-react icons
import { LayoutDashboard, Users, GraduationCap, ShieldCheck } from "lucide-react";

// shadcn/ui components
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

/**
 * Dashboard Page
 *
 * Main admin overview page showing welcome message and quick stats.
 * The sidebar and user data are provided by the (admin) layout.
 */
export default function DashboardPage() {
    // Placeholder stats for the dashboard overview
    const stats = [
        {
            title: "Total Students",
            value: "0",
            description: "Registered students",
            icon: <GraduationCap className="h-5 w-5 text-primary" />,
        },
        {
            title: "Total Parents",
            value: "0",
            description: "Registered parents",
            icon: <Users className="h-5 w-5 text-primary" />,
        },
        {
            title: "Admins",
            value: "1",
            description: "System administrators",
            icon: <ShieldCheck className="h-5 w-5 text-primary" />,
        },
    ];

    return (
        <div>
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-1">
                    <LayoutDashboard className="h-7 w-7 text-primary" />
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                </div>
                <p className="text-muted-foreground">
                    Welcome to the CampusEye Gate System admin panel.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            {stat.icon}
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stat.value}</div>
                            <CardDescription className="mt-1">
                                {stat.description}
                            </CardDescription>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
