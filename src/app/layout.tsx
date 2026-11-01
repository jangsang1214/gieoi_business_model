import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./product.css";

export const metadata: Metadata = {
  title: "기어이 — 살아온 방식으로 만나다",
  description: "실제로 살아온 방향과 Proof로 사람, TEAM, 기회를 연결하는 네트워크",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0a09",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
