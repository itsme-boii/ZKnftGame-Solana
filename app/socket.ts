import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";


const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3001;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();


interface Player {
    id: string;
    cards?: number[];
}

app.prepare().then(() => {
    const httpServer = createServer(handler);

    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    let waitingPlayers: Player[] = [];
    const connectedPlayers: Set<string> = new Set();

    io.on("connection", (socket) => {
        console.log("A user connected:", socket.id);

        const updatePlayerCount = () => {
            console.log("emited count ",connectedPlayers.size);
            io.emit("playerCount", connectedPlayers.size);
        };


        function getRandomPlayers(queue: Player[], count = 2): Player[] {
            const players: Player[] = [];
            for (let i = 0; i < count; i++) {
                if (queue.length === 0) break;
                const randomIndex = Math.floor(Math.random() * queue.length);
                players.push(queue.splice(randomIndex, 1)[0]);
            }
            return players;
        }

        const matchPlayers = () => {
            if (waitingPlayers.length >= 2) {
                const [player1, player2] = getRandomPlayers(waitingPlayers);
                if (player1 && player2) {
                    const roomId = `room-${player1.id}-${player2.id}`;
                    io.to(player1.id).emit("matchFound", { roomId, opponent: player2 });
                    io.to(player2.id).emit("matchFound", { roomId, opponent: player1 });
                    console.log(`Match created: ${roomId}`);
                }
            } else {
                console.log("Still waiting for more players...");
                io.to(socket.id).emit("waitingForPlayers", "Finding opponent...")

            }
        };


        socket.on("joinMatchMaking", () => {

            const matchmakingInterval = setInterval(() => {
                matchPlayers();
                if (waitingPlayers.length < 2) {
                    clearInterval(matchmakingInterval);
                }
            }, 5000);
        });

        socket.on("disconnect", () => {
            console.log("A user disconnected:", socket.id);
            connectedPlayers.delete(socket.id);
            waitingPlayers = waitingPlayers.filter((player) => player.id !== socket.id); // Remove player from queue
            updatePlayerCount();
        });

        connectedPlayers.add(socket.id);
        updatePlayerCount();
    });

    httpServer
        .once("error", (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
        });
});
