import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function pushDatabase() {
	try {
		console.log('Starting database push...');
		
		// Run prisma db push
		const { stdout, stderr } = await execAsync('npx prisma db push');
		
		if (stderr) {
			console.error('Error during database push:', stderr);
			throw new Error(stderr);
		}
		
		console.log('Database push completed:', stdout);
		
		// Generate Prisma Client
		await execAsync('npx prisma generate');
		console.log('Prisma Client generated successfully');
		
		return true;
	} catch (error) {
		console.error('Failed to push database:', error);
		throw error;
	}
}

export async function resetDatabase() {
	const prisma = new PrismaClient();
	try {
		console.log('Resetting database...');
		await prisma.$executeRaw`DROP SCHEMA public CASCADE`;
		await prisma.$executeRaw`CREATE SCHEMA public`;
		await pushDatabase();
		console.log('Database reset completed');
	} catch (error) {
		console.error('Failed to reset database:', error);
		throw error;
	} finally {
		await prisma.$disconnect();
	}
}