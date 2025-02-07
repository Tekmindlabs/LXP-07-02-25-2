import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
	try {
		const programs = await db.program.findMany({
			include: {
				coordinator: {
					include: {
						user: {
							select: {
								name: true,
								email: true,
							},
						},
					},
				},
			},
		});

		return NextResponse.json(programs);
	} catch (error) {
		console.error('Error fetching programs:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch programs' },
			{ status: 500 }
		);
	}
}