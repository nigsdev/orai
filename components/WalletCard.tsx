'use client'

import { useAccount, useBalance, useConnect, useDisconnect } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatAddress, formatAmount } from '@/lib/utils'
import { Wallet, Copy, ExternalLink } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { injected } from 'wagmi/connectors'

export function WalletCard() {
  const { address, isConnected, chain } = useAccount()
  const { data: balance } = useBalance({
    address: address,
  })
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const { toast } = useToast()

  // Debug logging
  console.log('WalletCard - isConnected:', isConnected, 'address:', address)

  const handleConnect = async () => {
    try {
      // Check if MetaMask is available
      if (typeof window !== 'undefined' && window.ethereum) {
        await connect({ connector: injected() })
        toast({
          title: 'Wallet Connected',
          description: 'Successfully connected to your wallet',
        })
      } else {
        toast({
          title: 'MetaMask Not Found',
          description: 'Please install MetaMask browser extension',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Connection error:', error)
      toast({
        title: 'Connection Failed',
        description: 'Please install MetaMask or another Web3 wallet',
        variant: 'destructive',
      })
    }
  }

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      toast({
        title: 'Address copied',
        description: 'Wallet address copied to clipboard',
      })
    }
  }

  const getExplorerUrl = () => {
    if (!address || !chain) return null
    
    const explorers: Record<number, string> = {
      1: 'https://etherscan.io/address/',
      137: 'https://polygonscan.com/address/',
      42161: 'https://arbiscan.io/address/',
      8453: 'https://basescan.org/address/',
    }
    
    return explorers[chain.id] + address
  }

  if (!isConnected) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Connect your wallet to start using Orai for cross-chain transactions.
          </p>
          
          <div className="flex flex-col gap-3">
            <div className="w-full">
              <ConnectButton />
            </div>
            
            {/* Manual connect button */}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleConnect}
            >
              <Wallet className="h-4 w-4 mr-2" />
              Connect MetaMask
            </Button>
            
            <div className="text-xs text-muted-foreground text-center">
              Supported wallets: MetaMask, WalletConnect, Coinbase Wallet, and more
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Connected Wallet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Address</p>
            <p className="text-xs text-muted-foreground font-mono">
              {formatAddress(address || '')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyAddress}
              className="h-8 w-8 p-0"
            >
              <Copy className="h-3 w-3" />
            </Button>
            {getExplorerUrl() && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const url = getExplorerUrl()
                  if (url) window.open(url, '_blank')
                }}
                className="h-8 w-8 p-0"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        
        <div>
          <p className="text-sm font-medium">Network</p>
          <p className="text-xs text-muted-foreground">
            {chain?.name} (Chain ID: {chain?.id})
          </p>
        </div>
        
        {balance && (
          <div>
            <p className="text-sm font-medium">Balance</p>
            <p className="text-xs text-muted-foreground">
              {formatAmount(balance.formatted)} {balance.symbol}
            </p>
          </div>
        )}
        
        <div className="pt-2 space-y-2">
          <ConnectButton />
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => disconnect()}
          >
            Disconnect
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
