import cron from "node-cron";
import { runSync } from "./crypto-sync.service";

export function startCryptoSyncScheduler(): void {
  const minutes = Number(process.env.CRYPTO_SYNC_INTERVAL_MINUTES ?? "5") || 5;
  const expression = `*/${minutes} * * * *`;

  cron.schedule(expression, () => {
    console.log(`[crypto-sync] ${new Date().toISOString()} scheduled run triggered`);
    return runSync("scheduled")
      .then((result) => {
        console.log(
          `[crypto-sync] ${new Date().toISOString()} scheduled run succeeded: status=${result.status} assetsUpdated=${result.assetsUpdated}`,
        );
      })
      .catch((error) => {
        console.error(`[crypto-sync] ${new Date().toISOString()} scheduled run failed:`, error);
      });
  });

  console.log(`[crypto-sync] scheduler started (every ${minutes} minute(s))`);
}
