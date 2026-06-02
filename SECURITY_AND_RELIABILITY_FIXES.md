Security & Reliability Fixes

This patchset implements four production fixes addressing graceful shutdown, error mapping, royalty validation, and runtime whitelist enforcement.

1) Poller graceful shutdown (indexer/src/poller.ts)
- Strategy: install SIGTERM/SIGINT handlers and set a module-level `shuttingDown` flag. The main polling loop now checks `!shuttingDown` rather than looping forever.
- Cleanup: on shutdown, Prisma client and Redis client are awaited via Promise.allSettled. A 10s timeout fallback forces process.exit(1) to avoid hanging shutdowns.
- Rationale: prevents forced kills during in-flight DB mutations, reduces risk of inconsistent state during reorgs.

2) create_listing error mapping (contracts/soroban-marketplace)
- Problem: zero-length recipients previously mapped to `TooManyRecipients` (misleading).
- Fix: empty recipient arrays now explicitly panic with `MarketplaceError::InvalidSplit` to reflect the semantic problem.
- Tests updated to assert deterministic behavior.

3) Royalty bps upper bound (contracts/soroban-marketplace)
- Problem: `royalty = amount * royalty_bps / 10000` could produce invalid behavior if `royalty_bps > 10000`.
- Fix: enforce `royalty_bps <= 10000` in both `create_listing` and `create_auction`. Excess values cause `MarketplaceError::InvalidRoyalty`.
- Tests: added unit tests for `royalty_bps == 10000` (allowed) and `royalty_bps > 10000` (rejected).
- Security implication: caps prevent royalty draining and arithmetic overflows/underflows in payout logic.

4) Runtime whitelist enforcement (contracts/soroban-marketplace)
- Problem: token whitelist was only enforced at listing/auction creation; delisting a token did not prevent purchases of previously created listings.
- Fix: `buy_artwork` now checks `is_token_whitelisted` at purchase time and aborts with `TokenNotWhitelisted` if the token was removed.
- Integration test: whitelisting -> create listing -> admin removes token -> buy_artwork must fail.

Testing
- Added unit tests in contracts/soroban-marketplace/src/test.rs for royalty bounds and whitelist delist behavior.
- Indexer poller tests remain compatible; the new shutdown handlers are safe for the test environment (cleanup is resilient to missing Redis connection).

Notes
- Error enum extended with `InvalidRoyalty` and `TokenNotWhitelisted` (appended values to preserve existing numeric codes).
- Panic messages use `panic_with_error!` so ABI error codes remain deterministic and machine-readable.
- Shutdown timeout chosen as 10s to balance giving external resources time to close while avoiding stuck systemd/K8s termination windows (typical SIGTERM grace period: 30s).

If any additional integration testing is desired (e.g., running cargo test / npm test in CI), please run the existing test suites. The changes were kept minimal and localized to reduce risk of regressions.
