import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
	try {
		const coordinators = await db.coordinatorProfile.findMany({
			include: {
				user: {
					select: {
						name: true,
						email: true,
					},
				},
			},
		});

		return NextResponse.json(coordinators);
	} catch (error) {
		console.error('Error fetching coordinators:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch coordinators' },
			{ status: 500 }
		);
	}
}