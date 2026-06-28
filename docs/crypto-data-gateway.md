# Crypto Data Gateway

## Motivation

The frontend must never be tightly coupled to a single crypto data provider. Provider APIs change, rate limits vary, and the project may need to switch providers or fan out across multiple sources. The backend exposes a **crypto data gateway** that abstracts provider details behind a stable internal interface.

## Design

```
apps/api
└─ src/modules/crypto/
   ├─ crypto.gateway.ts              Factory — selects the active provider
   ├─ crypto.types.ts                Re-exports shared domain types
   └─ providers/
      ├─ crypto-provider.interface.ts   Contract every provider must satisfy
      └─ coingecko.provider.ts          CoinGecko implementation (stub)
```

### `CryptoProvider` interface

```ts
interface CryptoProvider {
  getMarketItems(limit?: number): Promise<CryptoMarketItem[]>;
  getMarketKpis(): Promise<MarketKpis>;
}
```

### `CryptoGateway`

`createCryptoGateway()` reads the `CRYPTO_PROVIDER` environment variable and returns the matching provider instance. Adding a new provider requires only:

1. Implementing `CryptoProvider` in a new file under `providers/`.
2. Adding a `case` in `createCryptoGateway()`.
3. Documenting the new provider's env vars here.

## Active provider: CoinGecko

| Variable | Description |
|---|---|
| `CRYPTO_PROVIDER` | Set to `coingecko` to activate CoinGecko. |
| `COINGECKO_API_BASE_URL` | Base URL (default: `https://api.coingecko.com/api/v3`). |
| `COINGECKO_API_KEY` | Demo or Pro API key. Leave empty for unauthenticated requests. |

## Future providers (not configured)

- CoinMarketCap
- Binance
- CryptoCompare

## Frontend contract

The frontend consumes only the API endpoints exposed by `apps/api`. It never imports provider SDKs or calls provider APIs directly.
