import { WebSocketServer } from 'ws';
import { parse } from 'url';
import { getSession } from 'next-auth/react';
import { EventEmitter } from 'events';

interface WebSocketMessage {
	type: string;
	payload: any;
}

class WebSocketHandler {
	private wss: WebSocketServer;
	private eventEmitter: EventEmitter;

	constructor() {
		this.wss = new WebSocketServer({ noServer: true });
		this.eventEmitter = new EventEmitter();
		this.setupWebSocketServer();
	}

	private setupWebSocketServer() {
		this.wss.on('connection', async (ws, request) => {
			// Authenticate connection
			const session = await getSession({ req: request });
			if (!session) {
				ws.close(1008, 'Unauthorized');
				return;
			}

			const userId = session.user.id;

			// Handle messages
			ws.on('message', async (data) => {
				try {
					const message: WebSocketMessage = JSON.parse(data.toString());
					this.eventEmitter.emit(`message:${message.type}`, {
						userId,
						payload: message.payload,
					});
				} catch (error) {
					console.error('WebSocket message error:', error);
				}
			});

			// Handle client-specific events
			const handleEvent = (eventData: any) => {
				if (eventData.userId === userId) {
					ws.send(JSON.stringify(eventData));
				}
			};

			// Subscribe to events
			this.eventEmitter.on(`user:${userId}`, handleEvent);

			// Cleanup on disconnect
			ws.on('close', () => {
				this.eventEmitter.off(`user:${userId}`, handleEvent);
			});
		});
	}

	public handleUpgrade(request: any, socket: any, head: any) {
		const { pathname } = parse(request.url);

		if (pathname === '/api/ws') {
			this.wss.handleUpgrade(request, socket, head, (ws) => {
				this.wss.emit('connection', ws, request);
			});
		}
	}

	public emit(userId: string, eventType: string, data: any) {
		this.eventEmitter.emit(`user:${userId}`, {
			type: eventType,
			payload: data,
		});
	}
}

export const wsHandler = new WebSocketHandler();