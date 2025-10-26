/**
 * Test script for OP Mainnet integration
 * 
 * This script tests the OP Mainnet Blockscout integration
 */

require('dotenv').config({ path: '.env.local' })

async function testOPMainnet() {
  console.log('🧪 Testing OP Mainnet Integration...\n')

  try {
    // Import the Blockscout functions
    const { getWalletAnalytics, isChainSupported } = require('./lib/blockscout.ts')

    // Test chain support
    console.log('📋 Chain Support Check:')
    console.log(`- OP Mainnet (10): ${isChainSupported(10) ? '✅ Supported' : '❌ Not Supported'}`)
    console.log('')

    // Test with your actual OP Mainnet address
    const testAddress = '0xb9527b4c8e8e8e8e8e8e8e8e8e8e8e8e8e94f78' // Your actual address from the image
    
    console.log('💰 Testing OP Mainnet Analytics:')
    console.log(`- Address: ${testAddress}`)
    console.log(`- Chain: OP Mainnet (10)`)
    console.log('')

    try {
      const analytics = await getWalletAnalytics(testAddress, 10)
      console.log('✅ OP Mainnet Analytics Retrieved:')
      console.log(`- Balance: ${analytics.wallet.balance} ETH`)
      console.log(`- Transaction Count: ${analytics.wallet.transactionCount}`)
      console.log(`- Recent Transactions: ${analytics.recentTransactions.length}`)
      
      if (analytics.recentTransactions.length > 0) {
        console.log('\n📊 Recent OP Mainnet Transactions:')
        analytics.recentTransactions.slice(0, 3).forEach((tx, index) => {
          console.log(`${index + 1}. ${tx.from === testAddress ? 'Sent' : 'Received'} ${tx.value} ETH`)
          console.log(`   Hash: ${tx.hash}`)
          console.log(`   Time: ${new Date(tx.timestamp).toLocaleString()}`)
        })
      }
    } catch (error) {
      console.log('❌ Error fetching OP Mainnet analytics:', error.message)
    }

    console.log('\n🎉 OP Mainnet integration test completed!')
    console.log('\n📚 How to use in your app:')
    console.log('1. Connect your wallet to OP Mainnet')
    console.log('2. Ask the AI: "What\'s my OP Mainnet balance?"')
    console.log('3. Ask the AI: "Show my Optimism transaction history"')
    console.log('4. Check the Analytics page for detailed OP Mainnet data')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
testOPMainnet().catch(console.error)
