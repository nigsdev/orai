/**
 * Server-side Blockscout Service
 *
 * This module provides server-side wallet analytics using Blockscout APIs
 * without React dependencies for use in API routes.
 */

// Supported chain configurations
export const SUPPORTED_CHAINS = {
  1: {
    name: "Ethereum Mainnet",
    symbol: "ETH",
    explorer: "https://eth.blockscout.com",
  },
  10: {
    name: "Optimism",
    symbol: "ETH",
    explorer: "https://optimism.blockscout.com",
  },
  137: {
    name: "Polygon",
    symbol: "MATIC",
    explorer: "https://polygon.blockscout.com",
  },
  42161: {
    name: "Arbitrum One",
    symbol: "ETH",
    explorer: "https://arbitrum.blockscout.com",
  },
  11155420: {
    name: "OP Sepolia",
    symbol: "ETH",
    explorer: "https://sepolia-optimism.blockscout.com",
  },
  421614: {
    name: "Arbitrum Sepolia",
    symbol: "ETH",
    explorer: "https://sepolia-arbitrum.blockscout.com",
  },
  8453: {
    name: "Base",
    symbol: "ETH",
    explorer: "https://base.blockscout.com",
  },
} as const;

export type SupportedChainId = keyof typeof SUPPORTED_CHAINS;

// Types for wallet analytics
export interface WalletAnalytics {
  address: string;
  chainId: SupportedChainId;
  totalTransactions: number;
  totalVolume: string;
  firstTransactionDate?: string;
  lastTransactionDate?: string;
  transactionTypes: {
    sent: number;
    received: number;
    contractInteractions: number;
  };
  topTokens: Array<{
    symbol: string;
    address: string;
    volume: string;
    transactions: number;
  }>;
  gasSpent: string;
  averageGasPrice: string;
}

export interface TransactionData {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  timestamp: string;
  status: "success" | "failed" | "pending";
  method?: string;
  tokenTransfers?: Array<{
    token: string;
    amount: string;
    symbol: string;
  }>;
}

export interface ServerBlockscoutResponse {
  success: boolean;
  data?: WalletAnalytics | TransactionData[];
  error?: string;
  message: string;
  suggestions?: string[];
}

/**
 * Server-side Blockscout Service Implementation
 */
class ServerBlockscoutService {
  /**
   * Get comprehensive wallet analytics
   */
  async getWalletAnalytics(
    address: string,
    chainId: SupportedChainId
  ): Promise<ServerBlockscoutResponse> {
    try {
      // Validate address
      if (!this.isValidAddress(address)) {
        return {
          success: false,
          error: "Invalid wallet address format",
          message: "Please provide a valid Ethereum address (0x...)",
          suggestions: [
            "Make sure the address starts with 0x",
            "Check that the address is 42 characters long",
            "Verify the address is from the correct network",
          ],
        };
      }

      // Validate chain ID
      const supportedChains = SUPPORTED_CHAINS;
      if (!supportedChains[chainId]) {
        return {
          success: false,
          error: "Unsupported chain ID",
          message: `Chain ID ${chainId} is not supported. Supported chains: ${Object.keys(
            supportedChains
          ).join(", ")}`,
          suggestions: [
            "Use chain ID 1 for Ethereum Mainnet",
            "Use chain ID 137 for Polygon",
            "Use chain ID 42161 for Arbitrum",
            "Use chain ID 10 for Optimism",
          ],
        };
      }

      const chain = supportedChains[chainId];

      // Fetch transaction history
      const transactions = await this.fetchTransactionsFromAPI(
        chain.explorer,
        address
      );

      // Calculate analytics
      const analytics: WalletAnalytics = {
        address: this.formatAddress(address),
        chainId,
        totalTransactions: transactions.length,
        totalVolume: "0",
        transactionTypes: {
          sent: 0,
          received: 0,
          contractInteractions: 0,
        },
        topTokens: [],
        gasSpent: "0",
        averageGasPrice: "0",
      };

      // Process transactions
      let totalVolume = BigInt(0);
      let totalGasSpent = BigInt(0);
      let totalGasPrice = BigInt(0);
      const tokenMap = new Map<
        string,
        { volume: bigint; transactions: number }
      >();

      transactions.forEach((tx) => {
        // Calculate volume - handle decimal values properly
        const valueStr = tx.value || "0";
        const value = BigInt(Math.floor(parseFloat(valueStr)));
        totalVolume += value;

        // Calculate gas - handle decimal values properly
        const gasUsedStr = tx.gasUsed || "0";
        const gasPriceStr = tx.gasPrice || "0";
        const gasUsed = BigInt(Math.floor(parseFloat(gasUsedStr)));
        const gasPrice = BigInt(Math.floor(parseFloat(gasPriceStr)));
        totalGasSpent += gasUsed * gasPrice;
        totalGasPrice += gasPrice;

        // Transaction types
        if (tx.from.toLowerCase() === address.toLowerCase()) {
          analytics.transactionTypes.sent++;
        } else if (tx.to.toLowerCase() === address.toLowerCase()) {
          analytics.transactionTypes.received++;
        } else {
          analytics.transactionTypes.contractInteractions++;
        }

        // Token transfers
        if (tx.tokenTransfers) {
          tx.tokenTransfers.forEach((transfer) => {
            const key = transfer.token;
            const existing = tokenMap.get(key) || {
              volume: BigInt(0),
              transactions: 0,
            };
            const amountStr = transfer.amount || "0";
            const amount = BigInt(Math.floor(parseFloat(amountStr)));
            existing.volume += amount;
            existing.transactions++;
            tokenMap.set(key, existing);
          });
        }
      });

      // Set calculated values
      analytics.totalVolume = this.formatWei(totalVolume);
      analytics.gasSpent = this.formatWei(totalGasSpent);
      analytics.averageGasPrice =
        transactions.length > 0
          ? this.formatWei(totalGasPrice / BigInt(transactions.length))
          : "0";

      // Set dates
      if (transactions.length > 0) {
        const sortedTxs = transactions.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        analytics.firstTransactionDate = sortedTxs[0].timestamp;
        analytics.lastTransactionDate =
          sortedTxs[sortedTxs.length - 1].timestamp;
      }

      // Top tokens
      analytics.topTokens = Array.from(tokenMap.entries())
        .map(([token, data]) => ({
          symbol: token,
          address: token,
          volume: this.formatWei(data.volume),
          transactions: data.transactions,
        }))
        .sort((a, b) => Number(b.volume) - Number(a.volume))
        .slice(0, 10);

      return {
        success: true,
        data: analytics,
        message: `📊 Wallet Analytics for ${this.formatAddress(address)} on ${
          chain.name
        }`,
        suggestions: [
          "View transaction history",
          "Monitor new transactions",
          "Check token balances",
          "View on explorer",
        ],
      };
    } catch (error) {
      console.error("Error fetching wallet analytics:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Failed to fetch wallet analytics",
        suggestions: [
          "Check if the address exists on this network",
          "Try a different chain ID",
          "Verify your internet connection",
        ],
      };
    }
  }

