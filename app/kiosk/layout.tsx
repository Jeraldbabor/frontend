import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "CampusEye Gate Scanner",
    description: "RFID attendance scanner kiosk for school gate monitoring",
};

/**
 * Kiosk Layout
 *
 * Clean, standalone layout without the admin sidebar.
 * Used for the full-screen gate scanner kiosk interface.
 */
export default function KioskLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
