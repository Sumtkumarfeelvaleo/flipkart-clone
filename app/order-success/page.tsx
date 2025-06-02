"use client"

import { useEffect, useState } from "react"
import { CheckCircle, Package, Truck, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function OrderSuccessPage() {
  const [orderNumber] = useState(() => Math.random().toString(36).substr(2, 9).toUpperCase())
  const [estimatedDelivery] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() + 3)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  })

  useEffect(() => {
    // Confetti animation
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)

      // Create confetti effect
      if (typeof window !== "undefined" && (window as any).confetti) {
        ;(window as any).confetti(
          Object.assign({}, defaults, {
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          }),
        )
        ;(window as any).confetti(
          Object.assign({}, defaults, {
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          }),
        )
      }
    }, 250)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <Link href="/" className="text-2xl font-bold">
            Flipkart
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Animation */}
          <div className="mb-8">
            <div className="relative inline-block">
              <CheckCircle className="w-24 h-24 text-green-500 animate-pulse" />
              <div className="absolute inset-0 w-24 h-24 border-4 border-green-500 rounded-full animate-ping opacity-20"></div>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-green-600 mb-4">Order Placed Successfully!</h1>
          <p className="text-xl text-gray-600 mb-8">
            Thank you for your purchase. Your order has been confirmed and is being processed.
          </p>

          {/* Order Details */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Order Number:</span>
                <span className="text-blue-600 font-mono">#{orderNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Estimated Delivery:</span>
                <span className="text-green-600">{estimatedDelivery}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Order Status:</span>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">Processing</span>
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white mb-2">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium">Order Placed</span>
                  <span className="text-xs text-gray-500">Just now</span>
                </div>
                <div className="flex-1 h-1 bg-gray-200 mx-4">
                  <div className="h-full bg-yellow-400 w-1/3"></div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-white mb-2">
                    <Package className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium">Processing</span>
                  <span className="text-xs text-gray-500">1-2 days</span>
                </div>
                <div className="flex-1 h-1 bg-gray-200 mx-4"></div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 mb-2">
                    <Truck className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium">Shipped</span>
                  <span className="text-xs text-gray-500">2-3 days</span>
                </div>
                <div className="flex-1 h-1 bg-gray-200 mx-4"></div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 mb-2">
                    <Home className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium">Delivered</span>
                  <span className="text-xs text-gray-500">{estimatedDelivery}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" className="w-full sm:w-auto">
                Continue Shopping
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Track Order
            </Button>
            <Link href="/">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-12 p-6 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">What's Next?</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• You'll receive an email confirmation shortly</li>
              <li>• We'll send you tracking information once your order ships</li>
              <li>• You can track your order anytime in your account</li>
              <li>• Contact us if you have any questions about your order</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
