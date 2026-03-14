import type { Metadata } from "next";
import { Josefin_Sans } from "next/font/google";
import "./globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { UserProvider } from "../context/UserContext";
import { AudioProvider } from "../context/AudioContext";

const josefin = Josefin_Sans({ subsets: ["latin"], weight: ["400", "500", "700"] });

export const metadata: Metadata = {
  title: "AzarCafetero",
  description: "Azar - Login",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

  return (
    <html lang="es" className={josefin.className}>
      <body>
        <GoogleOAuthProvider clientId={googleClientId}>
          <UserProvider>
            <AudioProvider>
              {children}
            </AudioProvider>
          </UserProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
