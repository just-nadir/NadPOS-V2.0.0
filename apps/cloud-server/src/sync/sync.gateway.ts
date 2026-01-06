import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
    namespace: 'sync',
})
export class SyncGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private logger: Logger = new Logger('SyncGateway');

    handleConnection(client: Socket) {
        const restaurantId = client.handshake.query.restaurantId as string;
        if (restaurantId) {
            client.join(restaurantId);
            this.logger.log(`Client connected: ${client.id} (Restaurant: ${restaurantId})`);
        } else {
            this.logger.warn(`Client connected without restaurantId: ${client.id}`);
        }
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    // Method to be called by SyncService to notify clients of updates
    notifyUpdate(restaurantId: string, table: string) {
        this.server.to(restaurantId).emit('server_data_update', { table, timestamp: new Date().toISOString() });
        this.logger.debug(`Notified ${restaurantId} about ${table} update`);
    }
}
