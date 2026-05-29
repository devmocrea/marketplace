# Pause Mechanism Implementation Guide

This guide provides the exact changes needed to implement the pause/unpause mechanism for issue #126.

## Files to Modify

### 1. `contracts/soroban-marketplace/src/types.rs`

Add to `MarketplaceError` enum:
```rust
ContractPaused = 23,
```

### 2. `contracts/soroban-marketplace/src/storage.rs`

Add to `DataKey` enum:
```rust
IsPaused,
```

Add at end of file:
```rust
// ── Pause/Unpause Mechanism ──────────────────────────────────

pub fn set_paused(env: &Env, paused: bool) {
    env.storage()
        .persistent()
        .set(&DataKey::IsPaused, &paused);
    env.storage()
        .persistent()
        .extend_ttl(&DataKey::IsPaused, LEDGER_TTL_THRESHOLD, LEDGER_TTL_BUMP);
}

pub fn is_paused(env: &Env) -> bool {
    env.storage()
        .persistent()
        .get::<DataKey, bool>(&DataKey::IsPaused)
        .unwrap_or(false)
}
```

### 3. `contracts/soroban-marketplace/src/events.rs`

Add event symbols:
```rust
pub const CONTRACT_PAUSED: Symbol = symbol_short!("ctr_psd");
pub const CONTRACT_UNPAUSED: Symbol = symbol_short!("ctr_unpsd");
```

### 4. `contracts/soroban-marketplace/src/contract.rs`

After `get_protocol_fee()` function, add:
```rust
// ── Pause/Unpause Mechanism ────────────────────────────────

pub fn admin_pause(env: Env, admin: Address) {
    admin.require_auth();
    let stored_admin = Self::get_admin(env.clone()).expect("admin not set");
    if admin != stored_admin {
        panic_with_error!(&env, MarketplaceError::Unauthorized);
    }
    crate::storage::set_paused(&env, true);
    #[allow(deprecated)]
    env.events()
        .publish((crate::events::CONTRACT_PAUSED,), ());
}

pub fn admin_unpause(env: Env, admin: Address) {
    admin.require_auth();
    let stored_admin = Self::get_admin(env.clone()).expect("admin not set");
    if admin != stored_admin {
        panic_with_error!(&env, MarketplaceError::Unauthorized);
    }
    crate::storage::set_paused(&env, false);
    #[allow(deprecated)]
    env.events()
        .publish((crate::events::CONTRACT_UNPAUSED,), ());
}

pub fn is_paused(env: Env) -> bool {
    crate::storage::is_paused(&env)
}
```

Add pause check at start of these functions (after `require_auth()`):
- `create_listing()` - Add: `if crate::storage::is_paused(&env) { panic_with_error!(&env, MarketplaceError::ContractPaused); }`
- `update_listing()` - Same check
- `buy_artwork()` - Same check
- `cancel_listing()` - Same check
- `create_auction()` - Same check
- `place_bid()` - Same check
- `make_offer()` - Same check
- `withdraw_offer()` - Same check
- `reject_offer()` - Same check
- `accept_offer()` - Same check

Note: `finalize_auction()` doesn't have `require_auth()` at start, so add check after the reentrancy guard.

## Implementation Order

1. Update `types.rs` - Add error type
2. Update `storage.rs` - Add storage key and functions
3. Update `events.rs` - Add event symbols
4. Update `contract.rs` - Add admin functions and pause checks

## Testing Checklist

- [ ] Admin can pause contract
- [ ] Admin can unpause contract
- [ ] Non-admin cannot pause
- [ ] Non-admin cannot unpause
- [ ] `create_listing()` reverts when paused
- [ ] `update_listing()` reverts when paused
- [ ] `buy_artwork()` reverts when paused
- [ ] `cancel_listing()` reverts when paused
- [ ] `create_auction()` reverts when paused
- [ ] `place_bid()` reverts when paused
- [ ] `make_offer()` reverts when paused
- [ ] `withdraw_offer()` reverts when paused
- [ ] `reject_offer()` reverts when paused
- [ ] `accept_offer()` reverts when paused
- [ ] Read operations work when paused
- [ ] Events emitted on pause/unpause

## Verification

After implementation, verify:
1. Contract compiles: `cargo build --target wasm32-unknown-unknown`
2. Tests pass: `cargo test`
3. No clippy warnings: `cargo clippy`
