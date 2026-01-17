import type { Metadata } from "next";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";


export const metadata: Metadata = {
  title: "MemeHub",
  description: "MemeHub is a meme sharing platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) 
{
  return (
    <html lang="en">
      <body
        className={"bg-white"}
      >
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
        >
        <UserProvider>
        {children}
        </UserProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
