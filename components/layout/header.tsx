"use client"

import { useState, useEffect, useRef } from "react"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Bell, ChevronDown, Wallet, LogOut, Copy, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { useChatStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { formatAddress } from "@/lib/utils"

export function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedNetwork, setSelectedNetwork] = useState("Ethereum")
  const [hasNotifications, setHasNotifications] = useState(true)
  const [isMetaMaskAvailable, setIsMetaMaskAvailable] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const walletDropdownRef = useRef<HTMLDivElement>(null)
  
  const { wallet, setWallet } = useChatStore()
  const { toast } = useToast()

  const networks = [
    { name: "Ethereum", symbol: "ETH", chainId: 1 },
    { name: "Optimism", symbol: "OP", chainId: 10 },
    { name: "OP Sepolia", symbol: "ETH", chainId: 11155420 },
    { name: "Polygon", symbol: "MATIC", chainId: 137 },
    { name: "Arbitrum", symbol: "ARB", chainId: 42161 },
    { name: "Arbitrum Sepolia", symbol: "ETH", chainId: 421614 },
    { name: "Base", symbol: "BASE", chainId: 8453 },
  ]

  // Check if we're on the client side and MetaMask availability
  useEffect(() => {
    setIsClient(true)
    const isAvailable = typeof window !== 'undefined' && !!window.ethereum
    setIsMetaMaskAvailable(isAvailable)
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
      if (walletDropdownRef.current && !walletDropdownRef.current.contains(event.target as Node)) {
        setIsWalletDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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
        const newChainId = parseInt(chainId, 16)
        setWallet({
          chainId: newChainId,
        })
        
        // Update the selected network in UI to match the actual chain
        const network = networks.find(n => n.chainId === newChainId)
        if (network) {
          setSelectedNetwork(network.name)
        }
      }

      window.ethereum?.on('accountsChanged', handleAccountsChanged)
      window.ethereum?.on('chainChanged', handleChainChanged)

      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum?.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [isMetaMaskAvailable, setWallet])

  // Update selected network when wallet chain changes
  useEffect(() => {
    if (wallet.chainId) {
      const network = networks.find(n => n.chainId === wallet.chainId)
      if (network) {
        setSelectedNetwork(network.name)
      }
    }
  }, [wallet.chainId])

  const connectWallet = async () => {
    try {
      if (!isMetaMaskAvailable) {
        toast({
          title: 'MetaMask Not Found',
          description: 'Please install MetaMask browser extension',
          variant: 'destructive',
        })
        window.open('https://metamask.io/download/', '_blank')
        return
      }

      console.log('Attempting to connect to MetaMask...')

      // Request account access
      const accounts = await window.ethereum?.request({
        method: 'eth_requestAccounts',
      })

      console.log('Accounts received:', accounts)

      if (accounts && accounts.length > 0) {
        const address = accounts[0]
        
        // Get chain ID
        const chainId = await window.ethereum?.request({ method: 'eth_chainId' })
        
        console.log('Chain ID:', chainId)
        
        setWallet({
          address,
          isConnected: true,
          chainId: chainId ? parseInt(chainId, 16) : null,
        })

        toast({
          title: 'Wallet Connected',
          description: `Successfully connected to MetaMask on Chain ID: ${chainId ? parseInt(chainId, 16) : 'Unknown'}`,
        })
      }
    } catch (error) {
      console.error('MetaMask connection error:', error)
      toast({
        title: 'Connection Failed',
        description: `Failed to connect to MetaMask: ${error instanceof Error ? error.message : 'Please try again.'}`,
        variant: 'destructive',
      })
    }
  }

  const disconnectWallet = () => {
    setWallet({
      address: null,
      isConnected: false,
      chainId: null,
      balance: null,
    })
    setIsWalletDropdownOpen(false)
    toast({
      title: 'Wallet Disconnected',
      description: 'Successfully disconnected your wallet.',
    })
  }

  const copyAddress = () => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address)
      toast({
        title: 'Address Copied',
        description: 'Wallet address copied to clipboard.',
      })
    }
  }

  const switchChain = async (targetChainId: number) => {
    if (!isMetaMaskAvailable) {
      toast({
        title: 'MetaMask Not Available',
        description: 'Please install MetaMask to switch networks.',
        variant: 'destructive',
      })
      return
    }

    try {
      // Check if the chain is already connected
      const currentChainId = await window.ethereum?.request({ method: 'eth_chainId' })
      const currentChainIdNumber = parseInt(currentChainId, 16)
      
      if (currentChainIdNumber === targetChainId) {
        toast({
          title: 'Already Connected',
          description: `You're already connected to ${networks.find(n => n.chainId === targetChainId)?.name}`,
        })
        return
      }

      // Try to switch to the target chain
      await window.ethereum?.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      })

      // Update the selected network in UI
      const targetNetwork = networks.find(n => n.chainId === targetChainId)
      if (targetNetwork) {
        setSelectedNetwork(targetNetwork.name)
      }

      toast({
        title: 'Network Switched',
        description: `Successfully switched to ${targetNetwork?.name}`,
      })

    } catch (error: any) {
      // If the chain is not added to MetaMask, try to add it
      if (error.code === 4902) {
        try {
          await addChainToMetaMask(targetChainId)
        } catch (addError) {
          console.error('Error adding chain:', addError)
          toast({
            title: 'Failed to Add Network',
            description: `Could not add ${networks.find(n => n.chainId === targetChainId)?.name} to MetaMask.`,
            variant: 'destructive',
          })
        }
      } else {
        console.error('Error switching chain:', error)
        toast({
          title: 'Failed to Switch Network',
          description: `Could not switch to ${networks.find(n => n.chainId === targetChainId)?.name}.`,
          variant: 'destructive',
        })
      }
    }
  }

  const addChainToMetaMask = async (chainId: number) => {
    const chainConfigs: Record<number, any> = {
      1: {
        chainId: '0x1',
        chainName: 'Ethereum Mainnet',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://mainnet.infura.io/v3/'],
        blockExplorerUrls: ['https://etherscan.io']
      },
      10: {
        chainId: '0xa',
        chainName: 'Optimism',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://mainnet.optimism.io'],
        blockExplorerUrls: ['https://optimistic.etherscan.io']
      },
      11155420: {
        chainId: '0xaa37dc',
        chainName: 'OP Sepolia',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://sepolia.optimism.io'],
        blockExplorerUrls: ['https://sepolia-optimism.etherscan.io']
      },
      137: {
        chainId: '0x89',
        chainName: 'Polygon',
        nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
        rpcUrls: ['https://polygon-rpc.com'],
        blockExplorerUrls: ['https://polygonscan.com']
      },
      42161: {
        chainId: '0xa4b1',
        chainName: 'Arbitrum One',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://arb1.arbitrum.io/rpc'],
        blockExplorerUrls: ['https://arbiscan.io']
      },
      421614: {
        chainId: '0x66eee',
        chainName: 'Arbitrum Sepolia',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://sepolia-rollup.arbitrum.io/rpc'],
        blockExplorerUrls: ['https://sepolia.arbiscan.io']
      },
      8453: {
        chainId: '0x2105',
        chainName: 'Base',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://mainnet.base.org'],
        blockExplorerUrls: ['https://basescan.org']
      }
    }

    const config = chainConfigs[chainId]
    if (!config) {
      throw new Error(`Chain configuration not found for chain ID ${chainId}`)
    }

    await window.ethereum?.request({
      method: 'wallet_addEthereumChain',
      params: [config],
    })

    // Update the selected network in UI
    const targetNetwork = networks.find(n => n.chainId === chainId)
    if (targetNetwork) {
      setSelectedNetwork(targetNetwork.name)
    }

    toast({
      title: 'Network Added',
      description: `Successfully added ${targetNetwork?.name} to MetaMask`,
    })
  }

  const getExplorerUrl = () => {
    if (!wallet.address || !wallet.chainId) return null
    
    const explorers: Record<number, string> = {
      1: 'https://etherscan.io/address/',
      10: 'https://optimistic.etherscan.io/address/',
      11155420: 'https://sepolia-optimism.etherscan.io/address/',
      137: 'https://polygonscan.com/address/',
      42161: 'https://arbiscan.io/address/',
      8453: 'https://basescan.io/address/',
    }
    
    return explorers[wallet.chainId] + wallet.address
  }

  const getChainName = (chainId: number): string => {
    const chains: Record<number, string> = {
      1: 'Ethereum',
      10: 'Optimism',
      11155420: 'OP Sepolia',
      137: 'Polygon',
      42161: 'Arbitrum',
      8453: 'Base',
    }
    return chains[chainId] || `Chain ${chainId}`
  }

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 z-30 glass-header">
      <div className="container flex h-16 max-w-screen-2xl items-center px-4 md:px-6">
        <div className="mr-4 hidden md:flex">
          <a className="mr-6 flex items-center space-x-2" href="/">
            <span className="hidden font-bold sm:inline-block text-white">
              Dashboard
            </span>
          </a>
        </div>
        
        {/* Right-aligned items */}
        <div className="flex flex-1 items-center justify-end space-x-2 md:space-x-4">
          {/* Network Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-lg floating-glass text-white hover:glow-accent-hover transition-all duration-300"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="font-medium text-sm md:text-base hidden sm:inline">{selectedNetwork}</span>
              <span className="font-medium text-sm md:text-base sm:hidden">ETH</span>
              <ChevronDown className={cn(
                "h-3 w-3 md:h-4 md:w-4 transition-transform duration-300",
                isDropdownOpen && "rotate-180"
              )} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="dropdown-card absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden z-50">
                {networks.map((network) => (
                  <button
                    key={network.name}
                    onClick={async () => {
                      setIsDropdownOpen(false)
                      await switchChain(network.chainId)
                    }}
                    className={cn(
                      "w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-all duration-300 flex items-center gap-3",
                      selectedNetwork === network.name && "bg-accent-blue-500/30 text-accent-blue-500"
                    )}
                  >
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <div>
                      <div className="font-medium">{network.name}</div>
                      <div className="text-xs text-gray-400">{network.symbol}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <button className="relative p-1.5 md:p-2 rounded-lg floating-glass text-white hover:glow-accent-hover transition-all duration-300">
            <Bell className="h-4 w-4 md:h-5 md:w-5" />
            {hasNotifications && (
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 md:w-3 md:h-3 bg-red-500 rounded-full animate-pulse"></div>
            )}
          </button>

          {/* Connect Wallet Button */}
          <div className="relative" ref={walletDropdownRef}>
            {!wallet.isConnected ? (
              <button 
                onClick={connectWallet}
                className="neon-button group relative px-3 md:px-6 py-2 rounded-lg font-medium text-white transition-all duration-300 overflow-hidden"
              >
                {/* Button content */}
                <div className="relative flex items-center gap-1 md:gap-2 z-10">
                  <Wallet className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="text-sm md:text-base hidden sm:inline">Connect Wallet</span>
                  <span className="text-sm md:text-base sm:hidden">Connect</span>
                </div>
              </button>
            ) : (
              <button
                onClick={() => setIsWalletDropdownOpen(!isWalletDropdownOpen)}
                className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-lg floating-glass text-white hover:glow-accent-hover transition-all duration-300"
              >
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="font-medium text-sm md:text-base hidden sm:inline">{formatAddress(wallet.address || '')}</span>
                <span className="font-medium text-sm md:text-base sm:hidden">{formatAddress(wallet.address || '').slice(0, 6)}</span>
                <ChevronDown className={cn(
                  "h-3 w-3 md:h-4 md:w-4 transition-transform duration-300",
                  isWalletDropdownOpen && "rotate-180"
                )} />
              </button>
            )}

            {/* Wallet Dropdown Menu */}
            {isWalletDropdownOpen && wallet.isConnected && (
              <div className="dropdown-card absolute right-0 top-full mt-2 w-64 rounded-xl overflow-hidden z-50">
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Wallet className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Connected</div>
                      <div className="text-gray-400 text-sm">{formatAddress(wallet.address || '')}</div>
                    </div>
                  </div>
                </div>
                
                <div className="p-2">
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <span className="text-gray-300 text-sm">Network</span>
                    <span className="text-white text-sm">{getChainName(wallet.chainId || 1)}</span>
                  </div>
                  
                  <button
                    onClick={copyAddress}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors text-left"
                  >
                    <Copy className="w-4 h-4 text-gray-400" />
                    <span className="text-white text-sm">Copy Address</span>
                  </button>
                  
                  {getExplorerUrl() && (
                    <button
                      onClick={() => {
                        const url = getExplorerUrl()
                        if (url) window.open(url, '_blank')
                      }}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors text-left"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                      <span className="text-white text-sm">View on Explorer</span>
                    </button>
                  )}
                  
                  <button
                    onClick={disconnectWallet}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-red-500/10 transition-colors text-left text-red-400"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Disconnect</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
