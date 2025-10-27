import { NextRequest, NextResponse } from "next/server";
import { serverBlockscoutService } from "@/lib/server-blockscout";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");
    const chainId = parseInt(searchParams.get("chainId") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");

    if (!address) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Validate address format (basic check)
    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: "Invalid wallet address format" },
        { status: 400 }
      );
    }

    // Fetch comprehensive analytics
    const [analyticsRes, recentRes] = await Promise.all([
      serverBlockscoutService.getWalletAnalytics(address, chainId as any),
      serverBlockscoutService.getTransactionHistory(
        address,
        chainId as any,
        limit
      ),
    ]);

    if (!analyticsRes.success) {
      return NextResponse.json(
        { success: false, error: analyticsRes.error || analyticsRes.message },
        { status: 500 }
      );
    }

    if (!recentRes.success) {
      return NextResponse.json(
        { success: false, error: recentRes.error || recentRes.message },
        { status: 500 }
      );
    }

    const wa = analyticsRes.data as any;
    const txs = (recentRes.data as any[]) || [];

    // Adapt to client-expected shape
    const wallet = {
      balance: "0",
      transactionCount: wa.totalTransactions,
      tokenBalances: (wa.topTokens || []).map((t: any) => ({
        symbol: t.symbol,
        balance: t.volume,
        value: undefined,
      })),
      lastTransaction: wa.lastTransactionDate,
    };

    return NextResponse.json({
      success: true,
      data: {
        analytics: { wallet, topTokens: wa.topTokens },
        recentTransactions: txs,
        tokenBalances: wallet.tokenBalances,
        summary: {
          totalValue: 0,
          transactionCount: wallet.transactionCount,
          lastActivity: (wa as any).lastTransactionDate,
          topToken: (wa as any).topTokens?.[0]?.symbol || "N/A",
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in analytics API:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { address, chainId, type, parameters } = await request.json();

    if (!address) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    let result: any = {};

    switch (type) {
      case "wallet_summary": {
        const r = await serverBlockscoutService.getWalletAnalytics(
          address,
          (chainId || 1) as any
        );
        if (!r.success) {
          return NextResponse.json(
            { success: false, error: r.error || r.message },
            { status: 500 }
          );
        }
        const wa = r.data as any;
        result = {
          wallet: {
            balance: "0",
            transactionCount: (wa as any).totalTransactions,
            tokenBalances: ((wa as any).topTokens || []).map((t: any) => ({
              symbol: t.symbol,
              balance: t.volume,
            })),
            lastTransaction: (wa as any).lastTransactionDate,
          },
          topTokens: wa.topTokens,
        };
        break;
      }

      case "recent_transactions": {
        const limit = parameters?.limit || 10;
        const r = await serverBlockscoutService.getTransactionHistory(
          address,
          (chainId || 1) as any,
          limit
        );
        if (!r.success) {
          return NextResponse.json(
            { success: false, error: r.error || r.message },
            { status: 500 }
          );
        }
        result = r.data;
        break;
      }

      case "token_balances": {
        const r = await serverBlockscoutService.getWalletAnalytics(
          address,
          (chainId || 1) as any
        );
        if (!r.success) {
          return NextResponse.json(
            { success: false, error: r.error || r.message },
            { status: 500 }
          );
        }
        const wa = r.data as any;
        result = ((wa as any).topTokens || []).map((t: any) => ({
          symbol: t.symbol,
          balance: t.volume,
        }));
        break;
      }

      case "spending_analysis": {
        const r = await serverBlockscoutService.getWalletAnalytics(
          address,
          (chainId || 1) as any
        );
        if (!r.success) {
          return NextResponse.json(
            { success: false, error: r.error || r.message },
            { status: 500 }
          );
        }
        const wa = r.data as any;
        result = {
          spendingPatterns: [],
          totalSpent: "0",
          totalReceived: (wa as any).totalVolume,
          netFlow: (wa as any).totalVolume,
        };
        break;
      }

      default:
        return NextResponse.json(
          { error: "Unsupported analytics type" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in analytics POST API:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
