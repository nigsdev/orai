/**
 * Test script for OP Mainnet integration
 * 
 * This script tests the OP Mainnet Blockscout integration
 */

require('dotenv').config({ path: '.env.local' })

async function testOPMainnet() {

  try {
    // Import the Blockscout functions
    const { getWalletAnalytics, isChainSupported } = require('./lib/blockscout.ts')

    // Test chain support

    // Test with your actual OP Mainnet address
    const testAddress = '0xb9527b4c8e8e8e8e8e8e8e8e8e8e8e8e8e94f78' // Your actual address from the image
    

    try {
      const analytics = await getWalletAnalytics(testAddress, 10)
      
      if (analytics.recentTransactions.length > 0) {
        analytics.recentTransactions.slice(0, 3).forEach((tx, index) => {
        })
      }
    } catch (error) {
    }


  } catch (error) {
  }
}

// Run the test
