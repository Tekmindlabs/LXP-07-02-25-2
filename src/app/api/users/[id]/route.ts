import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';

interface Params {
  id: string;
}

export async function GET(_: Request, { params }: { params: Params }) {
  try {
    const { id } = params;
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Params }) {
  try {
    const { id } = params;
    const userData = await request.json();
    const updatedUser = await prisma.user.update({
      where: { id },
      data: userData,
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Params }) {
  try {
    const { id } = params;
    await prisma.user.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
