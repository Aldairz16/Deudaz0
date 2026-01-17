import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { AuthWrapper } from "@/components/auth/auth-wrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Deudazo",
  description: "Administra tus finanzas simplemente.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthWrapper>
            <div className="flex min-h-screen">
              <Sidebar />
              {/* Main content area: allow scrolling, adjust padding for desktop */}
              <main className="flex-1 pb-20 md:pb-0 px-4 py-8 md:px-8 overflow-y-auto h-screen">
                <div className="max-w-2xl md:max-w-5xl mx-auto">
                  {children}
                </div>
              </main>
            </div>
            {/* BottomNav is hidden on desktop via CSS class in the component itself */}
            <BottomNav />
          </AuthWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
