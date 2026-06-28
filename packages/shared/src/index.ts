export type CryptoProviderName = "coingecko";

export type CryptoMarketItem = {
  id: string;
  symbol: string;
  name: string;
  imageUrl?: string;
  currentPrice: number;
  marketCap: number;
  totalVolume: number;
  priceChangePercentage24h: number;
};

export type MarketKpis = {
  totalMarketCap: number;
  totalVolume24h: number;
  btcDominance?: number;
  lastUpdatedAt: string;
  provider: CryptoProviderName;
};

export type UserProfile = {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
