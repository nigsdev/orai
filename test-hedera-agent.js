/**
 * Test script for Hedera AgentKit integration
 * 
 * This script tests the Hedera AgentKit functionality without requiring
 * a full Next.js environment. Run with: node test-hedera-agent.js
 */

require('dotenv').config({ path: '.env.local' })

async function testHederaAgentKit() {

  // Check environment variables

  if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
    return
  }

  if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY && !process.env.GROQ_API_KEY) {
    return
  }

  try {
    // Import the Hedera AgentKit functions
    const { initializeHederaAgent, parseUserIntent, getHederaBalance } = require('./lib/hederaAgent.ts')

    const agent = initializeHederaAgent()
    
    if (!agent) {
      return
    }


    // Test 1: Get HBAR balance
    try {
      const balance = await getHederaBalance()
    } catch (error) {
    }

    // Test 2: Parse user intent
    const testQueries = [
      "What's my HBAR balance?",
      "Transfer 5 HBAR to account 0.0.1234",
      "Create a new token called 'TestToken' with symbol 'TEST'",
      "Send 10 USDC from Ethereum to Polygon"
    ]

    for (const query of testQueries) {
      try {
        const result = await parseUserIntent(query)
      } catch (error) {
      }
    }


  } catch (error) {
  }
}

// Run the test
