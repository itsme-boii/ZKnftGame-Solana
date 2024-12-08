"use client";
import Image from "next/image";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

export const Card = React.memo(
  ({
    card,
    index,
    hovered,
    setHovered,
  }: {
    card: any;
    index: number;
    hovered: number | null;
    setHovered: React.Dispatch<React.SetStateAction<number | null>>;
  }) => (
    <div
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "rounded-lg relative bg-gray-100 dark:bg-neutral-900 overflow-hidden h-60 md:h-96 w-full transition-all duration-300 ease-out",
        hovered !== null && hovered !== index && "blur-sm scale-[0.98]"
      )}
    >
      {card.image?(
      <Image
        src={card.image}
        alt={card.type}
        fill
         sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover absolute inset-0"
      />
      ):(
        <div>Image not found</div>
      )
    }
      <div
        className={cn(
          "absolute inset-0 bg-black/50 flex items-end py-8 px-4 transition-opacity duration-300",
          hovered === index ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="flex flex-col text-2xl md:text-2xl font-bold  bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-200">
          <div className="text-lg font-semibold">{card.type}</div>

          {card.attack && (
            <div className="mt-2 text-sm text-neutral-200">
              <strong>Attack:</strong> {card.attack}
            </div>
          )}
          {card.defence && (
            <div className="mt-2 text-sm text-neutral-200">
              <strong>Defence:</strong> {card.defence}
            </div>
          )}
          {card.respawnPoints!="N/A" ?(
            <div className="mt-2 text-sm text-neutral-200">
              <strong>Respawn Points:</strong> {card.respawnPoints}
            </div>
          ):(<div></div>)}
        </div>
      </div>
        
    </div>
  )
);

Card.displayName = "Card";


type Card = {
  type:string,
  image:string,
  attack:string,
  defence:string,
  respawnPoints:string,
}

export function FocusCards({ cards }: { cards: Card[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto md:px-8 w-full">
      {cards.map((card, index) => (
        <Card
          key={`${card.image}-${card.attack}-${index}`}
          card={card}
          index={index}
          hovered={hovered}
          setHovered={setHovered}
        />
      ))}
    </div>
  );
}
