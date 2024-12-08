"use client";

import dynamic from "next/dynamic";
import { EvervaultCard, Icon } from "@/components/ui/evervault-card";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react";

const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then((mod) => mod.WalletMultiButton),
  { ssr: false }
);


export default function Home() {
  const wallet = useWallet();
  const [isConnected, setIsConnected] = useState(false);
  const router = useRouter();
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    if (wallet.connected) {
      router.push("/Dashboard")
    }
  }, [wallet.connected, router])

  const handleWalletConnect = useCallback(async () => {
    try {
      if (!wallet.connected) {
        await wallet.connect();
        setIsConnected(true);
      }
    } catch (error: any) {
      if (error.message.includes("User rejected the request")) {
        setConnectionError("Wallet connection was rejected.");
      } else {
        setConnectionError("An error occurred while connecting the wallet.");
      }
    }
  }, [wallet]);

  return (
    <>
      <main className="flex justify-center items-center min-h-screen overflow-hidden">


        <BackgroundBeamsWithCollision className=" h-screen">

          <div className="border border-black/[0.2] dark:border-white/[0.2] flex flex-col items-start max-w-sm mx-auto p-4 aspect-[16/9] relative h-[30rem]">
            <Icon className="absolute h-6 w-6 -top-3 -left-3 dark:text-white text-black" />
            <Icon className="absolute h-6 w-6 -bottom-3 -left-3 dark:text-white text-black" />
            <Icon className="absolute h-6 w-6 -top-3 -right-3 dark:text-white text-black" />
            <Icon className="absolute h-6 w-6 -bottom-3 -right-3 dark:text-white text-black" />
            <h2 className="text-white font-bold flex justify-center text-center w-full">
              Connect your Wallet to continue
            </h2>
  

            <EvervaultCard className="">
              <WalletMultiButton onClick={handleWalletConnect} />


            </EvervaultCard>
            <p className="text-white w-full text-center">ZFT Combat</p>

          </div>

        </BackgroundBeamsWithCollision>

      </main>


    </>
  );
}