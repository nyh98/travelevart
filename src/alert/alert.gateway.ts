import { 
    WebSocketGateway,
    SubscribeMessage,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect
 } from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { AlertService } from "./alert.service";

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})

export class AlertGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private onlineUsers: Map<number, string> = new Map();

    constructor(
        private readonly alertService: AlertService
    ) {}

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`)
    }

    handleDisconnect(client: Socket) {
        const userId = this.getUserIdBySocketId(client.id);
        if (userId) {
          this.onlineUsers.delete(userId);
        }
        console.log(`Client disconnected: ${client.id}`);
      }

    @SubscribeMessage('registerUser')
    handleRegisterUser(client: Socket, payload: any) {
        console.log(`Received payload: ${JSON.stringify(payload)}`);
    
        // payload가 객체일 경우, 데이터가 payload.data에 들어있을 가능성이 높습니다.
        const userId = payload.data; 
    
        if (typeof userId !== 'number') {
            console.log('Invalid userId received:', userId);
            return;
        }
    
        this.onlineUsers.set(userId, client.id);
        console.log(`User registered: ${userId}`);
    }

    sendAlertToUser(userId: number, message: number) {
        const socketId = this.onlineUsers.get(userId);
        if (socketId) {
            this.server.to(socketId).emit('newAlert', message);
        }
    }

    getUserIdBySocketId(socketId: string): number | undefined {
        for (const [userId, id] of this.onlineUsers) {
            if (id === socketId) {
                return userId;
            }
        }

        return undefined;
    }
}