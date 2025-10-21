import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date | string
  transactionHash?: string
  chainId?: number
  status?: 'pending' | 'success' | 'failed'
  metadata?: {
    type: 'transfer' | 'analytics' | 'stake' | 'swap' | 'bridge'
    amount?: string
    token?: string
    fromChain?: string
    toChain?: string
  }
}

export interface WalletState {
  address: string | null
  chainId: number | null
  balance: string | null
  isConnected: boolean
}

interface ChatState {
  messages: Message[]
  isLoading: boolean
  wallet: WalletState
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void
  updateMessage: (id: string, updates: Partial<Message>) => void
  setLoading: (loading: boolean) => void
  setWallet: (wallet: Partial<WalletState>) => void
  clearMessages: () => void
  resetChat: () => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [
        {
          id: '1',
          content: 'Welcome to Orai! I can help you with cross-chain transactions, wallet analytics, and DeFi operations. Try asking me to send tokens, check your transaction history, or stake your assets.',
          role: 'assistant',
          timestamp: new Date(),
        },
      ],
      isLoading: false,
      wallet: {
        address: null,
        chainId: null,
        balance: null,
        isConnected: false,
      },
      addMessage: (message) => {
        const newMessage: Message = {
          ...message,
          id: Date.now().toString(),
          timestamp: new Date(),
        }
        set((state) => ({
          messages: [...state.messages, newMessage],
        }))
      },
      updateMessage: (id, updates) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, ...updates } : msg
          ),
        }))
      },
      setLoading: (loading) => set({ isLoading: loading }),
      setWallet: (wallet) =>
        set((state) => ({
          wallet: { ...state.wallet, ...wallet },
        })),
      clearMessages: () =>
        set({
          messages: [
            {
              id: '1',
              content: 'Welcome to Orai! I can help you with cross-chain transactions, wallet analytics, and DeFi operations. Try asking me to send tokens, check your transaction history, or stake your assets.',
              role: 'assistant',
              timestamp: new Date(),
            },
          ],
        }),
      resetChat: () => {
        // Clear localStorage and reset to initial state
        localStorage.removeItem('orai-chat-storage')
        set({
          messages: [
            {
              id: '1',
              content: 'Welcome to Orai! I can help you with cross-chain transactions, wallet analytics, and DeFi operations. Try asking me to send tokens, check your transaction history, or stake your assets.',
              role: 'assistant',
              timestamp: new Date(),
            },
          ],
          isLoading: false,
          wallet: {
            address: null,
            chainId: null,
            balance: null,
            isConnected: false,
          },
        })
      },
    }),
    {
      name: 'orai-chat-storage',
      partialize: (state) => ({
        wallet: state.wallet,
        // Don't persist messages - always start fresh
      }),
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          if (!str) return null
          const parsed = JSON.parse(str)
          // Convert timestamp strings back to Date objects
          if (parsed.state?.messages) {
            parsed.state.messages = parsed.state.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          }
          return parsed
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => {
          localStorage.removeItem(name)
        },
      },
    }
  )
)
