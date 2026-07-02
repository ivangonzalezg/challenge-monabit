# Known Limitations and Future Improvements

## Known Limitations

### Crypto Data Freshness

Crypto data freshness depends on CoinGecko update frequency, API availability, plan limits, and the local synchronization interval.

MarketMint synchronizes periodically. With a 5-minute interval, data can still appear delayed if the provider itself has not refreshed its data or if a sync happens shortly before the provider updates.

### Single Crypto Provider

CoinGecko is the only configured provider. The gateway architecture makes additional providers possible, but fallback providers are not configured in the current delivery.

### Provider Quota Sensitivity

The sync strategy should be aligned with the available CoinGecko quota. A 5-minute sync interval performs frequent updates and may require a suitable API plan depending on provider limits.

### Frontend Test Coverage

Backend tests are included, but frontend automated tests are not part of the current delivery.

### Price Alerts

User-defined price alerts are not included in the delivered feature set.

### Global Rate Limiting

Global application-level rate limiting is not configured across the whole API. Better Auth provides protections around authentication-related flows, but broader API rate limiting can be added.

### Structured Logging and Tracing

Basic operational visibility exists through health checks, sync run records, and audit logs. Structured logs, distributed tracing, and more advanced production observability can be improved.

### Single-Service Deployment

The application is deployed as one Cloud Run service for simplicity. This is practical for the challenge, but larger production environments may split frontend delivery, backend API, workers, and scheduled jobs into separate services.

## Future Improvements

### Additional Crypto Providers

Add support for additional providers such as CoinMarketCap, Binance, or CryptoCompare.

### Provider Fallback Strategy

Use the gateway abstraction to support fallback behavior when the active provider is unavailable or stale.

### Improved Sync Monitoring

Add richer monitoring for sync runs, provider errors, quota usage, stale data, and failed refresh attempts.

### Price Alerts

Add per-user price alerts with conditions such as above or below a target price.

### Frontend Tests

Add frontend test coverage for authentication flows, dashboard rendering, crypto search, favorites, and admin user-management screens.

### Global API Rate Limiting

Add application-level rate limiting for public and private API routes beyond authentication-specific protections.

### Structured Logs and Tracing

Add structured request logs, correlation IDs, error tracking, and distributed tracing for Cloud Run.

### Advanced Audit Views

Expose a richer administrator interface for reviewing audit log activity.

### More Chart Filters

Add chart filters for different time ranges, assets, and KPI dimensions.

### Multi-Currency Support

Support additional fiat currencies beyond USD.

### Background Worker Separation

Move crypto synchronization to a dedicated worker or scheduled Cloud Run job if the application grows beyond the current single-service architecture.
