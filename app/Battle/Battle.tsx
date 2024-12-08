"use client"
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";

interface Player {
    id: string;
    cards: number[];
}

interface NFT {
  type: string,
  image: string,
  attack: string,
  defence: string,
  respawnPoints: string,
}

const socket: Socket = io("http://localhost:3001");

const Battle = ( {nfts}:{nfts:NFT[]}) => {
    const [selectedCards, setSelectedCards] = useState<string[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const router = useRouter();

    useEffect(() => {
        socket.on("matchFound", ({ roomId, opponent }: { roomId: string; opponent: Player }) => {
          alert(`Match found`); // Here add the name of user
          router.push(`/game?roomId=${roomId}&opponent=${opponent.id}`);
        });
        return () => {
          socket.off("matchFound");
        };
      }, [router]);


      const handleCardSelect = (cardId: string) => {
        console.log("Selected card:", cardId);
        if (selectedCards.includes(cardId)) {
          setSelectedCards(selectedCards.filter((id) => id !== cardId));
        } else if (selectedCards.length < 4) {
          setSelectedCards([...selectedCards, cardId]);
        }
      };
      
      const startMatchmaking = () => {
        if (selectedCards.length !== 4) {
          alert("Please select exactly 4 cards.");
          return;
        }
    
        setIsSearching(true);
        socket.emit("joinMatchMaking", { name: "Player", cards: selectedCards });
      };

      return (
        <div>
          <h1>Select 4 Cards to Battle</h1>
          <div className="cards">
            {nfts.map((card) => (
              <div
                key={card.image}
                className={`card ${selectedCards.includes(card.image) ? "selected" : ""}`}
                onClick={() => handleCardSelect(card.image)}
              >
                <img src={card.image} alt={card.image} />
                <p>{card.image}</p>
              </div>
            ))}
          </div>
          <div className="bg-red-600">
          <button onClick={startMatchmaking} disabled={isSearching}>
            {isSearching ? "Searching for Match..." : "Battle"}
          </button>
          </div>
        </div>
      );
    };
    

export default Battle
