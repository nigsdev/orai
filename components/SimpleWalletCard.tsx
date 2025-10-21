'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wallet, Copy, ExternalLink } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useChatStore } from '@/lib/store'

export function SimpleWalletCard() {
  const { wallet, setWallet } = useChatStore()
  const [isMetaMaskAvailable, setIsMetaMaskAvailable] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const { toast } = useToast()

  // Check if we're on the client side and MetaMask availability
  useEffect(() => {
    // Set client state immediately
    setIsClient(true)
    
    // Simple initialization
    const init = () => {
      const isAvailable = typeof window !== 'undefined' && !!window.ethereum
      setIsMetaMaskAvailable(isAvailable)
      setIsInitialized(true)
    }
    
    // Initialize immediately
    init()
  }, [])

  const connectWallet = async () => {
    try {
      if (!isMetaMaskAvailable) {
        toast({
          title: 'MetaMask Not Found',
          description: 'Please install MetaMask browser extension',
          variant: 'destructive',
        })
        return
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })

      if (accounts.length > 0) {
        const address = accounts[0]
        
        // Get chain ID
        const chainId = await window.ethereum.request({
          method: 'eth_chainId',
        })

        setWallet({
          address,
          isConnected: true,
          chainId: parseInt(chainId, 16),
        })

        toast({
          title: 'Wallet Connected',
          description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
        })
      }
    } catch (error: any) {
      console.error('Connection error:', error)
      toast({
        title: 'Connection Failed',
        description: error.message || 'Failed to connect wallet',
        variant: 'destructive',
      })
    }
  }

  const disconnectWallet = () => {
    setWallet({
      address: null,
      isConnected: false,
      chainId: null,
    })
    toast({
      title: 'Wallet Disconnected',
      description: 'Successfully disconnected from wallet',
    })
  }

  const copyAddress = () => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address)
      toast({
        title: 'Address copied',
        description: 'Wallet address copied to clipboard',
      })
    }
  }

  const getExplorerUrl = () => {
    if (!wallet.address || !wallet.chainId) return null
    
    const explorers: Record<number, string> = {
      1: 'https://etherscan.io/address/',
      137: 'https://polygonscan.com/address/',
      42161: 'https://arbiscan.io/address/',
      8453: 'https://basescan.org/address/',
    }
    
    return explorers[wallet.chainId] + wallet.address
  }

  const getChainName = (chainId: number) => {
    const chains: Record<number, string> = {
      1: 'Ethereum',
      137: 'Polygon',
      42161: 'Arbitrum',
      8453: 'Base',
    }
    return chains[chainId] || `Chain ${chainId}`
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Listen for account changes
  useEffect(() => {
    if (isMetaMaskAvailable) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setWallet({
            address: null,
            isConnected: false,
            chainId: null,
          })
        } else {
          setWallet({
            address: accounts[0],
            isConnected: true,
          })
        }
      }

      const handleChainChanged = (chainId: string) => {
        setWallet({
          chainId: parseInt(chainId, 16),
        })
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [isMetaMaskAvailable])

  if (!wallet.isConnected) {
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
            <Button 
              onClick={connectWallet}
              className="w-full"
              disabled={!isInitialized}
            >
              <Wallet className="h-4 w-4 mr-2" />
              {!isInitialized 
                ? 'Loading...' 
                : isMetaMaskAvailable 
                  ? 'Connect MetaMask' 
                  : 'Install MetaMask'
              }
            </Button>
            
            <div className="text-xs text-muted-foreground text-center">
              {!isInitialized 
                ? 'Initializing wallet connection...'
                : isMetaMaskAvailable 
                  ? 'Click to connect your MetaMask wallet'
                  : 'Please install MetaMask browser extension first'
              }
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
              {formatAddress(wallet.address || '')}
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
            {wallet.chainId ? getChainName(wallet.chainId) : 'Unknown'} (Chain ID: {wallet.chainId})
          </p>
        </div>
        
        <div className="pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={disconnectWallet}
          >
            Disconnect
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
