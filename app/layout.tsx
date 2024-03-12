import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper";
import { ApolloProviderWrapper } from "@/components/providers/ApolloProviderWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Inventory",
  description: "DirecTec LLC - Trunk Inventory",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionWrapper>
      <ApolloProviderWrapper>
        <html lang="en">
          <body className={inter.className}>{children}</body>
        </html>
      </ApolloProviderWrapper>
    </SessionWrapper>
  );
}