  /**
   * Get transaction history for an address
   */
  async getTransactionHistory(
    address: string,
    chainId: SupportedChainId,
    limit: number = 10
  ): Promise<ServerBlockscoutResponse> {
    try {
      if (!this.isValidAddress(address)) {
        return {
          success: false,
          error: "Invalid wallet address format",
          message: "Please provide a valid Ethereum address (0x...)",
          suggestions: [
            "Check address format",
            "Ensure address starts with 0x",
          ],
        };
      }

      const chain = SUPPORTED_CHAINS[chainId];
      const transactions = await this.fetchTransactionsFromAPI(
        chain.explorer,
        address,
        limit
      );

      return {
        success: true,
        data: transactions,
        message: `📋 Recent ${
          transactions.length
        } transactions for ${this.formatAddress(address)}`,
        suggestions: [
          "View full transaction history",
          "Monitor new transactions",
          "Check specific transaction details",
        ],
      };
    } catch (error) {
      console.error("Error fetching transaction history:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Failed to fetch transaction history",
        suggestions: ["Try again later", "Check network connection"],
      };
    }
  }

  /**
   * Get supported chains info
   */
  getSupportedChainsInfo(): string {
    const chains = SUPPORTED_CHAINS;

    return `
🌐 **Supported Networks**

${Object.entries(chains)
  .map(([id, chain]) => `• **${chain.name}** (ID: ${id}) - ${chain.symbol}`)
  .join("\n")}

💡 Use the chain ID when requesting wallet analytics or transaction data.
    `.trim();
  }

