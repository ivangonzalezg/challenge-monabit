import type { CryptoProvider } from "./providers/crypto-provider.interface";
import { CoinGeckoProvider } from "./providers/coingecko.provider";

// Selects the active crypto data provider based on CRYPTO_PROVIDER env var.
// Add new provider cases here as the gateway expands.
export function createCryptoGateway(): CryptoProvider {
  const provider = process.env.CRYPTO_PROVIDER ?? "coingecko";

  switch (provider) {
    case "coingecko":
      return new CoinGeckoProvider();
    default:
      throw new Error(`Unknown CRYPTO_PROVIDER: "${provider}"`);
  }
}
