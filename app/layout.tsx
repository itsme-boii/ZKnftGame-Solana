import AppWalletProvider from "./SolanaFiles/Solana/AppWalletProvider";
import "./globals.css"
 
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" >
      <body className="bg-black">
        <AppWalletProvider>{children}</AppWalletProvider>
      </body>
    </html>
  );
}