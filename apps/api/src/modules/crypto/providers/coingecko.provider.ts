import type { CryptoMarketItem, MarketKpis } from "@monabit/shared";
import type { CryptoProvider } from "./crypto-provider.interface";

// TODO: Implement CoinGecko API calls using COINGECKO_API_BASE_URL and COINGECKO_API_KEY
export class CoinGeckoProvider implements CryptoProvider {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.baseUrl =
      process.env.COINGECKO_API_BASE_URL ?? "https://api.coingecko.com/api/v3";
    this.apiKey = process.env.COINGECKO_API_KEY ?? "";
  }

  async getMarketItems(_limit = 100): Promise<CryptoMarketItem[]> {
    throw new Error("CoinGeckoProvider.getMarketItems not implemented yet");
  }

  async getMarketKpis(): Promise<MarketKpis> {
    throw new Error("CoinGeckoProvider.getMarketKpis not implemented yet");
  }
}
