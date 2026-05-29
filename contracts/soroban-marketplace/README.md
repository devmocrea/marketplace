# soroban-marketplace

Soroban smart contract for the Afristore decentralized art marketplace on Stellar.

## Overview

This contract manages on-chain marketplace listings. All listing data lives
in Soroban persistent storage — no database required.

## Contract Functions

| Function | Auth Required | Description |
|---|---|---|
| `create_listing(artist, metadata_cid, price, currency)` | artist | Creates a listing, returns `listing_id` |
| `buy_artwork(buyer, listing_id)` | buyer | Pays artist in XLM, marks listing Sold |
| `cancel_listing(artist, listing_id)` | artist | Cancels an active listing |
| `get_listing(listing_id)` | none | Returns the full `Listing` struct |
| `get_total_listings()` | none | Returns total listing count |
| `get_artist_listings(artist)` | none | Returns `Vec<u64>` of artist's listing IDs |

## Listing Struct

```rust
pub struct Listing {
    pub listing_id:   u64,
    pub artist:       Address,
    pub metadata_cid: Bytes,      // IPFS CID of artwork metadata JSON
    pub price:        i128,       // in stroops (1 XLM = 10_000_000)
    pub currency:     Symbol,     // "XLM" for MVP
    pub status:       ListingStatus,  // Active | Sold | Cancelled
    pub owner:        Option<Address>,
    pub created_at:   u32,        // ledger sequence
}
```

## Storage Layout

```
Persistent key                       Value
────────────────────────────────────────────────────────────
DataKey::ListingCount                u64            (global counter)
DataKey::Listing(listing_id: u64)    Listing        (full struct)
DataKey::ArtistListings(Address)     Vec<u64>       (index by artist)
```

All entries are extended to a ~30-day TTL on every read and write.

## Error Codes

| Code | Value | Meaning |
|---|---|---|
| `ListingNotFound` | 1 | ID does not exist |
| `Unauthorized` | 2 | Caller is not the listing artist |
| `ListingNotActive` | 3 | Listing is Sold or Cancelled |
| `CannotBuyOwnListing` | 4 | Artist cannot buy their own work |
| `InvalidAmount` | 5 | Amount mismatch |
| `InvalidCid` | 6 | Empty metadata CID |
| `InvalidPrice` | 7 | Price must be > 0 |

## Prerequisites

```bash
# Rust toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32v1-none

# Stellar CLI
cargo install --locked stellar-cli --features opt
```

## Build

```bash
make build
# or directly:
cargo build --target wasm32v1-none --release
```

Output: `target/wasm32v1-none/release/soroban_marketplace.wasm`

## Test

```bash
make test
# or with output:
make test-verbose
```

All tests use `Env::default()` with `mock_all_auths()` — no live network needed.

## Optimise WASM

```bash
make optimize
```

Runs `stellar contract optimize` to strip dead code and reduce WASM size.

## Lint

```bash
make check
```

## Deploy

See [../../scripts/deploy/DEPLOYMENT_GUIDE.md](../../scripts/deploy/DEPLOYMENT_GUIDE.md).

```bash
cd ../../scripts/deploy
./fund_account.sh
./deploy_contract.sh
```

## Manual Invocation (Testnet)

```bash
source ../../scripts/deploy/.env.deploy

# Create a listing
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $STELLAR_SECRET \
  --rpc-url $RPC_URL \
  --network-passphrase "Test SDF Network ; September 2015" \
  -- create_listing \
  --artist $STELLAR_PUBLIC \
  --metadata_cid "QmYourIPFSCIDHere" \
  --price 10000000 \
  --currency XLM

# Query total listings
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $STELLAR_SECRET \
  --rpc-url $RPC_URL \
  --network-passphrase "Test SDF Network ; September 2015" \
  -- get_total_listings
```
