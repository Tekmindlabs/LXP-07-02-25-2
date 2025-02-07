import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { StudentProfile } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const studentProfileData: StudentProfile = await request.json();
    const newStudentProfile = await prisma.studentProfile.create({
      data: studentProfileData,
    });
    return NextResponse.json(newStudentProfile, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create student profile' }, { status: 500 });
  }
}
