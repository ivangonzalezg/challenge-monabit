import type { CryptoMarketItem, MarketKpis } from "@monabit/shared";

export interface CryptoProvider {
  getMarketItems(limit?: number): Promise<CryptoMarketItem[]>;
  getMarketKpis(): Promise<MarketKpis>;
}
