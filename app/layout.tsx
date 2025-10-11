import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Starknet Gateway",
  description: "Your gateway to the Starknet ecosystem",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
