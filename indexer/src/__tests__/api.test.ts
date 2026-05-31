import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';

// ── Mock Prisma before importing the router ───────────────────────────────────

const mockPrisma = vi.hoisted(() => ({
  listing: {
    findMany: vi.fn(),
  },
  marketplaceEvent: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
  },
  collection: {
    findMany: vi.fn(),
  },
}));

const mockRedis = vi.hoisted(() => ({
  isOpen: false,
  isReady: false,
  get: vi.fn(),
  setEx: vi.fn().mockResolvedValue(undefined),
  on: vi.fn(),
  connect: vi.fn().mockRejectedValue(new Error('No Redis')),
}));

vi.mock('../db', () => ({ default: mockPrisma }));
vi.mock('../redis.js', () => ({ default: mockRedis }));

import router from '../api/routes';

// Build a minimal Express app with the router mounted at root
const app = express();
app.use(express.json());
app.use(router);

// ── Sample fixtures ───────────────────────────────────────────────────────────

const sampleListing = {
  listingId: BigInt(1),
  artist: 'GABC123',
  owner: null,
  price: '10000000.0000000',
  currency: 'XLM',
  metadataCid: 'QmTest',
  token: 'CTOKEN',
  status: 'Active',
  royaltyBps: 500,
  createdAtLedger: 100,
  updatedAtLedger: 100,
};

const sampleEvent = {
  id: 1,
  listingId: BigInt(1),
  eventType: 'LISTING_CREATED',
  actor: 'GABC123',
  data: { price: '10000000' },
  ledgerSequence: 100,
  ledgerTimestamp: new Date('2024-01-01T00:00:00Z'),
};

// ── GET /listings ─────────────────────────────────────────────────────────────

describe('GET /listings', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns all listings as JSON', async () => {
    mockPrisma.listing.findMany.mockResolvedValue([sampleListing]);

    const res = await request(app).get('/listings');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
    // BigInt was serialised to string
    expect(res.body[0].listingId).toBe('1');
    expect(res.body[0].artist).toBe('GABC123');
    expect(res.body[0].status).toBe('Active');
  });

  it('filters by artist query param', async () => {
    mockPrisma.listing.findMany.mockResolvedValue([sampleListing]);

    await request(app).get('/listings?artist=GABC123');

    expect(mockPrisma.listing.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { artist: 'GABC123' } })
    );
  });

  it('filters by owner query param', async () => {
    mockPrisma.listing.findMany.mockResolvedValue([]);

    await request(app).get('/listings?owner=GBOWNER');

    expect(mockPrisma.listing.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { owner: 'GBOWNER' } })
    );
  });

  it('applies both artist and owner filters when both are provided', async () => {
    mockPrisma.listing.findMany.mockResolvedValue([]);

    await request(app).get('/listings?artist=GABC&owner=GBOWN');

    expect(mockPrisma.listing.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { artist: 'GABC', owner: 'GBOWN' } })
    );
  });

  it('returns empty array when no listings match', async () => {
    mockPrisma.listing.findMany.mockResolvedValue([]);

    const res = await request(app).get('/listings');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns 500 when Prisma throws', async () => {
    mockPrisma.listing.findMany.mockRejectedValue(new Error('DB down'));

    const res = await request(app).get('/listings');
    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });

  it('caps offset at 10000', async () => {
    mockPrisma.listing.findMany.mockResolvedValue([]);

    await request(app).get('/listings?offset=50000');

    expect(mockPrisma.listing.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10000 })
    );
  });
});

// ── GET /listings/:id/history ─────────────────────────────────────────────────

describe('GET /listings/:id/history', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns the event history for a listing', async () => {
    mockPrisma.marketplaceEvent.findMany.mockResolvedValue([sampleEvent]);

    const res = await request(app).get('/listings/1/history');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].eventType).toBe('LISTING_CREATED');
    // listingId BigInt serialised to string
    expect(res.body[0].listingId).toBe('1');
  });

  it('queries by the correct BigInt listingId', async () => {
    mockPrisma.marketplaceEvent.findMany.mockResolvedValue([]);

    await request(app).get('/listings/42/history');

    expect(mockPrisma.marketplaceEvent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { listingId: BigInt('42') } })
    );
  });

  it('returns empty array when no events exist for the listing', async () => {
    mockPrisma.marketplaceEvent.findMany.mockResolvedValue([]);

    const res = await request(app).get('/listings/99/history');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns 500 when Prisma throws', async () => {
    mockPrisma.marketplaceEvent.findMany.mockRejectedValue(new Error('DB down'));

    const res = await request(app).get('/listings/1/history');
    expect(res.status).toBe(500);
  });
});

