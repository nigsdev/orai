"use client"

import { Menu, X } from "lucide-react"
import { IconButton } from "@/components/ui/icon-button"

interface MobileMenuButtonProps {
  isOpen: boolean
  onToggle: () => void
}

export function MobileMenuButton({ isOpen, onToggle }: MobileMenuButtonProps) {
  return (
    <IconButton
      icon={isOpen ? X : Menu}
      variant="glass"
      size="md"
      onClick={onToggle}
      className="md:hidden fixed top-4 left-4 z-50"
    />
  )
}
