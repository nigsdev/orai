/**
 * Chatbot Commands for Blockscout Integration
 *
 * This module provides chatbot command handlers for wallet analytics
 * and transaction monitoring using Blockscout SDK.
 */

import { chatbotBlockscout, SupportedChainId } from "@/lib/chatbot-blockscout";

export interface ChatbotCommand {
  command: string;
  description: string;
  usage: string;
  examples: string[];
}

export interface ChatbotResponse {
  success: boolean;
  message: string;
  data?: any;
  suggestions?: string[];
  error?: string;
}

/**
 * Available chatbot commands for Blockscout integration
 */
export const BLOCKSCOUT_COMMANDS: ChatbotCommand[] = [
  {
    command: "wallet-analytics",
    description: "Get comprehensive analytics for a wallet address",
    usage: "wallet-analytics <address> [chain-id]",
    examples: [
      "wallet-analytics 0x1234...5678",
      "wallet-analytics 0x1234...5678 chain:1",
      "wallet-analytics 0x1234...5678 chain:137",
    ],
  },
  {
    command: "transaction-history",
    description: "Get transaction history for a wallet address",
    usage: "transaction-history <address> [chain-id] [limit]",
    examples: [
      "transaction-history 0x1234...5678",
      "transaction-history 0x1234...5678 chain:1 limit:20",
      "transaction-history 0x1234...5678 chain:42161",
    ],
  },
  {
    command: "monitor-transaction",
    description: "Monitor a transaction and show real-time updates",
    usage: "monitor-transaction <tx-hash> [chain-id]",
    examples: [
      "monitor-transaction 0xabcd...efgh",
      "monitor-transaction 0xabcd...efgh chain:1",
      "monitor-transaction 0xabcd...efgh chain:137",
    ],
  },
  {
    command: "show-transaction-history",
    description: "Show transaction history popup",
    usage: "show-transaction-history [address] [chain-id]",
    examples: [
      "show-transaction-history",
      "show-transaction-history 0x1234...5678",
      "show-transaction-history 0x1234...5678 chain:1",
    ],
  },
  {
    command: "supported-chains",
    description: "Show supported blockchain networks",
    usage: "supported-chains",
    examples: ["supported-chains", "show supported chains"],
  },
  {
    command: "parse-wallet",
    description: "Parse wallet address from text input",
    usage: "parse-wallet <text>",
    examples: [
      'parse-wallet "Check wallet 0x1234...5678 on chain 1"',
      'parse-wallet "Analyze 0xabcd...efgh on polygon"',
    ],
  },
  {
    command: "parse-transaction",
    description: "Parse transaction hash from text input",
    usage: "parse-transaction <text>",
    examples: [
      'parse-transaction "Monitor tx 0xabcd...efgh"',
      'parse-transaction "Check transaction 0x1234...5678 on ethereum"',
    ],
  },
];

/**
 * Chatbot command handler for Blockscout integration
 */
