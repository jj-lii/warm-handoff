import "./globals.css";
import { SyntheticNotice } from "./components/SyntheticNotice";
import { Providers } from "./providers";

export const metadata = { title: "Denial check", description: "Synthetic demo. No real patient data." };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          {children}
          <SyntheticNotice />
        </Providers>
      </body>
    </html>
  );
}
