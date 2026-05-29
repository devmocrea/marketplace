import { Request, Response, NextFunction } from 'express';
import redisClient from '../redis.js';

/**
 * Cache middleware with TTL support
 * @param ttl Time-to-live in seconds
 */
export const cacheMiddleware = (ttl: number) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Skip caching if Redis is not connected
        if (!redisClient.isOpen) {
            return next();
        }

        // Generate cache key from request URL and query params
        const cacheKey = `cache:${req.originalUrl || req.url}`;

        try {
            // Try to get cached data
            const cachedData = await redisClient.get(cacheKey);

            if (cachedData) {
                // Cache hit - return cached data
                return res.json(JSON.parse(cachedData));
            }

            // Cache miss - store original json method
            const originalJson = res.json.bind(res);

            // Override json method to cache the response
            res.json = function (data: any) {
                // Cache the response with TTL
                redisClient.setEx(cacheKey, ttl, JSON.stringify(data)).catch((err) => {
                    console.error('Failed to cache data:', err);
                });

                // Send the response
                return originalJson(data);
            };

            next();
        } catch (err) {
            console.error('Cache middleware error:', err);
            next();
        }
    };
};
