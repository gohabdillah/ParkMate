import { createClient, RedisClientType } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

class RedisClient {
  private static instance: RedisClient;
  private client: RedisClientType;

  private constructor() {
    const redisHost = process.env.REDIS_HOST || 'localhost';
    const redisPort = parseInt(process.env.REDIS_PORT || '6379');
    
    this.client = createClient({
      socket: {
        host: redisHost,
        port: redisPort,
        // Force IPv4 to avoid IPv6 connection issues
        family: 4,
      },
      password: process.env.REDIS_PASSWORD || undefined,
    });

    this.client.on('connect', () => {
      console.log(`✅ Redis connected successfully to ${redisHost}:${redisPort}`);
    });

    this.client.on('error', (err) => {
      console.error('❌ Redis Client Error', err);
    });

    this.client.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...');
    });
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  public async connect(): Promise<void> {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  public async disconnect(): Promise<void> {
    if (this.client.isOpen) {
      await this.client.quit();
    }
  }

  public getClient(): RedisClientType {
    return this.client;
  }

  // Cache helper methods
  public async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  public async set(key: string, value: string, expirationInSeconds?: number): Promise<void> {
    if (expirationInSeconds) {
      await this.client.setEx(key, expirationInSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  public async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  public async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }
}

export default RedisClient;
