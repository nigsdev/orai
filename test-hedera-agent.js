/**
 * Test script for Hedera AgentKit integration
 * 
 * This script tests the Hedera AgentKit functionality without requiring
 * a full Next.js environment. Run with: node test-hedera-agent.js
 */

require('dotenv').config({ path: '.env.local' })

async function testHederaAgentKit() {
  console.log('🧪 Testing Hedera AgentKit Integration...\n')

  // Check environment variables
  console.log('📋 Environment Check:')
  console.log(`- HEDERA_ACCOUNT_ID: ${process.env.HEDERA_ACCOUNT_ID ? '✅ Set' : '❌ Missing'}`)
  console.log(`- HEDERA_PRIVATE_KEY: ${process.env.HEDERA_PRIVATE_KEY ? '✅ Set' : '❌ Missing'}`)
  console.log(`- OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing'}`)
  console.log(`- ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? '✅ Set' : '❌ Missing'}`)
  console.log(`- GROQ_API_KEY: ${process.env.GROQ_API_KEY ? '✅ Set' : '❌ Missing'}`)
  console.log('')

  if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
    console.log('❌ Hedera credentials not found!')
    console.log('Please set HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY in your .env file')
    console.log('Get free testnet account at: https://portal.hedera.com/dashboard')
    return
  }

  if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY && !process.env.GROQ_API_KEY) {
    console.log('❌ No AI provider API key found!')
    console.log('Please set at least one of: OPENAI_API_KEY, ANTHROPIC_API_KEY, or GROQ_API_KEY')
    console.log('Or install Ollama locally for free AI: https://ollama.com')
    return
  }

  try {
    // Import the Hedera AgentKit functions
    const { initializeHederaAgent, parseUserIntent, getHederaBalance } = require('./lib/hederaAgent.ts')

    console.log('🚀 Initializing Hedera AgentKit...')
    const agent = initializeHederaAgent()
    
    if (!agent) {
      console.log('❌ Failed to initialize Hedera AgentKit')
      return
    }

    console.log('✅ Hedera AgentKit initialized successfully!')
    console.log(`- Version: ${agent.version}`)
    console.log(`- Model: ${agent.model}`)
    console.log('')

    // Test 1: Get HBAR balance
    console.log('💰 Test 1: Getting HBAR balance...')
    try {
      const balance = await getHederaBalance()
      console.log(`✅ Balance: ${balance}`)
    } catch (error) {
      console.log(`❌ Error getting balance: ${error.message}`)
    }
    console.log('')

    // Test 2: Parse user intent
    console.log('🧠 Test 2: Parsing user intent...')
    const testQueries = [
      "What's my HBAR balance?",
      "Transfer 5 HBAR to account 0.0.1234",
      "Create a new token called 'TestToken' with symbol 'TEST'",
      "Send 10 USDC from Ethereum to Polygon"
    ]

    for (const query of testQueries) {
      console.log(`\n📝 Testing: "${query}"`)
      try {
        const result = await parseUserIntent(query)
        console.log(`✅ Intent: ${result.intent.action}`)
        console.log(`✅ Confidence: ${result.intent.confidence}`)
        console.log(`✅ Response: ${result.response.substring(0, 100)}...`)
      } catch (error) {
        console.log(`❌ Error: ${error.message}`)
      }
    }

    console.log('\n🎉 Hedera AgentKit integration test completed!')
    console.log('\n📚 Next steps:')
    console.log('1. Set up your .env file with the required credentials')
    console.log('2. Test the chat interface in your Next.js app')
    console.log('3. Try Hedera operations like "What\'s my balance?" or "Transfer 1 HBAR"')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('Stack trace:', error.stack)
  }
}

// Run the test
testHederaAgentKit().catch(console.error)
