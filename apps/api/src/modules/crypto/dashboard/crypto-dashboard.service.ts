import { desc, sql } from "drizzle-orm";
import { db } from "../../../db/client";
import { cryptoAssets, cryptoMarketKpis } from "../../../db/schema";

function toNumberOrNull(
  value: string | number | null | undefined,
): number | null {
  if (value === null || value === undefined) return null;
  return typeof value === "number" ? value : Number(value);
}

export type CurrentKpis = {
  provider: string;
  activeCryptocurrencies: number | null;
  totalMarketCapUsd: number | null;
  totalVolumeUsd: number | null;
  btcDominancePct: number | null;
  ethDominancePct: number | null;
  usdtDominancePct: number | null;
  marketCapChangePct24h: number | null;
  volumeChangePct24h: number | null;
  providerUpdatedAt: Date | null;
};

export async function getCurrentKpis(): Promise<CurrentKpis | null> {
  const [row] = await db
    .select()
    .from(cryptoMarketKpis)
    .orderBy(desc(cryptoMarketKpis.createdAt))
    .limit(1);

  if (!row) return null;

  return {
    provider: row.provider,
    activeCryptocurrencies: row.activeCryptocurrencies,
    totalMarketCapUsd: toNumberOrNull(row.totalMarketCapUsd),
    totalVolumeUsd: toNumberOrNull(row.totalVolumeUsd),
    btcDominancePct: toNumberOrNull(row.btcDominancePct),
    ethDominancePct: toNumberOrNull(row.ethDominancePct),
    usdtDominancePct: toNumberOrNull(row.usdtDominancePct),
    marketCapChangePct24h: toNumberOrNull(row.marketCapChangePct24h),
    volumeChangePct24h: toNumberOrNull(row.volumeChangePct24h),
    providerUpdatedAt: row.providerUpdatedAt,
  };
}

export type TopAsset = {
  providerAssetId: string;
  symbol: string;
  name: string;
  marketCapRank: number | null;
  currentPriceUsd: number;
  priceChangePct24h: number | null;
  marketCapUsd: number | null;
  totalVolumeUsd: number | null;
  sparkline7d: number[] | null;
};

export async function getTopAssets(): Promise<TopAsset[]> {
  const rows = await db
    .select({
      providerAssetId: cryptoAssets.providerAssetId,
      symbol: cryptoAssets.symbol,
      name: cryptoAssets.name,
      marketCapRank: cryptoAssets.marketCapRank,
      currentPriceUsd: cryptoAssets.currentPriceUsd,
      priceChangePct24h: cryptoAssets.priceChangePct24h,
      marketCapUsd: cryptoAssets.marketCapUsd,
      totalVolumeUsd: cryptoAssets.totalVolumeUsd,
      sparkline7d: cryptoAssets.sparkline7d,
    })
    .from(cryptoAssets)
    .where(sql`${cryptoAssets.isActive} = true`)
    .orderBy(sql`${cryptoAssets.marketCapRank} ASC NULLS LAST`)
    .limit(10);

  return rows.map((row) => ({
    providerAssetId: row.providerAssetId,
    symbol: row.symbol,
    name: row.name,
    marketCapRank: row.marketCapRank,
    currentPriceUsd: Number(row.currentPriceUsd),
    priceChangePct24h: toNumberOrNull(row.priceChangePct24h),
    marketCapUsd: toNumberOrNull(row.marketCapUsd),
    totalVolumeUsd: toNumberOrNull(row.totalVolumeUsd),
    sparkline7d: row.sparkline7d as number[] | null,
  }));
}

export type MarketTrendPoint = {
  date: string;
  totalMarketCapUsd: number;
  totalVolumeUsd: number;
  btcDominancePct: number;
  ethDominancePct: number;
  usdtDominancePct: number;
};

type MarketTrendRow = {
  day: string;
  total_market_cap_usd: string;
  total_volume_usd: string;
  btc_dominance_pct: string;
  eth_dominance_pct: string;
  usdt_dominance_pct: string;
};

export async function getMarketTrend(): Promise<MarketTrendPoint[]> {
  const result = await db.execute<MarketTrendRow>(sql`
    SELECT
      date_trunc('day', created_at) AS day,
      AVG(total_market_cap_usd) AS total_market_cap_usd,
      AVG(total_volume_usd) AS total_volume_usd,
      AVG(btc_dominance_pct) AS btc_dominance_pct,
      AVG(eth_dominance_pct) AS eth_dominance_pct,
      AVG(usdt_dominance_pct) AS usdt_dominance_pct
    FROM crypto_market_kpis
    WHERE created_at >= now() - interval '1 month'
    GROUP BY day
    ORDER BY day ASC
  `);

  return result.rows.map((row) => ({
    date: row.day.slice(0, 10),
    totalMarketCapUsd: Number(row.total_market_cap_usd),
    totalVolumeUsd: Number(row.total_volume_usd),
    btcDominancePct: Number(row.btc_dominance_pct),
    ethDominancePct: Number(row.eth_dominance_pct),
    usdtDominancePct: Number(row.usdt_dominance_pct),
  }));
}

export class NoDashboardDataError extends Error {
  constructor() {
    super("No crypto data available yet");
    this.name = "NoDashboardDataError";
  }
}

export type DashboardResponse = {
  source: string;
  lastUpdatedAt: string | null;
  kpis: {
    totalMarketCapUsd: { value: number | null; changePct24h: number | null };
    totalVolumeUsd: { value: number | null; changePct24h: number | null };
    btcDominancePct: { value: number | null };
    ethDominancePct: { value: number | null };
    usdtDominancePct: { value: number | null };
    activeCryptocurrencies: { value: number | null };
  };
  topAssets: TopAsset[];
  marketTrend: MarketTrendPoint[];
};

export async function getDashboard(): Promise<DashboardResponse> {
  const current = await getCurrentKpis();

  if (!current) {
    throw new NoDashboardDataError();
  }

  const topAssets = await getTopAssets();
  const marketTrend = await getMarketTrend();

  return {
    source: current.provider,
    lastUpdatedAt: current.providerUpdatedAt
      ? current.providerUpdatedAt.toISOString()
      : null,
    kpis: {
      totalMarketCapUsd: {
        value: current.totalMarketCapUsd,
        changePct24h: current.marketCapChangePct24h,
      },
      totalVolumeUsd: {
        value: current.totalVolumeUsd,
        changePct24h: current.volumeChangePct24h,
      },
      btcDominancePct: { value: current.btcDominancePct },
      ethDominancePct: { value: current.ethDominancePct },
      usdtDominancePct: { value: current.usdtDominancePct },
      activeCryptocurrencies: { value: current.activeCryptocurrencies },
    },
    topAssets,
    marketTrend,
  };
}
