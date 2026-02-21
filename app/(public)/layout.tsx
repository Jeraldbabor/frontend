import Header from "@/components/landing/header";
import Footer from "@/components/landing/footer";

/**
 * Public Layout
 *
 * Wraps all public-facing pages (landing, etc.) with the header and footer.
 * Admin pages use a separate (admin) layout with the sidebar instead.
 */
export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Header />
            <main>{children}</main>
            <Footer />
        </>
    );
}
