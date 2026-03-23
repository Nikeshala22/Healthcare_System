import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Smart Healthcare Platform",
  description: "Healthcare appointment and telemedicine platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}