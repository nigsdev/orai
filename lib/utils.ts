import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string) {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatAddressForMobile(address: string) {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatAddressForDesktop(address: string) {
  if (!address) return ''
  return address
}

export function formatAmount(amount: string, decimals: number = 18) {
  const num = parseFloat(amount)
  if (isNaN(num)) return '0'
  return num.toFixed(4)
}

export function getChainName(chainId: number) {
  const chains: Record<number, string> = {
    1: 'Ethereum',
    10: 'Optimism',
    11155420: 'OP Sepolia',
    137: 'Polygon',
    42161: 'Arbitrum',
    421614: 'Arbitrum Sepolia',
    8453: 'Base',
  }
  return chains[chainId] || `Chain ${chainId}`
}

export function getChainIcon(chainId: number) {
  const icons: Record<number, string> = {
    1: '🔷',
    10: '🔴',
    11155420: '🔴',
    137: '🟣',
    42161: '🔵',
    421614: '🔵',
    8453: '🔵',
  }
  return icons[chainId] || '⛓️'
}
