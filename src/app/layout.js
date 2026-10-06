import { Poppins } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
// import "./styles/lib/bootstrap.rtl.min.css";
import BootstrapClient from "@/components/BootstrapClient";
import "./styles/lib/all.min.css";

// react-date-range
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import "./globals.scss";
import { Toaster } from "react-hot-toast";
import { publicPath } from "@/utils/publicPath";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100","200","300","400","500","600","700","800","900"],
  style: ["normal","italic"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "Skybridgecrm",
  description: "Skybridge CRM",
  icons: {
    icon: publicPath("/fav.png"),
  },
};





import ReactQueryProvider from "@/providers/ReactQueryProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={poppins.variable} suppressHydrationWarning={true}>
        <BootstrapClient />
        <Toaster position="top-center" reverseOrder={false} />
        <ReactQueryProvider>
                {children}
        </ReactQueryProvider>
      </body>
    </html>
  );
}
