import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import "./globals.css";
import "./product.css";
import "./v2.css";
import "./v3.css";
import "./v4.css";
import "./v5.css";
import "./v6.css";
import "./v7.css";
import "./v8.css";
import "./v9.css";
import "./v10.css";
import "./v11.css";
import "./v15.css";
import "./v16.css";
import "./v19.css";
import "./i18n.css";
import "./public.css";
import "./social-privacy.css";
import { getLocale } from "@/lib/i18n-server";

const sans = Noto_Sans_KR({
  variable: "--font-gieoi-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const serif = Noto_Serif_KR({
  variable: "--font-gieoi-serif",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Prof. | 목표와 활동 기록, TEAM과 협업 기회",
  description: "Prof.에서 Goal을 만들고 Journey와 Proof를 기록하세요. 사람을 찾고 TEAM을 모집하거나 프로젝트·채용·협업 기회에 지원할 수 있습니다.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0a0a",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return <html lang={locale} className={`${sans.variable} ${serif.variable}`}><body>{children}</body></html>;
}
