import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
export const metadata: Metadata = {
  title: "Retro README Assets",
  description: "GitHub README를 위한 레트로 SVG 위젯",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <div className="shell">
          <header className="site-header">
            <Link href="/">✳ README ASSET LAB</Link>
            <Link href="/widgets/retro">Retro Window ↗</Link>
          </header>
          {children}
          <footer>MADE FOR YOUR GITHUB PROFILE · RETRO WINDOW STUDIO</footer>
        </div>
      </body>
    </html>
  );
}
