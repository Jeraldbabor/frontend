"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import {
    ClipboardList,
    Search,
    Download,
    ArrowUpRight,
    ArrowDownLeft,
    Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AttendanceLogItem {
    id: number;
    student_id: number;
    rfid_code: string;
    direction: "in" | "out";
    scanned_at: string;
    student?: {
        id: number;
        first_name: string;
        last_name: string;
        grade: string;
        section: string;
        student_id_number: string;
    } | null;
}

export default function AttendancePage() {
    const [logs, setLogs] = useState<AttendanceLogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [directionFilter, setDirectionFilter] = useState("");

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get("/admin/attendance-logs", {
                params: {
                    search: search || undefined,
                    date_from: dateFrom || undefined,
                    date_to: dateTo || undefined,
                    direction: directionFilter || undefined,
                },
            });
            setLogs(response.data.data);
        } catch (error) {
            console.error("Failed to fetch attendance logs", error);
        } finally {
            setLoading(false);
        }
    }, [search, dateFrom, dateTo, directionFilter]);

    useEffect(() => {
        const timer = setTimeout(() => fetchLogs(), 500);
        return () => clearTimeout(timer);
    }, [fetchLogs]);

    const handleExport = async () => {
        try {
            const response = await api.get("/admin/attendance-logs/export", {
                params: {
                    date_from: dateFrom || undefined,
                    date_to: dateTo || undefined,
                },
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "attendance_logs.csv");
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("Attendance logs exported successfully.");
        } catch {
            toast.error("Failed to export attendance logs.");
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };

    return (
        <div>
            {/* Page Header */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <ClipboardList className="h-7 w-7 text-primary" />
                        <h1 className="text-3xl font-bold">Attendance Logs</h1>
                    </div>
                    <p className="text-muted-foreground">
                        View and export student attendance records from gate
                        scans.
                    </p>
                </div>
                <Button
                    onClick={handleExport}
                    variant="outline"
                    className="gap-2"
                >
                    <Download className="h-4 w-4" />
                    Export CSV
                </Button>
            </div>

            {/* Main Content Card */}
            <Card>
                <CardHeader className="border-b border-border p-4 pb-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle className="text-lg">Scan History</CardTitle>
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Date Range */}
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) =>
                                        setDateFrom(e.target.value)
                                    }
                                    className="w-[150px] pl-9"
                                    placeholder="From"
                                />
                            </div>
                            <span className="text-muted-foreground">to</span>
                            <Input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-[140px]"
                                placeholder="To"
                            />
                            {/* Direction Filter */}
                            <select
                                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={directionFilter}
                                onChange={(e) =>
                                    setDirectionFilter(e.target.value)
                                }
                            >
                                <option value="">All</option>
                                <option value="in">IN</option>
                                <option value="out">OUT</option>
                            </select>
                            {/* Search */}
                            <div className="relative w-full max-w-xs">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search student..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b border-border border-b bg-muted/50">
                                <tr className="border-b transition-colors hover:bg-muted/50">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                        Direction
                                    </th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                        Student
                                    </th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                        Grade & Section
                                    </th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                        RFID
                                    </th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                        Date
                                    </th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                        Time
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="h-24 text-center"
                                        >
                                            <span className="inline-flex items-center gap-2 text-muted-foreground">
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                                Loading logs...
                                            </span>
                                        </td>
                                    </tr>
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            No attendance logs found.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr
                                            key={log.id}
                                            className="border-b border-border transition-colors hover:bg-muted/50"
                                        >
                                            <td className="p-4 align-middle">
                                                {log.direction === "in" ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                        <ArrowDownLeft className="h-3 w-3" />
                                                        IN
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                                                        <ArrowUpRight className="h-3 w-3" />
                                                        OUT
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 align-middle font-medium">
                                                {log.student
                                                    ? `${log.student.first_name} ${log.student.last_name}`
                                                    : "Unknown"}
                                            </td>
                                            <td className="p-4 align-middle">
                                                {log.student ? (
                                                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                        Grade{" "}
                                                        {log.student.grade} -{" "}
                                                        {log.student.section}
                                                    </span>
                                                ) : (
                                                    "—"
                                                )}
                                            </td>
                                            <td className="p-4 align-middle font-mono text-sm text-muted-foreground">
                                                {log.rfid_code}
                                            </td>
                                            <td className="p-4 align-middle text-muted-foreground">
                                                {formatDate(log.scanned_at)}
                                            </td>
                                            <td className="p-4 align-middle font-medium">
                                                {formatTime(log.scanned_at)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
