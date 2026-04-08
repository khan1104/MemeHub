import type { Metadata } from "next";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";
import { FeedProvider } from "@/context/FeedContext";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "MeemHub",
  description: "MeemHub is a meme sharing platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) 
{
  return (
    <html lang="en">
      <body className={"bg-white"}>
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
        >
          <UserProvider>
            <FeedProvider>
              {children}
              <Toaster position="top-center" richColors/>
            </FeedProvider>
          </UserProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
