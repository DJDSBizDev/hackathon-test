import type { Metadata } from "next";
import "./globals.css";
import { en } from "@/i18n/en";
import { I18nProvider } from "@/i18n/I18nProvider";

export const metadata: Metadata = {
  title: en.app.title,
  description: en.app.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
