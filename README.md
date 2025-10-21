# Orai 🚀

> **Intelligent Cross-Chain Web3 Assistant**

Orai is an AI-powered chatbot that enables users to query, analyze, and execute on-chain transactions across multiple EVM-compatible networks. Built for ETHGlobal hackathon with cutting-edge Web3 technologies.

## 🎯 Features

- **🤖 AI-Powered Chat Interface** - Natural language processing for Web3 operations
- **🌉 Cross-Chain Operations** - Bridge tokens between Ethereum, Polygon, Arbitrum, and Base
- **📊 Wallet Analytics** - Real-time transaction history and spending insights
- **⚡ DeFi Integration** - Staking, swapping, and yield farming operations
- **🔒 Secure & Audited** - Built with security best practices

## 🧩 Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Shadcn UI** for components
- **Framer Motion** for animations
- **Zustand** for state management

### Web3 Integration
- **Wagmi** + **RainbowKit** for wallet connection
- **Ethers.js** for blockchain interactions
- **Avail Nexus SDK** for cross-chain operations
- **Hedera AgentKit** for AI reasoning
- **Blockscout MCP** for blockchain analytics

### AI & Backend
- **OpenAI GPT-4** for natural language processing
- **Next.js API Routes** for backend logic
- **Chain-of-thought reasoning** for intent parsing

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- WalletConnect Project ID
- OpenAI API Key (optional, falls back to mock responses)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd orai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your API keys in `.env.local`:
   ```env
   # Required
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
   
   # Optional (for production)
   OPENAI_API_KEY=your_openai_api_key
   AVAIL_NEXUS_API_KEY=your_avail_nexus_api_key
   HEDERA_AGENT_API_KEY=your_hedera_agent_api_key
   BLOCKSCOUT_API_KEY=your_blockscout_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 💬 Usage Examples

### Cross-Chain Transfer
```
User: "Send 10 USDC from Ethereum to Polygon"
AI: "I'll bridge 10 USDC from Ethereum to Polygon. This will take approximately 2-5 minutes."
```

### Wallet Analytics
```
User: "Show my last 5 transactions on Arbitrum"
AI: "📊 Wallet Analytics for 0x742d...35Cc
     Balance: 1.2345 ETH
     Total Transactions: 47
     Top Tokens: WETH, USDC, USDT"
```

### DeFi Operations
```
User: "Stake my ETH for yield"
AI: "I'll help you stake 1 ETH for yield. Current APY is approximately 4-6%."
```

## 🏗️ Project Structure

```
Orai/
├── app/
│   ├── api/
│   │   ├── chat/          # AI chat endpoint
│   │   ├── execute/       # Transaction execution
│   │   └── analytics/     # Wallet analytics
│   ├── components/        # React components
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Main page
│   └── providers.tsx     # Web3 providers
├── lib/
│   ├── avail.ts          # Avail Nexus SDK integration
│   ├── hederaAgent.ts    # Hedera AgentKit integration
│   ├── blockscout.ts     # Blockscout MCP integration
│   ├── aiParser.ts       # AI/LLM integration
│   ├── store.ts          # Zustand state management
│   └── utils.ts          # Utility functions
├── components/
│   ├── ui/               # Shadcn UI components
│   ├── ChatWindow.tsx    # Main chat interface
│   ├── MessageBubble.tsx # Message display
│   ├── WalletCard.tsx    # Wallet connection
│   └── Loader.tsx        # Loading states
└── hooks/
    └── use-toast.ts      # Toast notifications
```

## 🔧 API Endpoints

### POST /api/chat
Handles AI chat interactions and intent parsing.

**Request:**
```json
{
  "message": "Send 10 USDC from Ethereum to Polygon",
  "walletAddress": "0x...",
  "chainId": 1
}
```

**Response:**
```json
{
  "response": "I'll bridge 10 USDC from Ethereum to Polygon...",
  "transactionHash": "0x...",
  "chainId": 137,
  "status": "success",
  "metadata": {
    "type": "bridge",
    "amount": "10",
    "token": "USDC"
  }
}
```

### POST /api/execute
Executes cross-chain transactions.

### GET /api/analytics
Fetches wallet analytics and transaction history.

## 🔌 SDK Integrations

### Avail Nexus SDK
```typescript
import { executeCrossChainIntent } from '@/lib/avail'

const result = await executeCrossChainIntent({
  chainFrom: 1,        // Ethereum
  chainTo: 137,        // Polygon
  token: 'USDC',
  amount: '10',
  walletAddress: '0x...'
})
```

### Hedera AgentKit
```typescript
import { parseUserIntent } from '@/lib/hederaAgent'

const response = await parseUserIntent(
  "Send 10 USDC from Ethereum to Polygon",
  "0x..."
)
```

### Blockscout MCP
```typescript
import { getWalletAnalytics } from '@/lib/blockscout'

const analytics = await getWalletAnalytics(
  "0x...",
  1  // Ethereum
)
```

## 🎨 Customization

### Adding New Chains
1. Update `getSupportedChains()` in `lib/avail.ts`
2. Add chain configuration in `app/providers.tsx`
3. Update chain icons in `lib/utils.ts`

### Adding New Tokens
1. Update `getAvailableTokens()` in `lib/avail.ts`
2. Add token metadata and contract addresses

### Customizing AI Responses
1. Modify prompts in `lib/aiParser.ts`
2. Update intent parsing logic in `lib/hederaAgent.ts`

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Docker
```bash
docker build -t orai .
docker run -p 3000:3000 orai
```

## 🔒 Security

- All API keys are stored in environment variables
- Wallet connections use secure Web3 protocols
- Smart contract interactions are validated
- Input sanitization and validation on all endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **Avail** for cross-chain infrastructure
- **Hedera** for AI agent capabilities  
- **Blockscout** for blockchain analytics
- **ETHGlobal** for the hackathon platform
- **OpenAI** for language model capabilities

## 📞 Support

- GitHub Issues for bug reports
- Discord for community support
- Email for business inquiries

---

**Built with ❤️ for ETHGlobal Hackathon**

*Orai - Making Web3 accessible through AI*
