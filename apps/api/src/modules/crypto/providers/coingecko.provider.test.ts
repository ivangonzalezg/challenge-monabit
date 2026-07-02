import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CoinGeckoProvider } from "./coingecko.provider";

const originalFetch = global.fetch;

beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(() => {
  global.fetch = originalFetch;
});

describe("CoinGeckoProvider", () => {
  describe("getMarketItems", () => {
    it("maps the /coins/markets response into CryptoMarketItem[]", async () => {
      const mockResponse = [
        {
          id: "bitcoin",
          symbol: "btc",
          name: "Bitcoin",
          image: "https://example.com/btc.png",
          current_price: 58534,
          market_cap: 1173904045175,
          market_cap_rank: 1,
          fully_diluted_valuation: 1173904045175,
          total_volume: 34609627689,
          high_24h: 59290,
          low_24h: 57945,
          price_change_24h: -626.2,
          price_change_percentage_1h_in_currency: -0.09,
          price_change_percentage_24h_in_currency: -1.05,
          price_change_percentage_7d_in_currency: 2.3,
          circulating_supply: 20050596,
          total_supply: 20050621,
          max_supply: 21000000,
          ath: 126080,
          ath_change_percentage: -53.57,
          ath_date: "2025-10-06T18:57:42.558Z",
          atl: 67.81,
          atl_change_percentage: 86221.3,
          atl_date: "2013-07-06T00:00:00.000Z",
          last_updated: "2026-07-01T11:53:56.294Z",
          sparkline_in_7d: { price: [58000, 58200, 58534] },
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      }) as unknown as typeof fetch;

      const provider = new CoinGeckoProvider();
      const result = await provider.getMarketItems(250);

      expect(result).toEqual([
        {
          id: "bitcoin",
          symbol: "btc",
          name: "Bitcoin",
          imageUrl: "https://example.com/btc.png",
          marketCapRank: 1,
          currentPriceUsd: 58534,
          marketCapUsd: 1173904045175,
          fullyDilutedValuationUsd: 1173904045175,
          totalVolumeUsd: 34609627689,
          high24hUsd: 59290,
          low24hUsd: 57945,
          priceChange24hUsd: -626.2,
          priceChangePct1h: -0.09,
          priceChangePct24h: -1.05,
          priceChangePct7d: 2.3,
          circulatingSupply: 20050596,
          totalSupply: 20050621,
          maxSupply: 21000000,
          athUsd: 126080,
          athChangePct: -53.57,
          athDate: "2025-10-06T18:57:42.558Z",
          atlUsd: 67.81,
          atlChangePct: 86221.3,
          atlDate: "2013-07-06T00:00:00.000Z",
          sparkline7d: [58000, 58200, 58534],
          providerUpdatedAt: "2026-07-01T11:53:56.294Z",
        },
      ]);
    });

    it("throws when the API responds with a non-2xx status", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({ status: { error_message: "rate limited" } }),
      }) as unknown as typeof fetch;

      const provider = new CoinGeckoProvider();

      await expect(provider.getMarketItems(250)).rejects.toThrow();
    });
  });

  describe("getMarketKpis", () => {
    it("maps the /global response into MarketKpis", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            active_cryptocurrencies: 17410,
            markets: 1488,
            total_market_cap: { usd: 2120712066192.483 },
            total_volume: { usd: 81193576085.39296 },
            market_cap_percentage: { btc: 55.37, eth: 8.93, usdt: 8.69 },
            market_cap_change_percentage_24h_usd: -0.54,
            volume_change_percentage_24h_usd: 1.49,
            updated_at: 1782906807,
          },
        }),
      }) as unknown as typeof fetch;

      const provider = new CoinGeckoProvider();
      const result = await provider.getMarketKpis();

      expect(result).toEqual({
        activeCryptocurrencies: 17410,
        markets: 1488,
        totalMarketCapUsd: 2120712066192.483,
        totalVolumeUsd: 81193576085.39296,
        btcDominancePct: 55.37,
        ethDominancePct: 8.93,
        usdtDominancePct: 8.69,
        marketCapChangePct24h: -0.54,
        volumeChangePct24h: 1.49,
        providerUpdatedAt: new Date(1782906807 * 1000).toISOString(),
        provider: "coingecko",
      });
    });

    it("throws when the API responds with a non-2xx status", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({}),
      }) as unknown as typeof fetch;

      const provider = new CoinGeckoProvider();

      await expect(provider.getMarketKpis()).rejects.toThrow();
    });
  });
});