  /**
   * Validate Ethereum address
   */
  isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Format address for display
   */
  formatAddress(address: string): string {
    if (!this.isValidAddress(address)) {
      return address;
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /**
   * Get explorer URL for address or transaction
   */
  getExplorerUrl(
    chainId: SupportedChainId,
    type: "address" | "tx",
    hash: string
  ): string {
    const chain = SUPPORTED_CHAINS[chainId];
    const baseUrl = chain.explorer.replace(/\/$/, "");

    if (type === "address") {
      return `${baseUrl}/address/${hash}`;
    } else {
      return `${baseUrl}/tx/${hash}`;
    }
  }

  /**
   * Fetch transactions from Blockscout API
   */
  private async fetchTransactionsFromAPI(
    explorerUrl: string,
    address: string,
    limit: number = 50
  ): Promise<TransactionData[]> {
    try {
      // Use the correct Blockscout API v2 endpoint
      const apiUrl = `${explorerUrl}/api/v2/addresses/${address}/transactions`;
      console.log(`Fetching real data from: ${apiUrl}`);

      const response = await fetch(apiUrl, {
        headers: {
          Accept: "application/json",
          "User-Agent": "Orai-Chatbot/1.0",
          "Content-Type": "application/json",
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        console.error(
          `Blockscout API request failed: ${response.status} ${response.statusText}`
        );
        console.error(
          `Response headers:`,
          Object.fromEntries(response.headers.entries())
        );

        // Try to get error details
        const errorText = await response.text();
        console.error(`Error response body:`, errorText);

        throw new Error(
          `Blockscout API request failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log(`Real Blockscout API response received:`, {
        itemsCount: data.items?.length || 0,
        hasItems: !!data.items,
        firstItem: data.items?.[0]
          ? {
              hash: data.items[0].hash,
              from: data.items[0].from?.hash,
              to: data.items[0].to?.hash,
              value: data.items[0].value,
              status: data.items[0].status,
            }
          : null,
      });

      if (!data.items || !Array.isArray(data.items)) {
        console.warn("No transaction items found in API response");
        return [];
      }

      // Limit results on our side since API doesn't support limit parameter
      const limitedItems = data.items.slice(0, limit);

      return limitedItems.map((tx: any) => {
        // Determine the relationship of the requested address to this transaction
        const requestedAddress = address.toLowerCase();
        const fromAddress = tx.from?.hash?.toLowerCase() || "";
        const toAddress = tx.to?.hash?.toLowerCase() || "";

        let direction = "unknown";
        let counterpartyAddress = "";

        if (fromAddress === requestedAddress) {
          direction = "sent";
          counterpartyAddress = tx.to?.hash || "";
        } else if (toAddress === requestedAddress) {
          direction = "received";
          counterpartyAddress = tx.from?.hash || "";
        }

        // Calculate gas fee in ETH
        const gasUsed = tx.gas_used || "0";
        const gasPrice = tx.gas_price || "0";
        const gasFeeWei = BigInt(gasUsed) * BigInt(gasPrice);
        const gasFeeEth = this.formatWei(gasFeeWei);

        return {
          hash: tx.hash,
          from: tx.from?.hash || "",
          to: tx.to?.hash || "",
          value: tx.value || "0",
          gasUsed: gasUsed,
          gasPrice: gasPrice,
          gasFeeEth: gasFeeEth,
          timestamp: tx.timestamp,
          status: tx.status === "ok" ? "success" : "failed",
          method: tx.method,
          direction: direction,
          counterpartyAddress: counterpartyAddress,
          tokenTransfers:
            tx.token_transfers?.map((transfer: any) => ({
              token: transfer.token?.symbol || "",
              amount: transfer.total?.value || "0",
              symbol: transfer.token?.symbol || "",
            })) || [],
        };
      });
    } catch (error) {
      console.error("Error fetching from Blockscout API:", error);

      // Don't return mock data - throw the error instead
      throw new Error(
        `Failed to fetch real transaction data from Blockscout: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Format Wei to readable format
   */
  private formatWei(wei: bigint): string {
    const eth = Number(wei) / 1e18;
    return eth.toFixed(6);
  }

  /**
   * Format wallet analytics for display
   */
  formatWalletAnalytics(analytics: WalletAnalytics): string {
    const chain = SUPPORTED_CHAINS[analytics.chainId];

    return `
📊 **Wallet Analytics**
📍 Address: ${analytics.address}
🌐 Network: ${chain.name}
📈 Total Transactions: ${analytics.totalTransactions}
💰 Total Volume: ${analytics.totalVolume} ${chain.symbol}
⛽ Gas Spent: ${analytics.gasSpent} ${chain.symbol}
📅 First TX: ${
      analytics.firstTransactionDate
        ? new Date(analytics.firstTransactionDate).toLocaleDateString()
        : "N/A"
    }
📅 Last TX: ${
      analytics.lastTransactionDate
        ? new Date(analytics.lastTransactionDate).toLocaleDateString()
        : "N/A"
    }

📤 **Transaction Types**
• Sent: ${analytics.transactionTypes.sent}
• Received: ${analytics.transactionTypes.received}
• Contract Interactions: ${analytics.transactionTypes.contractInteractions}

🏆 **Top Tokens**
${analytics.topTokens
  .slice(0, 5)
  .map(
    (token) => `• ${token.symbol}: ${token.volume} (${token.transactions} txs)`
  )
  .join("\n")}
    `.trim();
  }

  /**
   * Format transaction history for display
   */
  formatTransactionHistory(transactions: TransactionData[]): string {
    if (transactions.length === 0) {
      return "📋 No transactions found for this address.";
    }

    return `
📋 **Recent Transactions** (${transactions.length})

${transactions
  .slice(0, 5)
  .map((tx, index) => {
    const statusIcon =
      tx.status === "success" ? "✅" : tx.status === "failed" ? "❌" : "⏳";
    const statusText =
      tx.status === "success"
        ? "Success"
        : tx.status === "failed"
        ? "Failed"
        : "Pending";

    return `
${index + 1}. **${statusIcon} ${tx.hash.slice(0, 10)}...** (${statusText})
   📅 **Date:** ${
     tx.timestamp ? new Date(tx.timestamp).toLocaleDateString() : "Pending"
   }
   💰 **Amount:** ${this.formatWei(BigInt(tx.value))} ETH
   🔗 **Explorer:** [View Transaction](${this.getExplorerUrl(1, "tx", tx.hash)})
`;
  })
  .join("\n")}

${
  transactions.length > 5
    ? `\n... and ${transactions.length - 5} more transactions`
    : ""
}
    `.trim();
  }
}

// Export singleton instance
export const serverBlockscoutService = new ServerBlockscoutService();
