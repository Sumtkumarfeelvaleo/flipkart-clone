"use client"

import { useState } from "react"
import { Share2, Facebook, Twitter, Instagram, MessageCircle, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

interface SocialSharingProps {
  productName: string
  productImage: string
  productUrl: string
  productPrice: string
}

export function SocialSharing({ productName, productImage, productUrl, productPrice }: SocialSharingProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const shareText = `Check out this amazing ${productName} for just ${productPrice}! 🛍️`
  const fullUrl = `${window.location.origin}${productUrl}`

  const shareOptions = [
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-blue-600",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}&quote=${encodeURIComponent(shareText)}`,
    },
    {
      name: "Twitter",
      icon: Twitter,
      color: "bg-sky-500",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(fullUrl)}`,
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-green-500",
      url: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${fullUrl}`)}`,
    },
    {
      name: "Instagram",
      icon: Instagram,
      color: "bg-gradient-to-r from-purple-500 to-pink-500",
      url: "#",
    },
  ]

  const handleShare = (url: string, platform: string) => {
    if (platform === "Instagram") {
      toast({
        title: "Instagram Sharing",
        description: "Copy the link and share it in your Instagram story or post!",
      })
      copyToClipboard()
      return
    }

    window.open(url, "_blank", "width=600,height=400")
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${fullUrl}`)
      setCopied(true)
      toast({
        title: "Link Copied!",
        description: "Product link has been copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: shareText,
          url: fullUrl,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share this product</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product Preview */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <img
              src={productImage || "/placeholder.svg"}
              alt={productName}
              className="w-12 h-12 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{productName}</p>
              <p className="text-sm text-gray-600">{productPrice}</p>
            </div>
          </div>

          {/* Social Media Options */}
          <div className="grid grid-cols-2 gap-3">
            {shareOptions.map((option) => (
              <Button
                key={option.name}
                variant="outline"
                className="h-12 flex flex-col gap-1"
                onClick={() => handleShare(option.url, option.name)}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${option.color}`}>
                  <option.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs">{option.name}</span>
              </Button>
            ))}
          </div>

          {/* Copy Link */}
          <Button variant="outline" className="w-full" onClick={copyToClipboard}>
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2 text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </>
            )}
          </Button>

          {/* Native Share (Mobile) */}
          {navigator.share && (
            <Button variant="default" className="w-full" onClick={handleNativeShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share via...
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
