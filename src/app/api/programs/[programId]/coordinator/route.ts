import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
	request: Request,
	{ params }: { params: { programId: string } }
) {
	try {
		const { coordinatorId } = await request.json();
		const { programId } = params;

		const program = await db.program.update({
			where: { id: programId },
			data: { coordinatorId },
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

		return NextResponse.json(program);
	} catch (error) {
		console.error('Error updating program coordinator:', error);
		return NextResponse.json(
			{ error: 'Failed to update program coordinator' },
			{ status: 500 }
		);
	}
}

export async function GET(
	request: Request,
	{ params }: { params: { programId: string } }
) {
	try {
		const { programId } = params;

		const program = await db.program.findUnique({
			where: { id: programId },
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

		if (!program) {
			return NextResponse.json(
				{ error: 'Program not found' },
				{ status: 404 }
			);
		}

		return NextResponse.json(program);
	} catch (error) {
		console.error('Error fetching program:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch program' },
			{ status: 500 }
		);
	}
}