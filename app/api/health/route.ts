import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import Redis from 'ioredis';

const kv = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
  lazyConnect: true,
});

export async function GET() {
  try {
    const checks = {
      mongodb: false,
      kv: false,
      timestamp: new Date().toISOString()
    };

    try {
      const client = await clientPromise;
      await client.db().admin().ping();
      checks.mongodb = true;
    } catch (error) {
      console.error('MongoDB health check failed:', error);
    }

    try {
      await kv.set('health:check', Date.now().toString(), 'EX', 10);
      const value = await kv.get('health:check');
      checks.kv = value !== null;
    } catch (error) {
      console.error('KV health check failed:', error);
    }

    const allHealthy = checks.mongodb && checks.kv;

    return NextResponse.json(
      {
        status: allHealthy ? 'healthy' : 'degraded',
        checks
      },
      { status: allHealthy ? 200 : 503 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}
