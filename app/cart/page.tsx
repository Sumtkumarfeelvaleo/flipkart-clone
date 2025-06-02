"use client"

import { useState, useEffect } from "react"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import Image from "next/image"

const mockProducts = {
  1: { id: 1, name: "iPhone 15 Pro", price: 999, image: "/placeholder.svg?height=100&width=100" },
  2: { id: 2, name: "Samsung Galaxy S24", price: 799, image: "/placeholder.svg?height=100&width=100" },
  3: { id: 3, name: "MacBook Air M3", price: 1099, image: "/placeholder.svg?height=100&width=100" },
  4: { id: 4, name: "Wireless Headphones", price: 199, image: "/placeholder.svg?height=100&width=100" },
  5: { id: 5, name: "Smart Watch", price: 299, image: "/placeholder.svg?height=100&width=100" },
}

interface CartItem {
  id: number
  quantity: number
  notes: string
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [promoCode, setPromoCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const [appliedPromo, setAppliedPromo] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      const cartIds = JSON.parse(savedCart)
      const itemCounts: { [key: number]: number } = {}

      cartIds.forEach((id: number) => {
        itemCounts[id] = (itemCounts[id] || 0) + 1
      })

      const items = Object.entries(itemCounts).map(([id, quantity]) => ({
        id: Number.parseInt(id),
        quantity,
        notes: "",
      }))

      setCartItems(items)
    }
  }, [])

  const updateCart = (newItems: CartItem[]) => {
    setCartItems(newItems)
    const cartIds: number[] = []
    newItems.forEach((item) => {
      for (let i = 0; i < item.quantity; i++) {
        cartIds.push(item.id)
      }
    })
    localStorage.setItem("cart", JSON.stringify(cartIds))
  }

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id)
      return
    }

    const newItems = cartItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
    updateCart(newItems)
  }

  const removeItem = (id: number) => {
    const newItems = cartItems.filter((item) => item.id !== id)
    updateCart(newItems)
    toast({
      title: "Item Removed",
      description: "Item has been removed from your cart",
    })
  }

  const updateNotes = (id: number, notes: string) => {
    const newItems = cartItems.map((item) => (item.id === id ? { ...item, notes } : item))
    setCartItems(newItems)
  }

  const applyPromoCode = () => {
    const validCodes = {
      SAVE10: 10,
      WELCOME20: 20,
      FIRST50: 50,
    }

    if (validCodes[promoCode as keyof typeof validCodes]) {
      setDiscount(validCodes[promoCode as keyof typeof validCodes])
      setAppliedPromo(promoCode)
      toast({
        title: "Promo Code Applied",
        description: `You saved $${validCodes[promoCode as keyof typeof validCodes]}!`,
      })
    } else {
      toast({
        title: "Invalid Promo Code",
        description: "Please enter a valid promo code",
        variant: "destructive",
      })
    }
    setPromoCode("")
  }

  const removePromoCode = () => {
    setDiscount(0)
    setAppliedPromo("")
    toast({
      title: "Promo Code Removed",
      description: "Promo code has been removed",
    })
  }

  const subtotal = cartItems.reduce((sum, item) => {
    const product = mockProducts[item.id as keyof typeof mockProducts]
    return sum + (product ? product.price * item.quantity : 0)
  }, 0)

  const shipping = subtotal > 500 ? 0 : 25
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax - discount

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-blue-600 text-white shadow-lg">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold">
                Flipkart
              </Link>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <ShoppingBag className="w-24 h-24 mx-auto text-gray-300 mb-6" />
            <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
            <Link href="/products">
              <Button size="lg">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold">
              Flipkart
            </Link>
            <Link href="/products">
              <Button variant="ghost" size="sm" className="text-white hover:bg-blue-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart ({cartItems.length} items)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const product = mockProducts[item.id as keyof typeof mockProducts]
              if (!product) return null

              return (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        width={100}
                        height={100}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                        <p className="text-2xl font-bold text-green-600 mb-4">${product.price}</p>

                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-12 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove
                          </Button>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">Add a note (optional):</label>
                          <Textarea
                            placeholder="e.g., gift wrap, special instructions..."
                            value={item.notes}
                            onChange={(e) => updateNotes(item.id, e.target.value)}
                            className="resize-none"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Promo Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Promo Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                {appliedPromo ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-800">{appliedPromo}</p>
                      <p className="text-sm text-green-600">-${discount}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={removePromoCode}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Input
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    />
                    <Button onClick={applyPromoCode} className="w-full">
                      Apply Code
                    </Button>
                    <div className="text-xs text-gray-500">
                      <p>Try: SAVE10, WELCOME20, FIRST50</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
                {shipping > 0 && (
                  <p className="text-sm text-gray-600">Add ${(500 - subtotal).toFixed(2)} more for free shipping!</p>
                )}
                <Link href="/checkout">
                  <Button className="w-full" size="lg">
                    Proceed to Checkout
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Security Badge */}
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-green-600 mb-2">🔒</div>
                <p className="text-sm text-gray-600">Your payment information is secure and encrypted</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
