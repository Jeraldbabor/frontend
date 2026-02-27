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
        profile_image_url?: string;
        adviser_name?: string;
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
    const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
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

                const newScan = response.data;
                setScanResult(newScan);
                setScanCount((prev) => prev + 1);

                // Add to history (limit to 50 items)
                setScanHistory((prev) => [newScan, ...prev].slice(0, 50));
            } catch (error) {
                let errorResult: ScanResult;
                if (axios.isAxiosError(error) && error.response) {
                    errorResult = {
                        success: false,
                        message:
                            error.response.data.message ||
                            "Scan failed. Please try again.",
                        student: error.response.data.student,
                        scan: { direction: "in", scanned_at: new Date().toISOString() }, // Give fake timestamp for history tracking
                    };
                } else {
                    errorResult = {
                        success: false,
                        message: "Connection error. Please check backend.",
                        scan: { direction: "in", scanned_at: new Date().toISOString() },
                    };
                }

                setScanResult(errorResult);
                setScanHistory((prev) => [errorResult, ...prev].slice(0, 50));
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
        <div className="flex h-screen w-full bg-slate-900 text-slate-100 overflow-hidden font-sans">
            {/* Split Layout Container */}
            <div className="flex w-full h-full relative">

                {/* Left Side: Main Scanning Area (70%) */}
                <div className="relative flex-1 flex flex-col justify-center items-center shadow-2xl z-10"
                    style={{
                        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
                    }}
                >
                    {/* Subtle animated background */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{
                            backgroundImage:
                                "radial-gradient(circle at 25% 25%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 75% 75%, #8b5cf6 0%, transparent 50%)",
                        }}
                    />

                    {/* Top Bar: Logo + Time */}
                    <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 backdrop-blur-sm border border-blue-500/30">
                                <svg
                                    className="h-7 w-7 text-blue-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white tracking-tight">CampusEye</h1>
                                <p className="text-sm text-blue-300/70 uppercase font-semibold tracking-wider">Gate Kiosk</p>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-3xl font-mono font-bold text-white tracking-wider">
                                {formatTimeDisplay(currentTime)}
                            </p>
                            <p className="text-sm font-medium text-slate-400 uppercase tracking-widest mt-1">
                                {formatDateDisplay(currentTime)}
                            </p>
                        </div>
                    </div>

                    {/* Bottom stats bar */}
                    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-8 py-6 bg-slate-900/50 backdrop-blur-md border-t border-slate-700/50">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-sm font-medium text-slate-300">System Active</span>
                        </div>
                        <span className="text-sm font-mono text-slate-400">
                            {scanning ? "Processing stream..." : rfidBuffer ? `Buffer: ${rfidBuffer}` : "Awaiting input stream..."}
                        </span>
                    </div>

                    {/* Main Content Area */}
                    <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-2xl px-8">
                        {/* Idle State */}
                        {!scanResult && !scanning && (
                            <div className="flex flex-col items-center gap-8 animate-in fade-in duration-500 scale-in-95">
                                {/* Animated scan icon */}
                                <div className="relative group cursor-default">
                                    <div className="absolute inset-0 animate-ping rounded-full bg-blue-500/20" />
                                    <div className="relative flex h-48 w-48 items-center justify-center rounded-full bg-blue-500/10 backdrop-blur-sm border-2 border-blue-500/30 transition-transform duration-700 group-hover:scale-105">
                                        <svg className="h-20 w-20 text-blue-400 transform -rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                                        </svg>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <h2 className="text-4xl font-black text-white mb-3 tracking-tight">Tap RFID Card</h2>
                                    <p className="text-xl text-slate-400 font-medium">Please place ID card on the scanner</p>
                                </div>
                            </div>
                        )}

                        {/* Scanning State */}
                        {scanning && (
                            <div className="flex flex-col items-center gap-8 animate-in fade-in duration-200">
                                <div className="flex h-48 w-48 items-center justify-center rounded-full bg-yellow-500/10 border-2 border-yellow-500/30 shadow-[0_0_50px_rgba(234,179,8,0.2)]">
                                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent" />
                                </div>
                                <h2 className="text-3xl font-bold text-yellow-300 tracking-wider animate-pulse">Processing...</h2>
                            </div>
                        )}

                        {/* Success Result */}
                        {scanResult && scanResult.success && (
                            <div className="flex flex-col w-full bg-slate-800/80 backdrop-blur-xl border-2 border-emerald-500/50 rounded-3xl p-10 animate-in zoom-in-95 fade-in duration-300 shadow-[0_0_100px_rgba(16,185,129,0.15)]">
                                <div className="flex flex-col items-center gap-6">
                                    <div className="flex h-32 w-32 items-center justify-center rounded-full bg-emerald-500/10 border-4 border-emerald-500 overflow-hidden">
                                        {scanResult.student?.profile_image_url ? (
                                            <img
                                                src={scanResult.student.profile_image_url}
                                                alt={scanResult.student.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : scanResult.scan?.direction === "in" ? (
                                            <svg className="h-16 w-16 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        ) : (
                                            <svg className="h-16 w-16 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                                            </svg>
                                        )}
                                    </div>

                                    <div className="text-center w-full">
                                        <div className="mb-4">
                                            <span className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-black uppercase tracking-widest ${scanResult.scan?.direction === "in" ? "bg-emerald-500 text-slate-900 shadow-[0_0_20px_rgba(16,185,129,0.5)]" : "bg-blue-500 text-slate-900 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                                                }`}>
                                                {scanResult.scan?.direction === "in" ? "Entrance Approved" : "Exit Approved"}
                                            </span>
                                        </div>
                                        <h2 className="text-5xl font-black text-white mb-2 tracking-tight line-clamp-1">{scanResult.student?.name}</h2>
                                        <p className="text-2xl text-slate-300 font-semibold bg-slate-900/50 inline-block px-6 py-2 rounded-xl mt-2 border border-slate-700">
                                            Grade {scanResult.student?.grade} — {scanResult.student?.section}
                                        </p>
                                        {scanResult.student?.adviser_name && (
                                            <p className="mt-3 text-lg text-emerald-300 font-medium">
                                                Adviser: {scanResult.student.adviser_name}
                                            </p>
                                        )}
                                        <p className="mt-4 text-xl font-medium text-emerald-400">{scanResult.message}</p>
                                    </div>
                                </div>

                                {/* Progress bar for auto-clear */}
                                <div className="w-full h-1.5 rounded-full bg-slate-700/50 overflow-hidden mt-10">
                                    <div className="h-full rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" style={{ animation: "shrink 5s linear forwards" }} />
                                </div>
                            </div>
                        )}

                        {/* Error Result */}
                        {scanResult && !scanResult.success && (
                            <div className="flex flex-col w-full bg-slate-800/80 backdrop-blur-xl border-2 border-red-500/50 rounded-3xl p-10 animate-in zoom-in-95 fade-in duration-300 shadow-[0_0_100px_rgba(239,68,68,0.15)]">
                                <div className="flex flex-col items-center gap-6">
                                    <div className="flex h-32 w-32 items-center justify-center rounded-full bg-red-500/10 border-4 border-red-500">
                                        <svg className="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                        </svg>
                                    </div>

                                    <div className="text-center w-full">
                                        <h2 className="text-4xl font-black text-red-400 mb-4 tracking-tight uppercase">Access Denied</h2>
                                        <p className="text-xl text-slate-300 max-w-md mx-auto h-20 flex items-center justify-center bg-red-950/30 rounded-xl border border-red-900/50 px-6">
                                            {scanResult.message}
                                        </p>

                                        {scanResult.student && (
                                            <div className="mt-6 pt-6 border-t border-slate-700/50">
                                                <p className="text-xl font-bold text-white mb-1">{scanResult.student.name}</p>
                                                <p className="text-md text-slate-400 font-medium">Grade {scanResult.student.grade}, {scanResult.student.section}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className="w-full h-1.5 rounded-full bg-slate-700/50 overflow-hidden mt-10">
                                    <div className="h-full rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" style={{ animation: "shrink 5s linear forwards" }} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: History Sidebar (30%) */}
                <div className="w-[450px] bg-[#111827] border-l border-slate-800 flex flex-col shadow-2xl z-20 shrink-0">
                    <div className="p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Scan History
                            </h2>
                            <span className="text-xs font-bold px-3 py-1 bg-slate-800 rounded-full text-blue-400 border border-slate-700">
                                {scanCount} TODAY
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 font-medium">Real-time gate activity log</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {scanHistory.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4 opacity-50">
                                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p>Expecting scans...</p>
                            </div>
                        ) : (
                            scanHistory.map((scan, idx) => (
                                <div
                                    key={idx}
                                    className={`relative rounded-xl p-4 border transition-all animate-in fade-in slide-in-from-right-4 duration-300 ${idx === 0 ? "bg-slate-800/80 shadow-lg border-slate-700/80" : "bg-slate-900/60 border-slate-800 hover:bg-slate-800/50"
                                        }`}
                                >
                                    {/* Success vs Error Indicator Line */}
                                    <div className={`absolute left-0 top-3 bottom-3 w-1.5 rounded-r-md ${scan.success ? (scan.scan?.direction === 'in' ? 'bg-emerald-500' : 'bg-blue-500') : 'bg-red-500'
                                        }`} />

                                    <div className="flex justify-between items-start pl-3">
                                        <div className="flex-1 min-w-0 pr-3">
                                            {scan.success && scan.student ? (
                                                <>
                                                    <p className="font-bold text-white truncate text-base">{scan.student.name}</p>
                                                    <p className="text-xs text-slate-400 mt-1 font-medium">{scan.student.grade} - {scan.student.section}</p>
                                                </>
                                            ) : (
                                                <p className="font-bold text-red-400 text-sm">Scan Failed</p>
                                            )}
                                        </div>

                                        <div className="flex flex-col items-end shrink-0">
                                            <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-md mb-2 ${scan.success
                                                ? (scan.scan?.direction === "in" ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400")
                                                : "bg-red-500/10 text-red-400"
                                                }`}>
                                                {scan.success ? (scan.scan?.direction === "in" ? "IN" : "OUT") : "ERR"}
                                            </span>
                                            <span className="text-xs font-mono text-slate-500">
                                                {scan.scan?.scanned_at ? new Date(scan.scan.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : formatTimeDisplay(currentTime)}
                                            </span>
                                        </div>
                                    </div>

                                    {!scan.success && (
                                        <p className="mt-2 text-xs text-red-400/80 pl-3 leading-snug">{scan.message}</p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <style jsx global>{`
                    @keyframes shrink {
                        from { width: 100%; }
                        to { width: 0%; }
                    }
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 6px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #334155;
                        border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: #475569;
                    }
                `}</style>
            </div>
        </div>
    );
}
