import type { Metadata } from "next";
import {
  ClerkProvider,
} from '@clerk/nextjs'
import "./globals.css";

export const metadata: Metadata = {
  title: "LinkedPulse",
  description: "Manage your LinkedIn content creation all in one place.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          {/* Main content */}
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}