// ── GET /activity/recent ──────────────────────────────────────────────────────

describe('GET /activity/recent', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns recent events', async () => {
    const events = Array.from({ length: 5 }, (_, i) => ({
      ...sampleEvent,
      id: i + 1,
      ledgerSequence: 100 + i,
    }));
    mockPrisma.marketplaceEvent.findMany.mockResolvedValue(events);

    const res = await request(app).get('/activity/recent');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(5);
  });

  it('requests at most 20 records ordered by ledger descending', async () => {
    mockPrisma.marketplaceEvent.findMany.mockResolvedValue([]);

    await request(app).get('/activity/recent');

    expect(mockPrisma.marketplaceEvent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 20,
        orderBy: { ledgerSequence: 'desc' },
      })
    );
  });

  it('returns 500 when Prisma throws', async () => {
    mockPrisma.marketplaceEvent.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/activity/recent');
    expect(res.status).toBe(500);
  });
});

// ── GET /collections ─────────────────────────────────────────────────────────

describe('GET /collections', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns all collections', async () => {
    const sample = [{ contractAddress: 'CA', kind: 'normal_721', creator: 'GC', deployedAtLedger: 100 }];
    mockPrisma.collection.findMany.mockResolvedValue(sample);

    const res = await request(app).get('/collections');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('filters by kind query param', async () => {
    mockPrisma.collection.findMany.mockResolvedValue([]);
    await request(app).get('/collections?kind=normal_721');
    expect(mockPrisma.collection.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { kind: 'normal_721' } })
    );
  });

  it('filters by creator query param', async () => {
    mockPrisma.collection.findMany.mockResolvedValue([]);
    await request(app).get('/collections?creator=GCREATOR');
    expect(mockPrisma.collection.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { creator: 'GCREATOR' } })
    );
  });

  it('returns 500 on db error', async () => {
    mockPrisma.collection.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/collections');
    expect(res.status).toBe(500);
  });
});

// ── GET /creators/:address/collections ───────────────────────────────────────

describe('GET /creators/:address/collections', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns collections for a specific creator', async () => {
    const sample = [{ contractAddress: 'CA', kind: 'lazy_1155', creator: 'GCREATOR', deployedAtLedger: 200 }];
    mockPrisma.collection.findMany.mockResolvedValue(sample);

    const res = await request(app).get('/creators/GCREATOR/collections');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('filters by creator address', async () => {
    mockPrisma.collection.findMany.mockResolvedValue([]);
    await request(app).get('/creators/OTHER/collections');
    expect(mockPrisma.collection.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { creator: 'OTHER' } })
    );
  });
});

// ── GET /wallets/:address/activity ───────────────────────────────────────────

describe('GET /wallets/:address/activity', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns recent events for the wallet (actor or JSON field match)', async () => {
    const ev = {
      id: 3,
      listingId: '9',
      eventType: 'ARTWORK_SOLD',
      actor: 'GARTIST',
      data: { artist: 'GARTIST', buyer: 'GBUYER', price: '100' },
      ledgerSequence: 99,
      ledgerTimestamp: new Date('2024-01-15T00:00:00Z'),
    };
    mockPrisma.marketplaceEvent.findMany.mockResolvedValue([ev]);

    const res = await request(app).get('/wallets/GBUYER/activity?limit=10');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].eventType).toBe('ARTWORK_SOLD');
    expect(mockPrisma.marketplaceEvent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 10,
        orderBy: { ledgerSequence: 'desc' },
      })
    );
  });
});

// ── GET /wallets/:address/royalty-stats ──────────────────────────────────────

