import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper";
import { ApolloProviderWrapper } from "@/components/providers/ApolloProviderWrapper";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { cookies } from "next/headers";

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

  let token = 'no-auth';
  if (process.env.NODE_ENV === 'development'){
    token = cookies().get('next-auth.session-token')?.value ?? token;
  } else if (process.env.NODE_ENV === 'production'){
    token = cookies().get('__Secure-next-auth.session-token')?.value ?? token;
  }

  return (
    <SessionWrapper>
        <ApolloProviderWrapper token={token}>
          <html lang="en">
            <body className={inter.className}>
              <ToastContainer />
              {children}
            </body>
          </html>
        </ApolloProviderWrapper>
    </SessionWrapper>
  );
}
