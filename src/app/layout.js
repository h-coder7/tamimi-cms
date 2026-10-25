import { Cairo, Poppins } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import BootstrapClient from "@/components/BootstrapClient";
import DeferredHeavyStyles from "@/components/DeferredHeavyStyles";
import "./globals.scss";
import { Toaster } from "react-hot-toast";
import { publicPath } from "@/utils/publicPath";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import LocaleBootstrap from "@/components/LocaleBootstrap";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata = {
  title: "tamimi cms",
  description: "tamimi cms",
  icons: {
    icon: publicPath("/icon.png"),
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} ${cairo.variable}`} suppressHydrationWarning={true}>
        <BootstrapClient />
        <DeferredHeavyStyles />
        <LocaleBootstrap />
        <Toaster position="top-center" reverseOrder={false} />
        <ReactQueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
