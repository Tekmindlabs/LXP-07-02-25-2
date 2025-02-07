import { wsHandler } from '@/server/ws/websocket-server';

export function GET(req: Request) {
	// This is needed to handle WebSocket upgrade
	const socket = (req as any).socket;
	const head = (req as any).head;

	wsHandler.handleUpgrade(req, socket, head);

	return new Response(null, { status: 101 });
}