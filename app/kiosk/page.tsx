"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";

/**
 * Kiosk Gate Scanner Page
 *
 * Full-screen dedicated UI for the school gate RFID scanner.
 * - Listens for keyboard input (USB RFID readers emulate keyboard typing)
 * - Sends scanned RFID code to the backend API
 * - Displays scan result with success/error animations
 * - Auto-clears after 5 seconds for the next scan
 */

interface ScanResult {
    success: boolean;
    message: string;
    student?: {
        id: number;
        name: string;
        grade: string;
        section: string;
    };
    scan?: {
        direction: "in" | "out";
        scanned_at: string;
    };
}

// Config — set these for your deployment
const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const KIOSK_API_KEY =
    process.env.NEXT_PUBLIC_KIOSK_API_KEY || "campuseye-kiosk-secret-key-2026";
const SCHOOL_ID = process.env.NEXT_PUBLIC_SCHOOL_ID || "1";

export default function KioskPage() {
    const [rfidBuffer, setRfidBuffer] = useState("");
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [scanning, setScanning] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [scanCount, setScanCount] = useState(0);
    const clearTimerRef = useRef<NodeJS.Timeout | null>(null);
    const bufferTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Update clock every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Process the RFID scan
    const processScan = useCallback(
        async (code: string) => {
            if (!code.trim() || scanning) return;

            setScanning(true);
            setScanResult(null);

            try {
                const response = await axios.post(
                    `${API_BASE_URL}/kiosk/scan`,
                    {
                        rfid_code: code.trim(),
                        school_id: parseInt(SCHOOL_ID),
                    },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "X-Kiosk-Api-Key": KIOSK_API_KEY,
                        },
                    }
                );

                setScanResult(response.data);
                setScanCount((prev) => prev + 1);
            } catch (error) {
                if (axios.isAxiosError(error) && error.response) {
                    setScanResult({
                        success: false,
                        message:
                            error.response.data.message ||
                            "Scan failed. Please try again.",
                        student: error.response.data.student,
                    });
                } else {
                    setScanResult({
                        success: false,
                        message:
                            "Connection error. Please check the kiosk setup.",
                    });
                }
            } finally {
                setScanning(false);

                // Auto-clear result after 5 seconds
                if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
                clearTimerRef.current = setTimeout(() => {
                    setScanResult(null);
                }, 5000);
            }
        },
        [scanning]
    );

    // Listen for keyboard input (USB RFID reader emulates keyboard)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore modifier keys
            if (e.ctrlKey || e.altKey || e.metaKey) return;

            if (e.key === "Enter") {
                // Enter key = end of RFID scan
                if (rfidBuffer.trim()) {
                    processScan(rfidBuffer);
                    setRfidBuffer("");
                }
                return;
            }

            // Only accept printable characters
            if (e.key.length === 1) {
                setRfidBuffer((prev) => prev + e.key);

                // Reset buffer after 500ms of inactivity (RFID readers type fast)
                if (bufferTimerRef.current)
                    clearTimeout(bufferTimerRef.current);
                bufferTimerRef.current = setTimeout(() => {
                    setRfidBuffer("");
                }, 500);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [rfidBuffer, processScan]);

    const formatTimeDisplay = (date: Date) => {
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        });
    };

    const formatDateDisplay = (date: Date) => {
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div
            className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
            style={{
                background:
                    "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
            }}
        >
            {/* Subtle animated background */}
            <div
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage:
                        "radial-gradient(circle at 25% 25%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 75% 75%, #8b5cf6 0%, transparent 50%)",
                }}
            />

            {/* Top Bar: Logo + Time */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 backdrop-blur-sm border border-blue-500/30">
                        <svg
                            className="h-6 w-6 text-blue-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                            />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white tracking-tight">
                            CampusEye
                        </h1>
                        <p className="text-xs text-blue-300/70">Gate System</p>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-2xl font-mono font-bold text-white tracking-wider">
                        {formatTimeDisplay(currentTime)}
                    </p>
                    <p className="text-sm text-slate-400">
                        {formatDateDisplay(currentTime)}
                    </p>
                </div>
            </div>

            {/* Bottom stats bar */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-8 py-4 text-sm text-slate-500">
                <span>Scans Today: {scanCount}</span>
                <span>
                    {scanning
                        ? "Processing..."
                        : rfidBuffer
                            ? `Reading: ${rfidBuffer}`
                            : "Ready to scan"}
                </span>
            </div>

            {/* Main Content Area */}
            <div className="relative z-10 flex flex-col items-center gap-8 px-4">
                {/* Idle State */}
                {!scanResult && !scanning && (
                    <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500">
                        {/* Animated scan icon */}
                        <div className="relative">
                            <div className="absolute inset-0 animate-ping rounded-full bg-blue-500/20" />
                            <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-blue-500/10 backdrop-blur-sm border-2 border-blue-500/30">
                                <svg
                                    className="h-16 w-16 text-blue-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={1.5}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                                    />
                                </svg>
                            </div>
                        </div>

                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-white mb-2">
                                Tap Your ID Card
                            </h2>
                            <p className="text-lg text-slate-400">
                                Place your RFID card on the scanner
                            </p>
                        </div>
                    </div>
                )}

                {/* Scanning State */}
                {scanning && (
                    <div className="flex flex-col items-center gap-6 animate-in fade-in duration-200">
                        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-yellow-500/10 border-2 border-yellow-500/30">
                            <div className="h-12 w-12 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent" />
                        </div>
                        <h2 className="text-2xl font-bold text-yellow-300">
                            Processing...
                        </h2>
                    </div>
                )}

                {/* Success Result */}
                {scanResult && scanResult.success && (
                    <div className="flex flex-col items-center gap-6 animate-in zoom-in-95 fade-in duration-300">
                        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-emerald-500/10 border-2 border-emerald-500/30">
                            {scanResult.scan?.direction === "in" ? (
                                <svg
                                    className="h-16 w-16 text-emerald-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className="h-16 w-16 text-blue-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                                    />
                                </svg>
                            )}
                        </div>

                        <div className="text-center">
                            <div className="mb-2">
                                <span
                                    className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold uppercase tracking-wider ${scanResult.scan?.direction === "in"
                                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                            : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                        }`}
                                >
                                    {scanResult.scan?.direction === "in"
                                        ? "✅ Checked In"
                                        : "👋 Checked Out"}
                                </span>
                            </div>
                            <h2 className="text-4xl font-bold text-white mb-1">
                                {scanResult.student?.name}
                            </h2>
                            <p className="text-lg text-slate-400">
                                Grade {scanResult.student?.grade} — Section{" "}
                                {scanResult.student?.section}
                            </p>
                            <p className="mt-2 text-sm text-slate-500">
                                {scanResult.message}
                            </p>
                        </div>

                        {/* Progress bar for auto-clear */}
                        <div className="w-64 h-1 rounded-full bg-slate-700 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-emerald-500"
                                style={{
                                    animation:
                                        "shrink 5s linear forwards",
                                }}
                            />
                        </div>
                        <style jsx>{`
                            @keyframes shrink {
                                from {
                                    width: 100%;
                                }
                                to {
                                    width: 0%;
                                }
                            }
                        `}</style>
                    </div>
                )}

                {/* Error Result */}
                {scanResult && !scanResult.success && (
                    <div className="flex flex-col items-center gap-6 animate-in zoom-in-95 fade-in duration-300">
                        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-red-500/10 border-2 border-red-500/30">
                            <svg
                                className="h-16 w-16 text-red-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                />
                            </svg>
                        </div>

                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-red-300 mb-2">
                                Scan Error
                            </h2>
                            <p className="text-lg text-slate-400 max-w-md">
                                {scanResult.message}
                            </p>
                            {scanResult.student && (
                                <p className="mt-2 text-sm text-slate-500">
                                    {scanResult.student.name} — Grade{" "}
                                    {scanResult.student.grade},{" "}
                                    {scanResult.student.section}
                                </p>
                            )}
                        </div>

                        {/* Progress bar */}
                        <div className="w-64 h-1 rounded-full bg-slate-700 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-red-500"
                                style={{
                                    animation:
                                        "shrink 5s linear forwards",
                                }}
                            />
                        </div>
                        <style jsx>{`
                            @keyframes shrink {
                                from {
                                    width: 100%;
                                }
                                to {
                                    width: 0%;
                                }
                            }
                        `}</style>
                    </div>
                )}
            </div>
        </div>
    );
}
