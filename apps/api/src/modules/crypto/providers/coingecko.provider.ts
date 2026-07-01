import type { CryptoMarketItem, MarketKpis } from "@monabit/shared";
import type { CryptoProvider } from "./crypto-provider.interface";

type CoinGeckoMarketItem = {
  id: string;
  symbol: string;
  name: string;
  image?: string | null;
  market_cap_rank?: number | null;
  current_price: number;
  market_cap?: number | null;
  fully_diluted_valuation?: number | null;
  total_volume?: number | null;
  high_24h?: number | null;
  low_24h?: number | null;
  price_change_24h?: number | null;
  price_change_percentage_1h_in_currency?: number | null;
  price_change_percentage_24h_in_currency?: number | null;
  price_change_percentage_7d_in_currency?: number | null;
  circulating_supply?: number | null;
  total_supply?: number | null;
  max_supply?: number | null;
  ath?: number | null;
  ath_change_percentage?: number | null;
  ath_date?: string | null;
  atl?: number | null;
  atl_change_percentage?: number | null;
  atl_date?: string | null;
  last_updated?: string | null;
  sparkline_in_7d?: { price: number[] } | null;
};

type CoinGeckoGlobalResponse = {
  data: {
    active_cryptocurrencies?: number | null;
    markets?: number | null;
    total_market_cap?: { usd?: number | null } | null;
    total_volume?: { usd?: number | null } | null;
    market_cap_percentage?: {
      btc?: number | null;
      eth?: number | null;
      usdt?: number | null;
    } | null;
    market_cap_change_percentage_24h_usd?: number | null;
    updated_at?: number | null;
  };
};

export class CoinGeckoProvider implements CryptoProvider {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.baseUrl =
      process.env.COINGECKO_API_BASE_URL ?? "https://api.coingecko.com/api/v3";
    this.apiKey = process.env.COINGECKO_API_KEY ?? "";
  }

  private apiKeyHeader(): Record<string, string> {
    if (!this.apiKey) return {};
    return this.baseUrl.includes("pro-api")
      ? { "x-cg-pro-api-key": this.apiKey }
      : { "x-cg-demo-api-key": this.apiKey };
  }

  private async request<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: this.apiKeyHeader(),
    });

    if (!res.ok) {
      throw new Error(`CoinGecko request failed: ${res.status} ${path}`);
    }

    return (await res.json()) as T;
  }

  async getMarketItems(limit = 250): Promise<CryptoMarketItem[]> {
    const perPage = Math.min(limit, 250);
    const path =
      `/coins/markets?vs_currency=usd&order=market_cap_desc` +
      `&per_page=${perPage}&page=1&sparkline=true&price_change_percentage=1h,24h,7d`;

    const items = await this.request<CoinGeckoMarketItem[]>(path);

    return items.map((item) => ({
      id: item.id,
      symbol: item.symbol,
      name: item.name,
      imageUrl: item.image,
      marketCapRank: item.market_cap_rank,
      currentPriceUsd: item.current_price,
      marketCapUsd: item.market_cap,
      fullyDilutedValuationUsd: item.fully_diluted_valuation,
      totalVolumeUsd: item.total_volume,
      high24hUsd: item.high_24h,
      low24hUsd: item.low_24h,
      priceChange24hUsd: item.price_change_24h,
      priceChangePct1h: item.price_change_percentage_1h_in_currency,
      priceChangePct24h: item.price_change_percentage_24h_in_currency,
      priceChangePct7d: item.price_change_percentage_7d_in_currency,
      circulatingSupply: item.circulating_supply,
      totalSupply: item.total_supply,
      maxSupply: item.max_supply,
      athUsd: item.ath,
      athChangePct: item.ath_change_percentage,
      athDate: item.ath_date,
      atlUsd: item.atl,
      atlChangePct: item.atl_change_percentage,
      atlDate: item.atl_date,
      sparkline7d: item.sparkline_in_7d?.price,
      providerUpdatedAt: item.last_updated,
    }));
  }

  async getMarketKpis(): Promise<MarketKpis> {
    const response = await this.request<CoinGeckoGlobalResponse>("/global");
    const data = response.data;

    return {
      activeCryptocurrencies: data.active_cryptocurrencies,
      markets: data.markets,
      totalMarketCapUsd: data.total_market_cap?.usd,
      totalVolumeUsd: data.total_volume?.usd,
      btcDominancePct: data.market_cap_percentage?.btc,
      ethDominancePct: data.market_cap_percentage?.eth,
      usdtDominancePct: data.market_cap_percentage?.usdt,
      marketCapChangePct24h: data.market_cap_change_percentage_24h_usd,
      providerUpdatedAt: data.updated_at
        ? new Date(data.updated_at * 1000).toISOString()
        : undefined,
      provider: "coingecko",
    };
  }
}
