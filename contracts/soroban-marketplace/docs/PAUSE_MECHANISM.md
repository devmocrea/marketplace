# Administrative Pause/Unpause Mechanism

## Overview

This document describes the implementation of an administrative pause/unpause mechanism for the Afristore Marketplace contract. This serves as a circuit breaker during emergencies, allowing the admin to temporarily halt all marketplace operations.

## Features

- **Admin-Only Control**: Only the contract admin can pause/unpause
- **Circuit Breaker**: Prevents all user-facing operations when paused
- **Event Emission**: Emits events on pause/unpause for transparency
- **Comprehensive Coverage**: Blocks all state-changing operations

## Implementation Details

### New Error Type

```rust
ContractPaused = 23,
```

Returned when any operation is attempted while the contract is paused.

### Storage

New `DataKey` variant:
```rust
IsPaused,
```

Storage functions:
- `set_paused(env: &Env, paused: bool)` - Set pause state
- `is_paused(env: &Env) -> bool` - Check pause state

### Admin Functions

#### `admin_pause(env: Env, admin: Address)`
- Requires admin authentication
- Sets contract to paused state
- Emits `CONTRACT_PAUSED` event

#### `admin_unpause(env: Env, admin: Address)`
- Requires admin authentication
- Sets contract to unpaused state
- Emits `CONTRACT_UNPAUSED` event

#### `is_paused(env: Env) -> bool`
- Query function to check current pause state
- No authentication required

### Protected Operations

The following operations check pause state and revert with `ContractPaused` if paused:

**Listings:**
- `create_listing()`
- `update_listing()`
- `buy_artwork()`
- `cancel_listing()`

**Auctions:**
- `create_auction()`
- `place_bid()`
- `finalize_auction()`

**Offers:**
- `make_offer()`
- `withdraw_offer()`
- `reject_offer()`
- `accept_offer()`

### Read-Only Operations (Not Protected)

These operations remain available even when paused:
- `get_listing()`
- `get_auction()`
- `get_offer()`
- `get_active_listings()`
- `get_offers_by_listing()`
- All admin configuration queries

This allows users to view marketplace state during emergencies.

## Events

Two new event symbols:
- `CONTRACT_PAUSED` - Emitted when admin pauses contract
- `CONTRACT_UNPAUSED` - Emitted when admin unpauses contract

## Usage Example

```rust
// Pause the contract during emergency
admin_pause(env, admin_address);

// Check if paused
let paused = is_paused(env);

// Unpause when emergency resolved
admin_unpause(env, admin_address);
```

## Testing

Test cases should cover:
1. Admin can pause contract
2. Admin can unpause contract
3. Non-admin cannot pause/unpause
4. All protected operations revert when paused
5. Read-only operations work when paused
6. Events are emitted correctly

## Security Considerations

1. **Admin Authentication**: All pause functions require admin signature
2. **Atomic Operations**: Pause state is checked at operation start
3. **No Bypass**: All state-changing operations must check pause state
4. **Transparency**: Events allow monitoring of pause/unpause actions
