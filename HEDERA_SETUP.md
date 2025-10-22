# Hedera AgentKit Integration Setup Guide

This guide will help you set up the Hedera AgentKit integration for fully functional AI reasoning in your Orai project.

## 🚀 Quick Start

### 1. Get Hedera Testnet Account

1. Visit [Hedera Portal](https://portal.hedera.com/dashboard)
2. Create a free account
3. Generate a new testnet account
4. Copy your Account ID and Private Key

### 2. Choose AI Provider

You need at least one AI provider. Choose from:

#### Option A: OpenAI (Recommended for production)
1. Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add to `.env`: `OPENAI_API_KEY=sk-proj-...`

#### Option B: Anthropic Claude
1. Get API key from [Anthropic Console](https://console.anthropic.com)
2. Add to `.env`: `ANTHROPIC_API_KEY=sk-ant-...`

#### Option C: Groq (Free tier available)
1. Get API key from [Groq Console](https://console.groq.com/keys)
2. Add to `.env`: `GROQ_API_KEY=gsk_...`

#### Option D: Ollama (100% Free, Local)
1. Install [Ollama](https://ollama.com)
2. Run: `ollama pull llama3.2`
3. No API key needed!

### 3. Configure Environment Variables

Create or update your `.env` file:

```env
# Hedera AgentKit Configuration
HEDERA_ACCOUNT_ID=0.0.xxxxx
HEDERA_PRIVATE_KEY=0x...

# AI Provider (choose at least one)
OPENAI_API_KEY=sk-proj-...
# ANTHROPIC_API_KEY=sk-ant-...
# GROQ_API_KEY=gsk_...
# Ollama doesn't need an API key

# Existing configuration
OPENAI_API_KEY=your_existing_openai_key
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_id
```

### 4. Test the Integration

Run the test script to verify everything works:

```bash
node test-hedera-agent.js
```

## 🧪 Testing

### Test Script
The `test-hedera-agent.js` script will:
- ✅ Check environment variables
- ✅ Initialize Hedera AgentKit
- ✅ Test HBAR balance query
- ✅ Test various user intents
- ✅ Verify AI reasoning capabilities

### Manual Testing
Try these commands in your chat interface:

**Hedera Operations:**
- "What's my HBAR balance?"
- "Transfer 5 HBAR to account 0.0.1234"
- "Create a new token called 'TestToken' with symbol 'TEST'"
- "Create a new topic for project updates"

**Cross-Chain Operations:**
- "Send 10 USDC from Ethereum to Polygon"
- "Bridge 1 ETH to Arbitrum"
- "Show my transaction history"

## 🔧 Features

### Hedera AgentKit Capabilities

The integration provides:

1. **HBAR Transfers**: Send HBAR between accounts
2. **Token Operations**: Create fungible/non-fungible tokens
3. **Consensus Service**: Create topics and submit messages
4. **Account Queries**: Get balances, transaction history
5. **AI Reasoning**: Natural language to Hedera operations

### AI Provider Support

- **OpenAI GPT-4**: Best for complex reasoning
- **Anthropic Claude**: Excellent for safety and accuracy
- **Groq**: Fast inference with free tier
- **Ollama**: Completely free, runs locally

### Fallback System

- If Hedera AgentKit fails → Falls back to mock implementation
- If AI provider fails → Uses keyword-based parsing
- Graceful error handling with helpful messages

## 🛠️ Troubleshooting

### Common Issues

1. **"Hedera AgentKit not initialized"**
   - Check HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY
   - Verify account has testnet HBAR

2. **"No AI provider available"**
   - Set at least one AI provider API key
   - Or install Ollama locally

3. **"Failed to execute Hedera operation"**
   - Check network connection
   - Verify account has sufficient HBAR for fees
   - Ensure account is on testnet

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=hedera-agent-kit
```

## 📚 API Reference

### Core Functions

```typescript
// Initialize the agent
const agent = initializeHederaAgent()

// Parse user intent
const response = await parseUserIntent("Transfer 5 HBAR", walletAddress)

// Execute Hedera operation
const result = await executeHederaOperation("Transfer 5 HBAR to 0.0.1234")

// Get balance
const balance = await getHederaBalance()
```

### Response Format

```typescript
interface AgentResponse {
  intent: {
    action: 'hedera_operation' | 'transfer' | 'bridge' | 'analytics'
    confidence: number
    reasoning: string
    hederaOperation?: {
      type: 'transfer_hbar' | 'create_token' | 'create_topic'
      details: any
    }
  }
  response: string
  suggestions?: string[]
  warnings?: string[]
  executionResult?: {
    success: boolean
    transactionId?: string
    error?: string
  }
}
```

## 🎯 Next Steps

1. **Test thoroughly** with the test script
2. **Try different AI providers** to find your preference
3. **Experiment with Hedera operations** in the chat interface
4. **Monitor transaction fees** and account balance
5. **Extend functionality** by adding custom plugins

## 🔗 Resources

- [Hedera AgentKit Documentation](https://github.com/hedera-dev/hedera-agent-kit)
- [Hedera Portal](https://portal.hedera.com/dashboard)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Anthropic Claude Documentation](https://docs.anthropic.com)
- [Groq Documentation](https://console.groq.com/docs)
- [Ollama Documentation](https://ollama.com/docs)

## 🆘 Support

If you encounter issues:

1. Check the test script output
2. Verify all environment variables
3. Check the browser console for errors
4. Review the Hedera AgentKit logs
5. Try with different AI providers

The integration is designed to be robust with multiple fallbacks, so even if one component fails, the system will continue to work with reduced functionality.
