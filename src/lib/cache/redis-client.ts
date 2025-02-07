import { Redis } from '@upstash/redis';

class RedisCache {
	private client: Redis;
	private defaultTTL: number = 3600; // 1 hour

	constructor() {
		this.client = new Redis({
			url: process.env.UPSTASH_REDIS_URL || '',
			token: process.env.UPSTASH_REDIS_TOKEN || '',
		});
	}

	async get<T>(key: string): Promise<T | null> {
		try {
			return await this.client.get<T>(key);
		} catch (error) {
			console.error('Redis get error:', error);
			return null;
		}
	}

	async set(key: string, value: any, ttl?: number): Promise<void> {
		try {
			await this.client.set(key, value, { ex: ttl || this.defaultTTL });
		} catch (error) {
			console.error('Redis set error:', error);
		}
	}

	async delete(key: string): Promise<void> {
		try {
			await this.client.del(key);
		} catch (error) {
			console.error('Redis delete error:', error);
		}
	}

	async invalidatePattern(pattern: string): Promise<void> {
		try {
			const keys = await this.client.keys(pattern);
			if (keys.length > 0) {
				await this.client.del(...keys);
			}
		} catch (error) {
			console.error('Redis invalidate pattern error:', error);
		}
	}
}

export const redisCache = new RedisCache();