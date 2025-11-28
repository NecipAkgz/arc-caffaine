import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/components/WalletProvider";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "ArcCaffeine - Buy Me a Coffee on Arc",
  description: "Decentralized donations on Arc Testnet",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <WalletProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground bg-secondary/30">
              <p>Built with ☕️ on Arc Testnet</p>
            </footer>
          </div>
          <Toaster position="bottom-right" theme="dark" />
        </WalletProvider>
      </body>
    </html>
  );
}
