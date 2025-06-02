"use client"

import { useState, useEffect } from "react"
import { QrCode, Smartphone, Copy, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface UPIPaymentProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  orderId: string
  onSuccess: () => void
}

export function UPIPayment({ isOpen, onClose, amount, orderId, onSuccess }: UPIPaymentProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [selectedApp, setSelectedApp] = useState<string | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [upiId] = useState("sumitk7593@fifederal") // UPI ID for payments
  const [copied, setCopied] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "processing" | "success" | "failed">("pending")
  const [countdown, setCountdown] = useState(180) // 3 minutes countdown
  const { toast } = useToast()

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth <= 768 ||
          /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      )
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    if (isOpen) {
      // Reset states
      setPaymentStatus("pending")
      setSelectedApp(null)
      setCountdown(180)

      // Generate UPI payment string with proper encoding
      const upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=Flipkart&am=${amount}&cu=INR&tn=${encodeURIComponent(`Order ${orderId}`)}`

      // Generate QR code URL (using a QR code API)
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`
      setQrCodeUrl(qrUrl)
    }
  }, [isOpen, amount, orderId, upiId])

  // Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null

    if (isOpen && paymentStatus === "pending" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isOpen, paymentStatus, countdown])

  // Format countdown time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const paymentApps = [
    {
      name: "PhonePe",
      icon: "/placeholder.svg?height=48&width=48",
      color: "bg-purple-100",
      scheme: "phonepe://",
      fallback: "https://play.google.com/store/apps/details?id=com.phonepe.app",
    },
    {
      name: "Google Pay",
      icon: "/placeholder.svg?height=48&width=48",
      color: "bg-blue-100",
      scheme: "gpay://",
      fallback: "https://play.google.com/store/apps/details?id=com.google.android.apps.nbu.paisa.user",
    },
    {
      name: "Paytm",
      icon: "/placeholder.svg?height=48&width=48",
      color: "bg-blue-100",
      scheme: "paytmmp://",
      fallback: "https://play.google.com/store/apps/details?id=net.one97.paytm",
    },
    {
      name: "BHIM",
      icon: "/placeholder.svg?height=48&width=48",
      color: "bg-orange-100",
      scheme: "bhim://",
      fallback: "https://play.google.com/store/apps/details?id=in.org.npci.upiapp",
    },
    {
      name: "Amazon Pay",
      icon: "/placeholder.svg?height=48&width=48",
      color: "bg-yellow-100",
      scheme: "amazonpay://",
      fallback: "https://play.google.com/store/apps/details?id=com.amazon.mShop.android.shopping",
    },
  ]

  const handleAppPayment = (app: (typeof paymentApps)[0]) => {
    setSelectedApp(app.name)
    setPaymentStatus("processing")

    // Create a proper UPI intent URL
    const upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=Flipkart&am=${amount}&cu=INR&tn=${encodeURIComponent(`Order ${orderId}`)}`

    // Try to open the app with proper intent
    try {
      // For mobile devices
      window.location.href = upiString

      // Set a timeout to check if the app opened
      setTimeout(() => {
        // If we're still here after 2 seconds, the app probably didn't open
        if (document.visibilityState !== "hidden") {
          toast({
            title: `${app.name} not installed`,
            description: "Would you like to install it?",
            action: (
              <Button variant="outline" size="sm" onClick={() => window.open(app.fallback, "_blank")}>
                Install
              </Button>
            ),
          })
        }
      }, 2000)
    } catch (error) {
      console.error("Failed to open payment app:", error)
      toast({
        title: "Failed to open payment app",
        description: "Please try another payment method",
        variant: "destructive",
      })
    }

    // For demo purposes only - simulate payment success
    setTimeout(() => {
      setPaymentStatus("success")
      toast({
        title: "Payment Successful! 🎉",
        description: `Payment of ₹${amount.toLocaleString("en-IN")} completed via ${app.name}`,
      })

      // Wait 1.5 seconds to show success state before closing
      setTimeout(() => {
        onSuccess()
      }, 1500)
    }, 5000)
  }

  const copyUPIId = () => {
    navigator.clipboard.writeText(upiId)
    setCopied(true)
    toast({
      title: "UPI ID Copied",
      description: "UPI ID has been copied to clipboard",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleQRPayment = () => {
    setPaymentStatus("processing")

    // Simulate QR code payment success
    setTimeout(() => {
      setPaymentStatus("success")
      toast({
        title: "Payment Successful! 🎉",
        description: `Payment of ₹${amount.toLocaleString("en-IN")} completed via UPI`,
      })

      // Wait 1.5 seconds to show success state before closing
      setTimeout(() => {
        onSuccess()
      }, 1500)
    }, 3000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            UPI Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Amount */}
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Amount to Pay</p>
            <p className="text-2xl font-bold text-blue-600">₹{amount.toLocaleString("en-IN")}</p>
            <p className="text-xs text-gray-500">Order ID: {orderId}</p>
            {paymentStatus === "pending" && (
              <div className="mt-2 text-sm text-orange-600 flex items-center justify-center gap-1">
                <span className="inline-block w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                Payment expires in {formatTime(countdown)}
              </div>
            )}
          </div>

          {paymentStatus === "pending" && (
            <>
              {isMobile ? (
                /* Mobile: Show payment apps */
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Choose Payment App
                  </h3>

                  <div className="grid grid-cols-3 gap-3">
                    {paymentApps.map((app) => (
                      <Button
                        key={app.name}
                        variant="outline"
                        className="h-24 flex flex-col gap-1 p-2"
                        onClick={() => handleAppPayment(app)}
                      >
                        <div className={`w-10 h-10 rounded-full ${app.color} flex items-center justify-center`}>
                          <Image src={app.icon || "/placeholder.svg"} alt={app.name} width={24} height={24} />
                        </div>
                        <span className="text-xs">{app.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Desktop: Show QR Code */
                <div className="space-y-4">
                  <h3 className="font-semibold text-center">Scan QR Code to Pay</h3>

                  <div className="flex justify-center">
                    <Card className="p-4 border-2 border-blue-100">
                      <div className="text-center space-y-3">
                        {qrCodeUrl && (
                          <div className="relative">
                            <Image
                              src={qrCodeUrl || "/placeholder.svg"}
                              alt="UPI QR Code"
                              width={200}
                              height={200}
                              className="mx-auto border rounded-lg"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="bg-white p-2 rounded-full shadow-md">
                                <Image
                                  src="/placeholder.svg?height=40&width=40"
                                  alt="Flipkart"
                                  width={40}
                                  height={40}
                                  className="w-8 h-8"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        <p className="text-sm text-gray-600">Scan with any UPI app to pay</p>
                      </div>
                    </Card>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Or pay directly to UPI ID:</p>
                    <div className="flex items-center justify-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <span className="font-mono text-sm">{upiId}</span>
                      <Button variant="ghost" size="sm" onClick={copyUPIId} className="h-6 w-6 p-0">
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                  </div>

                  <Button onClick={handleQRPayment} className="w-full">
                    I have completed the payment
                  </Button>
                </div>
              )}

              {/* Payment Apps for Desktop (as alternative) */}
              {!isMobile && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-3">Or use UPI apps on mobile:</h4>
                  <div className="flex gap-2 justify-center">
                    {paymentApps.slice(0, 3).map((app) => (
                      <Button
                        key={app.name}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => handleAppPayment(app)}
                      >
                        <div className={`w-5 h-5 rounded-full ${app.color} flex items-center justify-center`}>
                          <Image src={app.icon || "/placeholder.svg"} alt={app.name} width={12} height={12} />
                        </div>
                        <span className="text-xs">{app.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {paymentStatus === "processing" && (
            <div className="py-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium mb-2">Processing Payment</h3>
              <p className="text-gray-600">Please complete the payment in your UPI app</p>
              <p className="text-gray-600">Do not close this window</p>
            </div>
          )}

          {paymentStatus === "success" && (
            <div className="py-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-green-600 mb-2">Payment Successful!</h3>
              <p className="text-gray-600">Your order has been placed successfully</p>
              <p className="text-gray-600">Redirecting to order confirmation...</p>
            </div>
          )}

          {/* Cancel Button */}
          {paymentStatus === "pending" && (
            <Button variant="outline" onClick={onClose} className="w-full">
              <X className="w-4 h-4 mr-2" />
              Cancel Payment
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
