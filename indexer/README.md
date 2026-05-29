# Afristore Marketplace Indexer

A lightweight off-chain indexer for the Afristore Marketplace Soroban contract. It polls the Stellar RPC for contract events and persists them to a PostgreSQL database, exposing a REST API for the frontend.

## Features

- **Real-time Event Polling**: Subscribes to contract events with cursor-based persistence.
- **Structured Data**: Reconstructs marketplace state (listings, owners, prices).
- **REST API**: Specialized endpoints for artist listings, ownership, and history.
- **Redis Caching**: TTL-based caching for high-traffic endpoints to handle traffic spikes.
- **Docker Ready**: Easy setup with PostgreSQL and Docker Compose.

## REST API Endpoints

- `GET /listings?artist=<address>` - Get all listings created by a specific artist.
- `GET /listings?owner=<address>` - Get all listings currently owned by a specific wallet.
- `GET /listings/:id/history` - Get the full event timeline (creation, updates, sales) for a listing.
- `GET /activity/recent` - Get the latest marketplace activity (sales, new listings). **[Cached: 30s]**
- `GET /collections` - Get all deployed collections. **[Cached: 60s]**
- `GET /wallets/<address>/activity?limit=50` - Event feed for a Stellar address (actor + JSON `buyer` / `artist` / … matches).
- `GET /wallets/<address>/royalty-stats` - Total royalty estimate from **Sold** resales where the wallet is the **original creator** and the seller was someone else (matches on-chain `original_creator != seller` payouts).

**Note**: Endpoints marked with **[Cached]** use Redis caching with the specified TTL to handle traffic spikes efficiently.

`vitest` is configured in **`vitest.config.mts`** (ESM) so the suite does not load Vite’s deprecated CJS Node entry point.

## Setup & Running

### Prerequisites

- Docker & Docker Compose
- **Node.js 20.x** (used in CI, recommended for the TypeScript + Vitest toolchain; Node 18+ is the minimum for current dependencies)

### Quick Start with Docker

1. Update `MARKETPLACE_CONTRACT_ID` in `docker-compose.yml` (or `.env`).
2. Run:
   ```bash
   docker-compose up --build
   ```

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Setup your `.env` file from the example.
3. Start the PostgreSQL database (you can use the one in `docker-compose`).
4. Run migrations:
   ```bash
   npx prisma migrate dev
   ```
5. Start in development mode:
   ```bash
   npm run dev
   ```

## Environment Variables

| Variable                  | Description                   | Default                               |
| ------------------------- | ----------------------------- | ------------------------------------- |
| `PORT`                    | API Port                      | `4000`                                |
| `DATABASE_URL`            | PostgreSQL connection string  | -                                     |
| `REDIS_URL`               | Redis connection string       | `redis://localhost:6379`              |
| `STELLAR_RPC_URL`         | Stellar RPC endpoint          | `https://soroban-testnet.stellar.org` |
| `MARKETPLACE_CONTRACT_ID` | The Soroban contract to index | -                                     |
| `POLL_INTERVAL_MS`        | Polling frequency in ms       | `5000`                                |

## Redis Caching

The indexer uses Redis for caching high-traffic endpoints. See [REDIS_INTEGRATION.md](./REDIS_INTEGRATION.md) for detailed documentation on:

- Setup and configuration
- Cached endpoints and TTL values
- Performance benefits
- Monitoring and troubleshooting
- Production considerations
