import type { Metadata, Viewport } from "next";
import ServiceWorkerRegistration from "./service-worker-registration";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Freddies WiFi | Network operations",
    template: "%s | Freddies WiFi",
  },
  description: "Secure, multi-tenant ISP operations and subscriber management.",
  manifest: "/manifest.webmanifest",
  applicationName: "Freddies WiFi",
};

export const viewport: Viewport = {
  themeColor: "#0b1724",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
