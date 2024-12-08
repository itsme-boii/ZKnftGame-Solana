"use client";
import React, { useState } from "react";
import { uploadToPinata } from "./uploadPinata";
import { useWallet } from "@solana/wallet-adapter-react";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { clusterApiUrl } from "@solana/web3.js";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import {
  createNft,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { useEffect } from "react";
import { generateSigner, percentAmount } from "@metaplex-foundation/umi";

/* ---------- This is the main function to Create Nft with actions----------*/
const CreateNft = () => {
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [cardType, setCardType] = useState<string>("");
  const [uri, setUri] = useState<string | null>(null);
  const wallet = useWallet();
  const address = wallet.publicKey?.toBase58() || null;

  const handleImageChange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };
  const handleCardTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setCardType(event.target.value);
  };

  const handleUpload = async () => {
    if (!imageFile) {
      alert("Please select an image!");
      return;
    }
    if (!cardType) {
      alert("Please select a card type!");
      return;
    }

    setIsUploading(true);

    try {
      const ipfsHash = await uploadToPinata(imageFile, null, address);
      setImageUrl(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
      alert("Image uploaded successfully!");
      const metadata = generateMetadata(
        cardType,
        `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
        address
      );
      const metadataHash = await uploadToPinata(null, metadata, address, true);
      console.log("metadata is uploaded on pinata", metadataHash);
      const metadataUrl = `https://gateway.pinata.cloud/ipfs/${metadataHash}`;
      setUri(metadataUrl);
      alert("MetaData is uploaded on pinata");
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleMint = async () => {
    if (!uri) {
      alert("Please upload an image and metadata first!");
      return;
    }

    if (wallet.publicKey && wallet.connected) {
      const umi = createUmi("https://api.devnet.solana.com");
      umi.use(walletAdapterIdentity(wallet)).use(mplTokenMetadata());

      try {
        const { signature, result } = await createNft(umi, {
          mint: generateSigner(umi),
          name: "Card NFT",
          uri: uri,
          updateAuthority: umi.identity.publicKey,
          sellerFeeBasisPoints: percentAmount(0),
        }).sendAndConfirm(umi, { send: { commitment: "finalized" } });

        alert("NFT Minted Successfully!");
        console.log("NFT minted with signature:", signature, "Result:", result);
      } catch (error) {
        console.error("Error minting NFT:", error);
      }
    } else {
      alert("Please connect your wallet to mint an NFT.");
    }
  };
  const generateMetadata = (
    type: string,
    imageUrl: string,
    address: string | null
  ) => {
    let metadata: any = {
      attributes: [],
      properties: {
        files: [
          {
            uri: imageUrl,
            type: "image/png | image/jpg | image/jpeg",
          },
        ],
        creators: [{ address, share: 100 }],
      },
      image: imageUrl,
    };
    if (type === "Attack") {
      metadata.attributes.push({ trait_type: "Type", value: "Attack" });
      metadata.attributes.push({
        trait_type: "Attack Power",
        value: Math.floor(Math.random() * 41) + 80,
      });
      metadata.attributes.push({
        trait_type: "Defense Power",
        value: Math.floor(Math.random() * 21) + 10,
      });
    } else if (type === "Defense") {
      metadata.attributes.push({ trait_type: "Type", value: "Defense" });
      metadata.attributes.push({
        trait_type: "Attack Power",
        value: Math.floor(Math.random() * 21) + 10,
      });
      metadata.attributes.push({
        trait_type: "Defense Power",
        value: Math.floor(Math.random() * 31) + 70,
      });
    } else if (type === "Hybrid") {
      metadata.attributes.push({ trait_type: "Type", value: "Hybrid" });
      metadata.attributes.push({
        trait_type: "Attack Power",
        value: Math.floor(Math.random() * 31) + 50,
      });
      metadata.attributes.push({
        trait_type: "Defense Power",
        value: Math.floor(Math.random() * 31) + 50,
      });
      metadata.attributes.push({
        trait_type: "Respawn Points",
        value: Math.floor(Math.random() * 3) + 1,
      });
    }
    return metadata;
  };

  return (
    <div>
      <h1>Upload Image to Pinata</h1>
      <div>
        <label htmlFor="cardType">Select Card Type:</label>
        <select id="cardType" value={cardType} onChange={handleCardTypeChange}>
          <option value="">-- Select Type --</option>
          <option value="Attack">Attack</option>
          <option value="Defense">Defense</option>
          <option value="Hybrid">Hybrid</option>
        </select>
      </div>

      <input type="file" onChange={handleImageChange} />
      <button onClick={handleUpload} disabled={isUploading}>
        {isUploading ? "Uploading..." : "Upload to Pinata"}
      </button>

      {imageUrl && (
        <div>
          <h2>Uploaded Image:</h2>
          <img src={imageUrl} alt="Uploaded" width="200" />
          <p>
            IPFS URL:{" "}
            <a href={imageUrl} target="_blank" rel="noopener noreferrer">
              {imageUrl}
            </a>
          </p>
        </div>
      )}

      <button onClick={handleMint} disabled={!uri}>
        Mint NFT
      </button>
    </div>
  );
};

export default CreateNft;
