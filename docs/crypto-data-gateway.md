# Crypto Data Gateway

## Overview

MarketMint integrates with crypto market data through a backend-owned **Crypto Data Gateway**. The gateway isolates provider-specific details from the rest of the application so the frontend and business logic do not depend directly on CoinGecko or any other external provider.

The frontend never imports provider SDKs and never calls provider APIs directly. It consumes normalized data through MarketMint API endpoints.

## Motivation

Crypto provider APIs change over time, rate limits vary by plan, and response shapes are vendor-specific. Coupling the dashboard directly to a provider would make the application harder to maintain and harder to extend.

The gateway design provides:

- A stable internal contract for crypto market data.
- A single backend integration point for provider calls.
- Normalized domain objects for the rest of the backend.
- A clear replacement path for future providers.
- Isolation of provider API keys and secrets from the browser.

## Design

```txt
apps/api
└─ src/modules/crypto/
   ├─ crypto.gateway.ts                 Factory that selects the active provider
   ├─ crypto.types.ts                   Shared or re-exported crypto domain types
   └─ providers/
      ├─ crypto-provider.interface.ts   Provider contract
      └─ coingecko.provider.ts          CoinGecko implementation
```

## Provider Interface

Every provider implementation follows a common contract:

```ts
interface CryptoProvider {
  getMarketItems(limit?: number): Promise<CryptoMarketItem[]>;
  getMarketKpis(): Promise<MarketKpis>;
}
```

This keeps provider-specific parsing inside the provider implementation and keeps the rest of the backend working with stable application-level types.

## Gateway Factory

`createCryptoGateway()` reads the `CRYPTO_PROVIDER` environment variable and returns the configured provider implementation.

Adding another provider requires:

1. Creating a new provider implementation under `providers/`.
2. Implementing the `CryptoProvider` interface.
3. Adding the provider case to the gateway factory.
4. Documenting provider-specific environment variables.

## Active Provider: CoinGecko

CoinGecko is the active provider for the challenge.

| Variable | Description |
|---|---|
| `CRYPTO_PROVIDER` | Set to `coingecko` to activate the CoinGecko provider. |
| `COINGECKO_API_BASE_URL` | Base URL. Defaults to `https://api.coingecko.com/api/v3`. |
| `COINGECKO_API_KEY` | Demo or Pro API key. Can be empty for unauthenticated requests when allowed by the provider. |

## Why CoinGecko

CoinGecko was selected because it provides broad market coverage, market endpoints suitable for a top-assets dashboard, global KPI data, and a free/demo tier appropriate for the scope of the technical challenge.

The provider also exposes the data needed by MarketMint's dashboard:

- Current prices.
- Market capitalization.
- 24h trading volume.
- 24h price variation.
- Market cap rank.
- 7-day sparkline data.
- Global market metrics such as total market capitalization and dominance values.

## Data Used by MarketMint

The CoinGecko provider reads from two main data sources:

| Provider endpoint | Purpose |
|---|---|
| `/coins/markets` | Asset-level market data such as price, volume, market cap, 24h change, rank, and sparkline data. |
| `/global` | Global market KPIs such as total market cap, total volume, active cryptocurrencies, and dominance percentages. |

The provider responses are normalized before they are written to the database or returned to application services.

## Synchronization Strategy

MarketMint synchronizes crypto data from CoinGecko into the local database on a schedule. The default interval is **5 minutes**, controlled by `CRYPTO_SYNC_INTERVAL_MINUTES`.

A complete sync:

1. Fetches market items from CoinGecko.
2. Fetches global market KPIs.
3. Normalizes provider responses.
4. Upserts current asset data into `crypto_assets`.
5. Inserts historical rows into `crypto_asset_snapshots`.
6. Inserts KPI history into `crypto_market_kpis`.
7. Records the sync attempt in `crypto_sync_runs`.

This strategy lets the dashboard read from local database tables instead of calling the provider for every user request.

## Provider Independence

Although CoinGecko is the active provider, the business logic uses internal types and gateway methods rather than CoinGecko response shapes.

This makes it possible to add providers such as:

- CoinMarketCap.
- Binance.
- CryptoCompare.

A future implementation could also support fallback providers if CoinGecko is unavailable or if fresher data is required.

## Frontend Contract

The frontend consumes MarketMint API responses only. It does not know which crypto provider is active and does not need provider API keys.

This protects secrets and keeps the UI independent from provider-specific behavior.
