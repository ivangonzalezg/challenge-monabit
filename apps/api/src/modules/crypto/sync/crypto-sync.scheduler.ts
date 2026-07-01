import cron from "node-cron";
import { runSync } from "./crypto-sync.service";

export function startCryptoSyncScheduler(): void {
  const minutes = Number(process.env.CRYPTO_SYNC_INTERVAL_MINUTES ?? "5") || 5;
  const expression = `*/${minutes} * * * *`;

  cron.schedule(expression, () => {
    return runSync("scheduled").catch((error) => {
      console.error("[crypto-sync] scheduled run failed:", error);
    });
  });

  console.log(`[crypto-sync] scheduler started (every ${minutes} minute(s))`);
}
