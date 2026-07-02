import { desc, sql } from "drizzle-orm";
import { db } from "../../../db/client";
import { cryptoAssets, cryptoSyncRuns } from "../../../db/schema";
import type { SyncRunRow } from "./crypto-sync.service";

export interface SyncStats {
  totalRegisters: number;
  activeCount: number;
  lastRun: SyncRunRow | null;
  recentRuns: SyncRunRow[];
}

const RECENT_RUNS_LIMIT = 10;

export async function getSyncStats(): Promise<SyncStats> {
  const [totalResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(cryptoAssets);

  const [activeResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(cryptoAssets)
    .where(sql`${cryptoAssets.isActive} = true`);

  const recentRuns = (await db
    .select()
    .from(cryptoSyncRuns)
    .orderBy(desc(cryptoSyncRuns.startedAt))
    .limit(RECENT_RUNS_LIMIT)) as SyncRunRow[];

  return {
    totalRegisters: totalResult.count,
    activeCount: activeResult.count,
    lastRun: recentRuns[0] ?? null,
    recentRuns,
  };
}
