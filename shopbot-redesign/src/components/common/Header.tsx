"use client"

import type React from "react"
import { ArrowLeft, Share2 } from "lucide-react"
import { Button } from "../ui/button"

interface HeaderProps {
  title: string
  showBackButton?: boolean
  showShareButton?: boolean
  onBackClick?: () => void
  onShareClick?: () => void
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  showShareButton = false,
  onBackClick,
  onShareClick,
}) => {
  return (
    <header className="bg-gradient-to-r from-teal-400 to-sky-400 p-4">
      <div className="flex items-center justify-between">
        {showBackButton ? (
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={onBackClick}>
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
        ) : (
          <div className="w-8"></div>
        )}

        <h1 className="text-lg font-bold text-white">{title}</h1>

        {showShareButton ? (
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={onShareClick}>
            <Share2 className="h-5 w-5" />
            <span className="sr-only">Share</span>
          </Button>
        ) : (
          <div className="w-8"></div>
        )}
      </div>
    </header>
  )
}

export default Header
