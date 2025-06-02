"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

interface PaymentConfirmationProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  orderId: string
  userName?: string
  userInitials?: string
}

export function PaymentConfirmation({
  isOpen,
  onClose,
  amount,
  orderId,
  userName = "Sumit Kumar",
  userInitials = "SK",
}: PaymentConfirmationProps) {
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState("")
  const [batteryLevel, setBatteryLevel] = useState("7%")

  // Update current time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hours = now.getHours()
      const minutes = now.getMinutes()
      setCurrentTime(`${hours}:${minutes < 10 ? "0" : ""}${minutes}`)
    }

    updateTime()
    const interval = setInterval(updateTime, 60000)

    return () => clearInterval(interval)
  }, [])

  // Try to get battery level if supported
  useEffect(() => {
    if ("getBattery" in navigator) {
      const getBatteryInfo = async () => {
        try {
          // @ts-ignore - getBattery is not in the standard navigator type
          const battery = await navigator.getBattery()
          setBatteryLevel(`${Math.round(battery.level * 100)}%`)
        } catch (error) {
          console.log("Battery API not supported")
        }
      }
      getBatteryInfo()
    }
  }, [])

  const handleDismiss = () => {
    onClose()
    router.push("/order-success")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-[360px] rounded-none h-[100dvh] bg-black text-white">
        {/* Status bar */}
        <div className="flex justify-between items-center px-4 py-2 text-sm">
          <div>{currentTime} 👻</div>
          <div className="flex items-center gap-2">
            <span>5G+</span>
            <div className="w-5 h-3 relative">
              <div className="absolute inset-0 border border-white rounded-sm"></div>
              <div className="absolute left-0 top-0 bottom-0 w-1/4 bg-white rounded-sm"></div>
            </div>
            <span>{batteryLevel}</span>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center px-4 py-3 border-b border-gray-800">
          <Button variant="ghost" size="icon" className="text-white" onClick={onClose}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="text-xl ml-4">Pay</span>
          <div className="ml-auto">
            <HelpCircle className="h-5 w-5" />
          </div>
        </div>

        {/* User info */}
        <div className="px-4 py-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-pink-600 flex items-center justify-center text-xl font-medium">
            {userInitials}
          </div>
          <div className="text-xl">{userName}</div>
        </div>

        {/* Amount */}
        <div className="px-4 py-4">
          <div className="border border-gray-700 rounded p-4 text-3xl">₹ {amount}</div>
        </div>

        {/* Message */}
        <div className="px-4">
          <div className="border border-gray-700 rounded p-4">
            <div className="text-gray-400">Message</div>
            <div className="text-white">Order {orderId}</div>
          </div>
        </div>

        {/* Info text */}
        <div className="px-4 py-6 text-gray-400">
          On tapping Pay, money will be deducted from the selected payment mode.
        </div>

        {/* Bottom info */}
        <div className="mt-auto px-4 py-4 text-gray-400 text-sm border-t border-gray-800">
          You can pay up to ₹2,000 with QR codes via gallery. For more, pay with mobile number or scan QR code.
        </div>

        {/* Dismiss button */}
        <div className="px-4 py-4 border-t border-gray-800">
          <Button
            className="w-full bg-transparent hover:bg-transparent text-purple-500 hover:text-purple-400"
            onClick={handleDismiss}
          >
            DISMISS
          </Button>
        </div>

        {/* Bottom bar */}
        <div className="flex justify-center py-2">
          <div className="w-1/3 h-1 bg-gray-600 rounded-full"></div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
