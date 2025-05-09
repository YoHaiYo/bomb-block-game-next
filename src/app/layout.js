import Footer from "./component/Footer";
import Navbar from "./component/Navbar";
import "./globals.css";

export const metadata = {
  title: "BlockGG",
  description:
    "New meta of block games! This is a novel collection of web block games.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
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
      <body className="">
        {/* <Navbar /> */}
        <main className="mx-auto">{children}</main>

        {/* 토스트 메시지 (기본 숨김) */}
        <div
          id="toast-message"
          className="z-10 fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm shadow-md hidden"
        ></div>

        {/* <Footer /> */}
      </body>
    </html>
  );
}
