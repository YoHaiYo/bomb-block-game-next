import Footer from "./component/Footer";
import Navbar from "./component/Navbar";
import { headers } from "next/headers";
import Script from "next/script";
import "./globals.css";
import AnalyticsWrapper from "./component/AnalyticsWrapper"; // ✅ 수정된 부분
import BodyWrapper from "./component/BodyWrapper";

export const metadata = {
  title: "BlockGG",
  description:
    "New meta of block games! This is a novel collection of web block games.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-P4K5RR52Z6"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-P4K5RR52Z6', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
        {/* fontawesome */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
        />
        {/* font : pretendard */}
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <BodyWrapper>
        {/* ✅ 클라이언트 컴포넌트로 분리된 Analytics */}
        <AnalyticsWrapper />
        {/* <Navbar /> */}
        {children}

        {/* <Footer /> */}
      </BodyWrapper>
    </html>
  );
}