describe('GET /wallets/:address/royalty-stats', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns totals for resales where the wallet is the original creator', async () => {
    mockPrisma.listing.findMany.mockResolvedValue([
      { listingId: 1n, price: 100, royaltyBps: 1000, updatedAtLedger: 100 },
      { listingId: 2n, price: 200, royaltyBps: 500, updatedAtLedger: 200 },
    ]);

    const res = await request(app).get('/wallets/GCREATOR/royalty-stats');

    expect(res.status).toBe(200);
    expect(res.body.payoutCount).toBe(2);
    expect(parseFloat(res.body.totalEarned)).toBeCloseTo(20, 4);
    expect(res.body.lastPayout).toBe(200000);
    expect(mockPrisma.listing.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          originalCreator: 'GCREATOR',
          status: 'Sold',
          NOT: { artist: 'GCREATOR' },
        },
      })
    );
  });
});

// ── Issue #236 — verify cacheMiddleware, strictRateLimiter, axios are importable
// and the routes that depend on them respond correctly ─────────────────────────

// GET /activity/recent — uses cacheMiddleware(30)
describe('GET /activity/recent — cacheMiddleware wired correctly', () => {
  beforeEach(() => vi.clearAllMocks());

  it('responds 200 and returns events array (cacheMiddleware import resolves)', async () => {
    const events = [
      { id: 1, listingId: BigInt(1), eventType: 'LISTING_CREATED', actor: 'GA', data: {}, ledgerSequence: 10 },
    ];
    mockPrisma.marketplaceEvent.findMany.mockResolvedValue(events);

    const res = await request(app).get('/activity/recent');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Confirms the route handler ran — cacheMiddleware did not throw ReferenceError
    expect(mockPrisma.marketplaceEvent.findMany).toHaveBeenCalled();
  });
});

// GET /collections — uses cacheMiddleware(60)
describe('GET /collections — cacheMiddleware wired correctly', () => {
  beforeEach(() => vi.clearAllMocks());

  it('responds 200 (cacheMiddleware import resolves)', async () => {
    mockPrisma.collection.findMany.mockResolvedValue([]);

    const res = await request(app).get('/collections');

    expect(res.status).toBe(200);
    expect(mockPrisma.collection.findMany).toHaveBeenCalled();
  });
});

// GET /wallets/:address/activity — uses strictRateLimiter
describe('GET /wallets/:address/activity — strictRateLimiter wired correctly', () => {
  beforeEach(() => vi.clearAllMocks());

  it('responds 200 (strictRateLimiter import resolves)', async () => {
    mockPrisma.marketplaceEvent.findMany.mockResolvedValue([]);

    const res = await request(app).get('/wallets/GTEST/activity');

    expect(res.status).toBe(200);
  });
});

// GET /wallets/:address/royalty-stats — uses strictRateLimiter
describe('GET /wallets/:address/royalty-stats — strictRateLimiter wired correctly', () => {
  beforeEach(() => vi.clearAllMocks());

  it('responds 200 (strictRateLimiter import resolves)', async () => {
    mockPrisma.listing.findMany.mockResolvedValue([]);

    const res = await request(app).get('/wallets/GTEST/royalty-stats');

    expect(res.status).toBe(200);
    expect(res.body.payoutCount).toBe(0);
  });
});

// GET /listings/:id — uses axios to fetch IPFS metadata
describe('GET /listings/:id — axios import resolves', () => {
  beforeEach(() => vi.clearAllMocks());

  it('responds 200 with metadata null when no CID is set (axios import resolves)', async () => {
    const listing = {
      listingId: BigInt(1),
      artist: 'GABC',
      owner: null,
      price: '1000',
      currency: 'XLM',
      metadataCid: null,
      token: '',
      status: 'Active',
      royaltyBps: 0,
      createdAtLedger: 1,
      updatedAtLedger: 1,
    };
    // findUnique is not in the mock by default — add it inline
    (mockPrisma.listing as any).findUnique = vi.fn().mockResolvedValue(listing);

    const res = await request(app).get('/listings/1');

    expect(res.status).toBe(200);
    expect(res.body.metadata).toBeNull();
    // Confirms the route ran without a ReferenceError on axios
    expect((mockPrisma.listing as any).findUnique).toHaveBeenCalled();
  });
});
