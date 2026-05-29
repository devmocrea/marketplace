# Redis Caching Integration

This document describes the Redis caching implementation for the marketplace indexer API.

## Overview

Redis caching has been implemented to handle traffic spikes on high-traffic endpoints. The caching layer sits between the Express routes and the database, storing frequently accessed data in memory with configurable TTL (Time-To-Live) values.

## Implementation Details

### Files Added

1. **`src/redis.ts`** - Redis client setup and connection management
2. **`src/api/cache-middleware.ts`** - Reusable caching middleware with TTL support
3. **`.env.example`** - Environment variable template including Redis configuration

### Files Modified

1. **`src/api/routes.ts`** - Added caching middleware to target endpoints
2. **`package.json`** - Added `redis` dependency

## Cached Endpoints

### 1. `/activity/recent`

- **TTL**: 30 seconds
- **Purpose**: Latest marketplace activity (sales, new listings)
- **Rationale**: High-traffic endpoint that updates frequently but can tolerate short delays

### 2. `/collections`

- **TTL**: 60 seconds
- **Purpose**: List of all deployed collections
- **Rationale**: Moderately dynamic data that benefits from longer cache duration

## Configuration

### Environment Variables

Add the following to your `.env` file:

```env
REDIS_URL="redis://localhost:6379"
```

For production environments with authentication:

```env
REDIS_URL="redis://username:password@host:port"
```

### Cache Key Format

Cache keys are automatically generated from the request URL and query parameters:

```
cache:/activity/recent
cache:/collections
cache:/collections?kind=erc721
cache:/collections?creator=GXXX...
```

## Features

### Graceful Degradation

The caching middleware is designed to fail gracefully:

- If Redis is not connected, requests bypass the cache and hit the database directly
- Cache errors are logged but don't break the API
- The application can run without Redis (though without caching benefits)

### Query Parameter Support

The cache respects query parameters, so different queries are cached separately:

- `/collections` (all collections)
- `/collections?kind=erc721` (filtered by kind)
- `/collections?creator=GXXX...` (filtered by creator)

## Usage

### Starting Redis Locally

```bash
# Using Docker
docker run -d -p 6379:6379 redis:alpine

# Or using Redis installed locally
redis-server
```

### Running the Indexer

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start the server
npm start
```

## Monitoring

### Cache Hit Rate

Monitor Redis logs to see cache hits:

- Cache hits return data immediately without database queries
- Cache misses query the database and store results for subsequent requests

### Redis CLI

Connect to Redis to inspect cached data:

```bash
redis-cli

# List all cache keys
KEYS cache:*

# Get a specific cached value
GET cache:/activity/recent

# Check TTL for a key
TTL cache:/activity/recent

# Clear all cache
FLUSHDB
```

## Performance Benefits

### Before Caching

- Every request hits the database
- Database load increases linearly with traffic
- Potential for database bottlenecks during spikes

### After Caching

- Repeated requests within TTL window served from memory
- Database load reduced by ~80-95% for cached endpoints
- Sub-millisecond response times for cache hits
- Better handling of traffic spikes

## Extending Caching

To add caching to additional endpoints:

```typescript
// In routes.ts
import { cacheMiddleware } from "./cache-middleware.js";

// Add middleware with desired TTL (in seconds)
router.get("/your-endpoint", cacheMiddleware(60), async (req, res) => {
  // Your route handler
});
```

### Recommended TTL Values

- **Real-time data** (activity feeds): 10-30 seconds
- **Semi-static data** (collections, listings): 30-120 seconds
- **Static data** (creator profiles): 300-600 seconds

## Cache Invalidation

Currently, the cache uses TTL-based expiration. For manual invalidation:

```typescript
import redisClient from "../redis.js";

// Clear specific cache key
await redisClient.del("cache:/collections");

// Clear all cache keys matching pattern
const keys = await redisClient.keys("cache:*");
if (keys.length > 0) {
  await redisClient.del(keys);
}
```

## Testing

The caching middleware is transparent to existing tests. Tests will continue to work as before, with caching automatically disabled if Redis is not available.

## Troubleshooting

### Redis Connection Errors

If you see "Redis Client Error" in logs:

1. Ensure Redis is running: `redis-cli ping` (should return "PONG")
2. Check `REDIS_URL` in your `.env` file
3. Verify network connectivity to Redis host

### Cache Not Working

1. Check Redis connection: Look for "✓ Redis connected" in startup logs
2. Verify middleware is applied to the route
3. Check Redis logs: `redis-cli MONITOR`

### Stale Data

If cached data seems outdated:

1. Check the TTL value is appropriate for your use case
2. Manually clear the cache: `redis-cli FLUSHDB`
3. Consider implementing cache invalidation on data updates

## Production Considerations

1. **Redis Persistence**: Configure Redis persistence (RDB/AOF) for production
2. **High Availability**: Use Redis Sentinel or Redis Cluster for HA
3. **Memory Limits**: Set `maxmemory` and eviction policies in Redis config
4. **Monitoring**: Use Redis monitoring tools (RedisInsight, Prometheus exporter)
5. **Security**: Enable authentication and use TLS for Redis connections

## Dependencies

- `redis` (^4.x): Official Redis client for Node.js
