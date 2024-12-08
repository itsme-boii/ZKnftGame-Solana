"use client"
import React, { useEffect, useRef } from 'react'
import { FocusCards } from "@/components/ui/focus-cards";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/moving-border";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconUserBolt,
} from "@tabler/icons-react";
import { useState } from 'react'
import { cn } from '@/lib/utils';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation'
import { Connection } from "@solana/web3.js";
import { publicKey } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { fetchAllDigitalAssetWithTokenByOwner } from "@metaplex-foundation/mpl-token-metadata";
// import CreateNft from "../SolanaFiles/Solana/CreateBlob";
// import Battle from "../Battle/Battle"
import { io, Socket } from "socket.io-client";


interface NFTs {
  name: string,
  symbol: string,
  uri: string
}

interface Metadata {
  type: string,
  image: string,
  attack: string,
  defence: string,
  respawnPoints: string,
}

interface Attributes {
  trait_type: string,
  value: string
}
const url = "http://localhost:3001"


const Page = () => {
  const socketRef = useRef<Socket | null>(null);

  const wallet = useWallet();
  const links = [
    {
      label: "Lobby",
      href: "#",
      icon: (
        <IconBrandTabler className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Battle Ground",
      href: "#",
      icon: (
        <IconUserBolt className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Settings",
      href: "#",
      icon: (
        <IconSettings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Logout",
      href: "#",
      icon: (
        <IconArrowLeft className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
      onClick: () => handleLogout(),

    },
  ];
  const [open, setOpen] = useState(false);
  const [owner, setOwner] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<Metadata[] | null>([]);
  // console.log("wallet is ", wallet)
  const [nft, setNft] = useState<NFTs[] | null>(null);
  const [playerCount, setPlayerCount] = useState(0);


  const router = useRouter();

  // useEffect(()=>{
  //   socket.on("connect",()=>{
  //     console.log("Connected to server, socket ID:", socket.id)
  //     socket.emit("getPlayerCount",(count:number)=>{
  //       console.log("player count is ",count);
  //     })
  //   })
  //   return () => {
  //     console.log("disconnected")
  //     socket.off("connect");
  //   };


  // },[socket])

  useEffect(() => {
    console.log("Wallet connected state on refresh is ", wallet.connected)
    if (wallet.connected) {
      if (!socketRef.current) {
        socketRef.current = io(url, { transports: ["websocket"] });

        socketRef.current.on("connect", () => {
          console.log("Connected to server, socket ID:", socketRef.current?.id);
        });

      }
      socketRef.current.on("playerCount", (count) => {
        console.log("count is ", count);
        setPlayerCount(count);
      })
    }

    return () => {
      if (socketRef.current) {
        console.log("Disconnecting socket");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };

  }, [wallet.connected])

  const handleLogout = async () => {
    wallet.disconnect();
    // console.log("wallet disconnected");
    router.push("/LLogin");
  }

  useEffect(() => {
    if (wallet.publicKey) {
      setOwner(wallet.publicKey.toBase58());

    }
  }, [wallet.publicKey])


  useEffect(() => {
    if (!wallet.connected) {
      router.push("/Login")
    }
  }, [wallet.connected,router])


  useEffect(() => {
    const Display = async () => {
      try {
        if (owner != null) {
          await Nfts(owner);
        }
      } catch (error) {
        console.log(error);

      }
    }
    Display()
  }, [owner])

  /* ------------------------- Getting Nfts using Umi ------------------------- */
  const Nfts = async (Inputowner: string) => {
    const owner = publicKey(Inputowner);
    const connection = new Connection('https://api.devnet.solana.com');
    const umi = createUmi(connection);
    if (!owner) {
      console.error("Wallet is not connected. Please connect your wallet.");
      return;
    }
    try {
      const allNFTs = await fetchAllDigitalAssetWithTokenByOwner(
        umi,
        owner,
      );

      const filteredData: NFTs[] = allNFTs.map((data) => ({
        name: data.metadata.name,
        symbol: data.metadata.symbol,
        uri: data.metadata.uri,
      }))
      setNft(filteredData);
      console.log("nfts are ",nft);

      const metadataPromises = filteredData.map(async (nft) => fetchMetadata(nft.uri));
      const metadataResults = await Promise.all(metadataPromises);

      const metadata: Metadata[] = metadataResults
        .filter((data) => data !== null)
        .map((data) => {
          const type = (data?.attributes as Attributes[])?.find(attr => attr.trait_type === "Type")?.value;
          const attack = (data?.attributes as Attributes[])?.find(attr => attr.trait_type === "Attack Power")?.value;
          const defence = (data?.attributes as Attributes[])?.find(attr => attr.trait_type === "Defense Power")?.value;
          const hybrid = (data?.attributes as Attributes[])?.find(attr => attr.trait_type === "Respawn Points")?.value;

          return {
            type: type ? type : 'N/A',
            image: data.image,
            attack: attack ? String(attack) : "N/A",
            defence: defence ? String(defence) : 'N/A',
            respawnPoints: hybrid ? String(hybrid) : 'N/A',
          }
        })
      setMetadata(metadata);
      // console.log('Fetched metadata for NFTs:', metadata);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
    }

  }

  const fetchMetadata = async (uri: string) => {
    try {
      // console.log("Fetching metadata for uri:", uri);
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error("Failed to fetch metadata");
      }
      const metadata = await response.json();
      // console.log("Metadata is", metadata);
      return metadata;

    } catch (error) {
      console.error("Error fetching metadata:", error);
      return null
    }
  }

  const words = `Stronger NFTs, Bigger Kingdoms—Rule Without Limits!`;



  return (
    <div>


      <div
        className={cn(
          "rounded-md flex flex-col md:flex-row bg-black  w-full flex-0 max-w-none mx-auto border-solid border-black  border-2 overflow-x-hidden ",
          "h-screen "
        )}
      >


        <Sidebar open={open} setOpen={setOpen} animate={true}>

          <SidebarBody className="justify-between gap-10 h-screen">
            <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">

              <div className="mt-8 flex flex-col gap-2">
                {links.map((link, idx) => (
                  <SidebarLink key={idx} link={link}
                  />
                ))}
              </div>
            </div>
            <div>
            </div>
          </SidebarBody >
        </Sidebar>

        <div className="flex flex-col w-full space-y-10">

          {metadata && metadata.length > 0 && (
            <div className="p-5 flex flex-col justify-center items-center space-y-5 ">
              <div className='flex flex-row'>
              <Button>Personal NFT Collection</Button>

              <div className=' absolute font-bold text-lg top-6 right-10 '>
              <p className='text-white'>Live Players: {playerCount}</p>
              </div>
              </div>
           
              <TextGenerateEffect words={words} />

            </div>
          )}




          {metadata && metadata.length > 0 ? (
            <FocusCards cards={metadata} />
          ) : (
            <div className="text-white font-bold flex h-screen justify-center w-full items-center">
              <p>Nothing To Display</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

export default Page