export class ChatbotBlockscoutCommandHandler {
  /**
   * Process a chatbot command
   */
  static async processCommand(input: string): Promise<ChatbotResponse> {
    const parts = input.trim().split(" ");
    const command = parts[0].toLowerCase();

    try {
      switch (command) {
        case "wallet-analytics":
          return await this.handleWalletAnalytics(parts.slice(1));

        case "transaction-history":
          return await this.handleTransactionHistory(parts.slice(1));

        case "monitor-transaction":
          return await this.handleMonitorTransaction(parts.slice(1));

        case "show-transaction-history":
          return await this.handleShowTransactionHistory(parts.slice(1));

        case "supported-chains":
          return await this.handleSupportedChains();

        case "parse-wallet":
          return await this.handleParseWallet(parts.slice(1).join(" "));

        case "parse-transaction":
          return await this.handleParseTransaction(parts.slice(1).join(" "));

        case "help":
        case "commands":
          return await this.handleHelp();

        default:
          return {
            success: false,
            message: `Unknown command: ${command}`,
            suggestions: [
              'Type "help" to see available commands',
              'Use "wallet-analytics <address>" to analyze a wallet',
              'Use "transaction-history <address>" to view transactions',
            ],
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Failed to process command",
        suggestions: ["Try again later", "Check command syntax"],
      };
    }
  }

  /**
   * Handle wallet analytics command
   */
  private static async handleWalletAnalytics(
    args: string[]
  ): Promise<ChatbotResponse> {
    if (args.length === 0) {
      return {
        success: false,
        message: "Please provide a wallet address",
        suggestions: ["Usage: wallet-analytics <address> [chain-id]"],
      };
    }

    const address = args[0];
    const chainId = this.parseChainId(args) || 1;

    const result = await chatbotBlockscout.getWalletAnalytics(
      address,
      chainId as SupportedChainId
    );

    if (result.success && result.data) {
      return {
        success: true,
        message: chatbotBlockscout.formatWalletAnalytics(result.data as any),
        data: result.data,
        suggestions: result.suggestions,
      };
    } else {
      return {
        success: false,
        message: result.message,
        error: result.error,
        suggestions: result.suggestions,
      };
    }
  }

  /**
   * Handle transaction history command
   */
  private static async handleTransactionHistory(
    args: string[]
  ): Promise<ChatbotResponse> {
    if (args.length === 0) {
      return {
        success: false,
        message: "Please provide a wallet address",
        suggestions: [
          "Usage: transaction-history <address> [chain-id] [limit]",
        ],
      };
    }

    const address = args[0];
    const chainId = this.parseChainId(args) || 1;
    const limit = this.parseLimit(args) || 10;

    const result = await chatbotBlockscout.getTransactionHistory(
      address,
      chainId as SupportedChainId,
      limit
    );

    if (result.success && result.data) {
      return {
        success: true,
        message: chatbotBlockscout.formatTransactionHistory(
          result.data as any[]
        ),
        data: result.data,
        suggestions: result.suggestions,
      };
    } else {
      return {
        success: false,
        message: result.message,
        error: result.error,
        suggestions: result.suggestions,
      };
    }
  }

  /**
   * Handle monitor transaction command
   */
  private static async handleMonitorTransaction(
    args: string[]
  ): Promise<ChatbotResponse> {
    if (args.length === 0) {
      return {
        success: false,
        message: "Please provide a transaction hash",
        suggestions: ["Usage: monitor-transaction <tx-hash> [chain-id]"],
      };
    }

    const txHash = args[0];
    const chainId = this.parseChainId(args) || 1;

    const result = await chatbotBlockscout.monitorTransaction(
      chainId as SupportedChainId,
      txHash
    );

    return {
      success: result.success,
      message: result.message,
      data: result.data,
      error: result.error,
    };
  }

  /**
   * Handle show transaction history command
   */
  private static async handleShowTransactionHistory(
    args: string[]
  ): Promise<ChatbotResponse> {
    const address = args.find((arg) => arg.startsWith("0x"));
    const chainId = this.parseChainId(args) || 1;

    const result = chatbotBlockscout.showTransactionHistoryPopup(
      chainId as SupportedChainId,
      address
    );

    return {
      success: result.success,
      message: result.message,
      data: result.data,
      error: result.error,
    };
  }

  /**
   * Handle supported chains command
   */
  private static async handleSupportedChains(): Promise<ChatbotResponse> {
    return {
      success: true,
      message: chatbotBlockscout.getSupportedChainsInfo(),
      suggestions: [
        "Use chain ID 1 for Ethereum Mainnet",
        "Use chain ID 137 for Polygon",
        "Use chain ID 42161 for Arbitrum",
      ],
    };
  }

  /**
   * Handle parse wallet command
   */
  private static async handleParseWallet(
    input: string
  ): Promise<ChatbotResponse> {
    if (!input) {
      return {
        success: false,
        message: "Please provide text to parse",
        suggestions: ["Usage: parse-wallet <text>"],
      };
    }

    const result = chatbotBlockscout.parseWalletInput(input);

    return {
      success: !result.error,
      message:
        result.error ||
        `Parsed: Address ${result.address}, Chain ${result.chainId}`,
      data: result,
      error: result.error,
    };
  }

  /**
   * Handle parse transaction command
   */
  private static async handleParseTransaction(
    input: string
  ): Promise<ChatbotResponse> {
    if (!input) {
      return {
        success: false,
        message: "Please provide text to parse",
        suggestions: ["Usage: parse-transaction <text>"],
      };
    }

    const result = chatbotBlockscout.parseTransactionInput(input);

    return {
      success: !result.error,
      message:
        result.error ||
        `Parsed: Transaction ${result.txHash}, Chain ${result.chainId}`,
      data: result,
      error: result.error,
    };
  }

  /**
   * Handle help command
   */
  private static async handleHelp(): Promise<ChatbotResponse> {
    const commandsList = BLOCKSCOUT_COMMANDS.map(
      (cmd) =>
        `**${cmd.command}** - ${cmd.description}\n  Usage: \`${
          cmd.usage
        }\`\n  Examples: ${cmd.examples.join(", ")}`
    ).join("\n\n");

    return {
      success: true,
      message: `🤖 **Available Blockscout Commands**\n\n${commandsList}\n\n💡 **Tips:**\n• Use "help" to see this list again\n• Chain IDs: 1 (Ethereum), 137 (Polygon), 42161 (Arbitrum), 10 (Optimism)\n• All commands support chain specification with "chain:X"`,
      suggestions: [
        'Try "wallet-analytics <address>" to analyze a wallet',
        'Use "transaction-history <address>" to view transactions',
        'Type "supported-chains" to see all supported networks',
      ],
    };
  }

  /**
   * Parse chain ID from command arguments
   */
  private static parseChainId(args: string[]): number | null {
    const chainArg = args.find((arg) => arg.startsWith("chain:"));
    if (chainArg) {
      const chainId = parseInt(chainArg.split(":")[1]);
      return isNaN(chainId) ? null : chainId;
    }
    return null;
  }

  /**
   * Parse limit from command arguments
   */
  private static parseLimit(args: string[]): number | null {
    const limitArg = args.find((arg) => arg.startsWith("limit:"));
    if (limitArg) {
      const limit = parseInt(limitArg.split(":")[1]);
      return isNaN(limit) ? null : limit;
    }
    return null;
  }

  /**
   * Check if input is a Blockscout command
   */
  static isBlockscoutCommand(input: string): boolean {
    const command = input.trim().split(" ")[0].toLowerCase();
    return (
      BLOCKSCOUT_COMMANDS.some((cmd) => cmd.command === command) ||
      command === "help"
    );
  }

  /**
   * Get command suggestions based on input
   */
  static getCommandSuggestions(input: string): string[] {
    const partial = input.toLowerCase();
    return BLOCKSCOUT_COMMANDS.filter((cmd) =>
      cmd.command.startsWith(partial)
    ).map((cmd) => cmd.command);
  }
}

// Export for easy use
export const blockscoutCommandHandler = ChatbotBlockscoutCommandHandler;
