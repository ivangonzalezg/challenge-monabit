export type CryptoProviderName = "coingecko";

export type CryptoMarketItem = {
  id: string;
  symbol: string;
  name: string;
  imageUrl?: string | null;
  marketCapRank?: number | null;
  currentPriceUsd: number;
  marketCapUsd?: number | null;
  fullyDilutedValuationUsd?: number | null;
  totalVolumeUsd?: number | null;
  high24hUsd?: number | null;
  low24hUsd?: number | null;
  priceChange24hUsd?: number | null;
  priceChangePct1h?: number | null;
  priceChangePct24h?: number | null;
  priceChangePct7d?: number | null;
  circulatingSupply?: number | null;
  totalSupply?: number | null;
  maxSupply?: number | null;
  athUsd?: number | null;
  athChangePct?: number | null;
  athDate?: string | null;
  atlUsd?: number | null;
  atlChangePct?: number | null;
  atlDate?: string | null;
  sparkline7d?: number[] | null;
  providerUpdatedAt?: string | null;
};

export type MarketKpis = {
  activeCryptocurrencies?: number | null;
  markets?: number | null;
  totalMarketCapUsd?: number | null;
  totalVolumeUsd?: number | null;
  btcDominancePct?: number | null;
  ethDominancePct?: number | null;
  usdtDominancePct?: number | null;
  marketCapChangePct24h?: number | null;
  providerUpdatedAt?: string | null;
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
