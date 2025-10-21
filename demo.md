# Orai Demo Guide

## 🎯 Quick Demo Scenarios

### 1. Cross-Chain Bridge Demo
**User Input:** "Send 10 USDC from Ethereum to Polygon"

**Expected Flow:**
1. AI parses intent using Hedera AgentKit
2. Avail Nexus SDK executes cross-chain bridge
3. Transaction hash displayed with chain icons
4. Success confirmation with gas cost

### 2. Wallet Analytics Demo
**User Input:** "Show my last 5 transactions on Arbitrum"

**Expected Flow:**
1. Blockscout MCP fetches transaction history
2. AI formats data into readable summary
3. Interactive transaction cards with explorer links
4. Spending pattern analysis

### 3. DeFi Staking Demo
**User Input:** "Stake my ETH for yield"

**Expected Flow:**
1. AI identifies staking intent
2. Shows current APY and staking options
3. Guides user through staking process
4. Displays yield projections

## 🚀 Demo Setup

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Connect a wallet** using RainbowKit

3. **Try the example queries** from the quick actions

4. **Observe the AI responses** with transaction metadata

## 📱 Demo Features to Highlight

- **Natural Language Processing** - AI understands complex queries
- **Cross-Chain Operations** - Seamless bridging between networks
- **Real-time Analytics** - Live wallet data and transaction history
- **Transaction Tracking** - Hash display with explorer links
- **Responsive Design** - Works on desktop and mobile
- **Dark Theme** - Modern, professional UI

## 🎨 UI Components Demo

- **Chat Interface** - ChatGPT-like conversation flow
- **Message Bubbles** - Rich transaction metadata display
- **Wallet Card** - Connection status and balance
- **Network Status** - Real-time chain connectivity
- **Quick Actions** - Pre-built example queries

## 🔧 Technical Demo Points

- **State Management** - Zustand for chat persistence
- **Web3 Integration** - Wagmi + RainbowKit wallet connection
- **API Routes** - Next.js backend for AI processing
- **Type Safety** - Full TypeScript implementation
- **Error Handling** - Graceful fallbacks and user feedback

## 📊 Mock Data

The demo uses realistic mock data for:
- Transaction history
- Token balances
- Cross-chain bridge results
- Wallet analytics
- Gas fee estimates

## 🎯 Demo Script

1. **Welcome Screen** - Show the clean, professional interface
2. **Connect Wallet** - Demonstrate RainbowKit integration
3. **Chat Interface** - Show the AI conversation flow
4. **Cross-Chain Demo** - Execute a bridge transaction
5. **Analytics Demo** - Display wallet insights
6. **Mobile View** - Show responsive design
7. **Error Handling** - Demonstrate graceful error states

## 🏆 Key Differentiators

- **AI-First Approach** - Natural language for Web3 operations
- **Multi-Chain Support** - Ethereum, Polygon, Arbitrum, Base
- **Real-time Data** - Live blockchain analytics
- **Professional UI** - Production-ready design
- **Hackathon Ready** - Complete, deployable solution
