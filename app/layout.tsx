import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper";
import { ApolloProviderWrapper } from "@/components/providers/ApolloProviderWrapper";
import { headers } from "next/headers";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { cookies } from "next/headers";
import PrismaProvider from "@/components/providers/PrismaProvider";

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
  

  const token = cookies().get('next-auth.session-token')?.value ?? 'no-auth';

  return (
    <SessionWrapper>
      <PrismaProvider>
        <ApolloProviderWrapper token={token}>
          <html lang="en">
            <body className={inter.className}>
              <ToastContainer />
              {children}
            </body>
          </html>
        </ApolloProviderWrapper>
      </PrismaProvider>
    </SessionWrapper>
  );
}
