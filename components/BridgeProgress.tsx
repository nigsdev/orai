/**
 * Bridge Progress Component
 * 
 * Displays real-time progress for cross-chain bridge operations
 * Shows step-by-step progress, error states, and completion status
 */

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  ArrowRight, 
  RefreshCw,
  ExternalLink 
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProgressStep, PaymentState } from '@/types/avail'

interface BridgeProgressProps {
  paymentState: PaymentState
  onRetry?: () => void
  onClose?: () => void
  showDetails?: boolean
}

export function BridgeProgress({ 
  paymentState, 
  onRetry, 
  onClose, 
  showDetails = true 
}: BridgeProgressProps) {
  const [steps, setSteps] = useState<ProgressStep[]>([])
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  // Update steps when payment state changes
  useEffect(() => {
    if (paymentState.currentStep && paymentState.currentStep.typeID) {
      setSteps(prev => {
        const existingIndex = prev.findIndex(s => s.typeID === paymentState.currentStep?.typeID)
        if (existingIndex >= 0) {
          // Update existing step
          const updated = [...prev]
          updated[existingIndex] = { ...paymentState.currentStep, status: 'completed' } as ProgressStep
          return updated
        } else {
          // Add new step
          return [...prev, { ...paymentState.currentStep, status: 'completed' } as ProgressStep]
        }
      })
      setCurrentStepIndex(steps.length)
    }
  }, [paymentState.currentStep, steps.length])

  const getStepIcon = (step: ProgressStep, index: number) => {
    if (step.status === 'completed') {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    } else if (step.status === 'failed') {
      return <XCircle className="h-4 w-4 text-red-500" />
    } else if (index === currentStepIndex) {
      return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
    } else {
      return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStepDescription = (step: ProgressStep) => {
    const descriptions: Record<string, string> = {
      'APPROVE_TOKEN': 'Approving token for bridge',
      'INITIATE_BRIDGE': 'Initiating bridge transaction',
      'WAIT_CONFIRMATION': 'Waiting for confirmation',
      'EXECUTE_BRIDGE': 'Executing bridge on destination',
      'COMPLETE_BRIDGE': 'Bridge completed successfully'
    }
    return descriptions[step.typeID] || step.typeID
  }

  const getStatusBadge = () => {
    if (paymentState.error) {
      return <Badge variant="destructive">Failed</Badge>
    } else if (paymentState.isProcessing) {
      return <Badge variant="default">Processing</Badge>
    } else if (paymentState.progress === 100) {
      return <Badge variant="default" className="bg-green-500">Completed</Badge>
    } else {
      return <Badge variant="secondary">Pending</Badge>
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Bridge Progress</CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{paymentState.progress}%</span>
          </div>
          <Progress value={paymentState.progress} className="h-2" />
        </div>

        {/* Error State */}
        {paymentState.error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center gap-2 text-red-700">
              <XCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Error</span>
            </div>
            <p className="text-sm text-red-600 mt-1">{paymentState.error}</p>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="mt-2 text-red-600 border-red-300 hover:bg-red-50"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            )}
          </motion.div>
        )}

        {/* Success State */}
        {paymentState.progress === 100 && !paymentState.error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-green-50 border border-green-200 rounded-lg"
          >
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Bridge Completed</span>
            </div>
            {paymentState.transactionHash && (
              <div className="mt-2">
                <p className="text-xs text-green-600 mb-1">Transaction Hash:</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-green-100 px-2 py-1 rounded">
                    {paymentState.transactionHash.slice(0, 10)}...
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => window.open(`https://etherscan.io/tx/${paymentState.transactionHash}`, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Steps */}
        {showDetails && steps.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Steps</h4>
            <div className="space-y-2">
              <AnimatePresence>
                {steps.map((step, index) => (
                  <motion.div
                    key={step.typeID}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-3 p-2 rounded-lg bg-gray-50"
                  >
                    {getStepIcon(step, index)}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{getStepDescription(step)}</p>
                      {step.data && (
                        <p className="text-xs text-gray-500">{JSON.stringify(step.data)}</p>
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {onClose && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="flex-1"
            >
              Close
            </Button>
          )}
          {paymentState.progress === 100 && paymentState.transactionHash && (
            <Button
              variant="default"
              size="sm"
              onClick={() => window.open(`https://etherscan.io/tx/${paymentState.transactionHash}`, '_blank')}
              className="flex-1"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View Transaction
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
