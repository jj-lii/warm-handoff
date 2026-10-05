import "./globals.css";
import { Providers } from "./providers";

export const metadata = { title: "Denial check", description: "Synthetic demo. No real patient data." };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
