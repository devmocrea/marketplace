# Rate Limiting Implementation

## Overview

This indexer API implements rate limiting using `express-rate-limit` to prevent DDoS attacks and API abuse.

## Configuration

### Standard Rate Limiter

- **Limit**: 100 requests per minute per IP
- **Applied to**: All API endpoints (except `/health`)
- **Headers**: Returns `RateLimit-*` headers with limit info

### Strict Rate Limiter

- **Limit**: 20 requests per minute per IP
- **Applied to**: Resource-intensive endpoints
  - `/wallets/:address/activity`
  - `/wallets/:address/royalty-stats`

## Response Format

When rate limit is exceeded, the API returns:

```json
{
  "error": "Too many requests from this IP, please try again later.",
  "retryAfter": "1 minute"
}
```

**Status Code**: `429 Too Many Requests`

## Rate Limit Headers

All responses include the following headers:

- `RateLimit-Limit`: Maximum number of requests allowed in the window
- `RateLimit-Remaining`: Number of requests remaining in the current window
- `RateLimit-Reset`: Time when the rate limit window resets (Unix timestamp)

## Implementation Details

### Files

- `src/api/rate-limit-middleware.ts` - Rate limiting middleware configuration
- `src/index.ts` - Global rate limiter application
- `src/api/routes.ts` - Endpoint-specific rate limiters
- `src/__tests__/rate-limit.test.ts` - Rate limiting tests

### Customization

To adjust rate limits, modify the configuration in `src/api/rate-limit-middleware.ts`:

```typescript
export const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // Time window in milliseconds
  max: 100, // Maximum requests per window
  // ... other options
});
```

### Excluded Endpoints

The `/health` endpoint is excluded from rate limiting to allow monitoring systems to check service status without restrictions.

## Testing

Run rate limiting tests:

```bash
npm test -- rate-limit.test.ts
```

## Production Considerations

1. **Redis Store**: For production deployments with multiple instances, consider using a Redis-backed store:

   ```bash
   npm install rate-limit-redis
   ```

2. **Trusted Proxies**: If behind a proxy/load balancer, configure Express to trust proxy headers:

   ```typescript
   app.set("trust proxy", 1);
   ```

3. **Custom Key Generator**: For authenticated APIs, consider rate limiting by user ID instead of IP:
   ```typescript
   keyGenerator: (req) => req.user?.id || req.ip;
   ```

## Monitoring

Monitor rate limit violations by checking for `429` status codes in your logs. Consider implementing alerts for sustained high rates of 429 responses, which may indicate:

- Legitimate traffic spikes requiring limit adjustments
- Attempted DDoS attacks
- Misconfigured clients making excessive requests
