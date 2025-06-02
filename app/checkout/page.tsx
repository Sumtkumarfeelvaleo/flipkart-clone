"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { UPIPayment } from "@/components/upi-payment"
import { PaymentConfirmation } from "@/components/payment-confirmation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Minus,
  Plus,
  Trash2,
  MapPin,
  CreditCard,
  PlusIcon,
  Check,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Clock,
} from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"

interface Product {
  id: string
  name: string
  price: number
  image: string
  quantity: number
}

interface Address {
  id: string
  name: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
  type: "home" | "work" | "other"
}

const safeCalculateSubtotal = (products: Product[]): number => {
  if (!Array.isArray(products) || products.length === 0) return 0
  return products.reduce((sum, product) => {
    if (!product || typeof product.price !== "number" || typeof product.quantity !== "number") return sum
    return sum + product.price * product.quantity
  }, 0)
}

const safeFormatPrice = (price: number | undefined | null): string => {
  if (typeof price !== "number" || isNaN(price)) return "₹0"
  return `₹${Math.round(price).toLocaleString("en-IN")}`
}

export default function CheckoutPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string>("")
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState(1) // 1: Address, 2: Payment, 3: Review
  const [paymentMethod, setPaymentMethod] = useState("upi")
  const [isUPIOpen, setIsUPIOpen] = useState(false)
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)
  const [orderId, setOrderId] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    type: "home" as "home" | "work" | "other",
  })

  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  })

  useEffect(() => {
    // Load cart and addresses from localStorage
    const loadData = () => {
      try {
        // Load cart
        const cartData = localStorage.getItem("cart")
        if (cartData) {
          setProducts(JSON.parse(cartData))
        }

        // Load addresses
        const addressData = localStorage.getItem("addresses")
        if (addressData) {
          const savedAddresses = JSON.parse(addressData)
          setAddresses(savedAddresses)
          // Set default address if available
          const defaultAddr = savedAddresses.find((addr: Address) => addr.isDefault)
          if (defaultAddr) {
            setSelectedAddress(defaultAddr.id)
          }
        }
      } catch (error) {
        console.error("Failed to load data:", error)
      }
    }

    loadData()
  }, [])

  // Save addresses to localStorage
  const saveAddresses = (addressList: Address[]) => {
    localStorage.setItem("addresses", JSON.stringify(addressList))
  }

  // Calculate subtotal
  const subtotal = safeCalculateSubtotal(products)
  const shipping = subtotal > 2000 ? 0 : 100
  const tax = Math.round(subtotal * 0.18)
  const total = subtotal + shipping + tax

  // Handle quantity change
  const updateQuantity = (id: string, change: number) => {
    setProducts((prevProducts) => {
      const updatedProducts = prevProducts
        .map((product) => {
          if (product.id === id) {
            const newQuantity = Math.max(0, product.quantity + change)
            if (newQuantity === 0) {
              toast({
                title: "Item removed",
                description: `${product.name} has been removed from your cart`,
              })
              return null
            }
            return { ...product, quantity: newQuantity }
          }
          return product
        })
        .filter(Boolean) as Product[]

      if (updatedProducts.length === 0) {
        localStorage.removeItem("cart")
        setTimeout(() => router.push("/products"), 1500)
      }

      return updatedProducts
    })
  }

  // Remove product
  const removeProduct = (id: string) => {
    const productToRemove = products.find((p) => p.id === id)
    setProducts((prevProducts) => {
      const updatedProducts = prevProducts.filter((product) => product.id !== id)
      if (updatedProducts.length === 0) {
        localStorage.removeItem("cart")
        setTimeout(() => router.push("/products"), 1500)
      }
      return updatedProducts
    })

    if (productToRemove) {
      toast({
        title: "Item removed",
        description: `${productToRemove.name} has been removed from your cart`,
      })
    }
  }

  // Add new address
  const handleAddAddress = () => {
    if (
      !newAddress.name ||
      !newAddress.phone ||
      !newAddress.address ||
      !newAddress.city ||
      !newAddress.state ||
      !newAddress.pincode
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const address: Address = {
      id: Date.now().toString(),
      ...newAddress,
      isDefault: addresses.length === 0,
    }

    const updatedAddresses = [...addresses, address]
    setAddresses(updatedAddresses)
    saveAddresses(updatedAddresses)
    setSelectedAddress(address.id)
    setShowAddAddress(false)
    setNewAddress({
      name: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      type: "home",
    })

    toast({
      title: "Address Added",
      description: "Your delivery address has been saved successfully",
    })
  }

  // Delete address
  const deleteAddress = (id: string) => {
    const updatedAddresses = addresses.filter((addr) => addr.id !== id)
    setAddresses(updatedAddresses)
    saveAddresses(updatedAddresses)

    if (selectedAddress === id && updatedAddresses.length > 0) {
      setSelectedAddress(updatedAddresses[0].id)
    }

    toast({
      title: "Address Deleted",
      description: "Address has been removed successfully",
    })
  }

  // Proceed to next step
  const handleNextStep = () => {
    if (checkoutStep === 1) {
      if (!selectedAddress) {
        toast({
          title: "Address Required",
          description: "Please select or add a delivery address",
          variant: "destructive",
        })
        return
      }
      setCheckoutStep(2)
    } else if (checkoutStep === 2) {
      setCheckoutStep(3)
    }
  }

  // Handle payment
  const handlePayment = () => {
    setIsProcessing(true)
    const newOrderId = `ORD${Math.floor(Math.random() * 10000000000000)}`
    setOrderId(newOrderId)

    if (paymentMethod === "upi") {
      setIsUPIOpen(true)
    } else {
      // Simulate card payment
      setTimeout(() => {
        setIsProcessing(false)
        setIsConfirmationOpen(true)
        localStorage.removeItem("cart")
        setProducts([])
      }, 3000)
    }
  }

  const handlePaymentSuccess = () => {
    setIsUPIOpen(false)
    setIsConfirmationOpen(true)
    localStorage.removeItem("cart")
    setProducts([])
  }

  const handleConfirmationClose = () => {
    setIsConfirmationOpen(false)
    router.push("/order-success")
  }

  if (!products || products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
            <p className="mb-6">Looks like you haven't added anything to your cart yet.</p>
            <Button onClick={() => router.push("/products")}>Continue Shopping</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Add Navbar */}
      <Navbar />

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Secure Checkout</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>100% Secure</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center space-x-8">
            {[
              { step: 1, title: "Address", icon: MapPin },
              { step: 2, title: "Payment", icon: CreditCard },
              { step: 3, title: "Review", icon: Check },
            ].map(({ step, title, icon: Icon }) => (
              <div key={step} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    checkoutStep >= step ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300 text-gray-400"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${checkoutStep >= step ? "text-blue-600" : "text-gray-400"}`}
                >
                  {title}
                </span>
                {step < 3 && (
                  <div className={`w-16 h-0.5 ml-4 ${checkoutStep > step ? "bg-blue-600" : "bg-gray-300"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Address Selection */}
            {checkoutStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {addresses.length > 0 && (
                    <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                          <div className="flex-1">
                            <label htmlFor={address.id} className="cursor-pointer">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{address.name}</span>
                                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full capitalize">
                                    {address.type}
                                  </span>
                                  {address.isDefault && (
                                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    deleteAddress(address.id)
                                  }}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                              <p className="text-gray-600 text-sm mb-1">
                                {address.address}, {address.city}, {address.state} - {address.pincode}
                              </p>
                              <p className="text-gray-600 text-sm">Phone: {address.phone}</p>
                            </label>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {!showAddAddress ? (
                    <Button
                      variant="outline"
                      className="w-full border-dashed border-2 py-8"
                      onClick={() => setShowAddAddress(true)}
                    >
                      <PlusIcon className="w-5 h-5 mr-2" />
                      Add New Address
                    </Button>
                  ) : (
                    <div className="p-6 border rounded-lg bg-gray-50 space-y-4">
                      <h3 className="font-medium">Add New Address</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Full Name*</Label>
                          <Input
                            id="name"
                            value={newAddress.name}
                            onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                            placeholder="Enter full name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number*</Label>
                          <Input
                            id="phone"
                            value={newAddress.phone}
                            onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                            placeholder="Enter 10-digit number"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="address">Address*</Label>
                        <Input
                          id="address"
                          value={newAddress.address}
                          onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                          placeholder="House no, Building, Street, Area"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="city">City*</Label>
                          <Input
                            id="city"
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                            placeholder="City"
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State*</Label>
                          <Input
                            id="state"
                            value={newAddress.state}
                            onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                            placeholder="State"
                          />
                        </div>
                        <div>
                          <Label htmlFor="pincode">PIN Code*</Label>
                          <Input
                            id="pincode"
                            value={newAddress.pincode}
                            onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                            placeholder="6-digit PIN"
                            maxLength={6}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Address Type</Label>
                        <RadioGroup
                          value={newAddress.type}
                          onValueChange={(value) =>
                            setNewAddress({ ...newAddress, type: value as "home" | "work" | "other" })
                          }
                          className="flex space-x-6 mt-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="home" id="home" />
                            <Label htmlFor="home">Home</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="work" id="work" />
                            <Label htmlFor="work">Work</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="other" id="other" />
                            <Label htmlFor="other">Other</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="flex gap-3">
                        <Button onClick={handleAddAddress}>Save Address</Button>
                        <Button variant="outline" onClick={() => setShowAddAddress(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 2: Payment Method */}
            {checkoutStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    {/* UPI Payment */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="upi" id="upi" />
                        <Label htmlFor="upi" className="font-medium flex items-center gap-2">
                          UPI
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Recommended</span>
                        </Label>
                      </div>
                      {paymentMethod === "upi" && (
                        <div className="ml-6 p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800 mb-3">Pay securely using any UPI app</p>
                          <div className="flex gap-2">
                            {["PhonePe", "GPay", "Paytm", "BHIM"].map((app) => (
                              <div key={app} className="text-center">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mb-1">
                                  <Image src="/placeholder.svg?height=24&width=24" alt={app} width={24} height={24} />
                                </div>
                                <span className="text-xs">{app}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Payment */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="font-medium">
                          Credit/Debit Card
                        </Label>
                      </div>
                      {paymentMethod === "card" && (
                        <div className="ml-6 space-y-4 p-4 border rounded-lg">
                          <div>
                            <Label htmlFor="cardNumber">Card Number</Label>
                            <Input
                              id="cardNumber"
                              value={cardDetails.number}
                              onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                              placeholder="1234 5678 9012 3456"
                              maxLength={19}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="expiry">Expiry Date</Label>
                              <Input
                                id="expiry"
                                value={cardDetails.expiry}
                                onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                                placeholder="MM/YY"
                                maxLength={5}
                              />
                            </div>
                            <div>
                              <Label htmlFor="cvv">CVV</Label>
                              <Input
                                id="cvv"
                                value={cardDetails.cvv}
                                onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                                placeholder="123"
                                maxLength={4}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="cardName">Cardholder Name</Label>
                            <Input
                              id="cardName"
                              value={cardDetails.name}
                              onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                              placeholder="Name on card"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Cash on Delivery */}
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="font-medium">
                        Cash on Delivery
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Order Review */}
            {checkoutStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Review Your Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Delivery Address */}
                  <div>
                    <h3 className="font-medium mb-2">Delivery Address</h3>
                    {selectedAddress && addresses.find((a) => a.id === selectedAddress) && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium">{addresses.find((a) => a.id === selectedAddress)?.name}</p>
                        <p className="text-sm text-gray-600">
                          {addresses.find((a) => a.id === selectedAddress)?.address},{" "}
                          {addresses.find((a) => a.id === selectedAddress)?.city}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Payment Method */}
                  <div>
                    <h3 className="font-medium mb-2">Payment Method</h3>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="capitalize">
                        {paymentMethod === "upi"
                          ? "UPI Payment"
                          : paymentMethod === "card"
                            ? "Credit/Debit Card"
                            : "Cash on Delivery"}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h3 className="font-medium mb-2">Order Items</h3>
                    <div className="space-y-3">
                      {products.map((product) => (
                        <div key={product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Image
                            src={product.image || "/placeholder.svg?height=50&width=50"}
                            alt={product.name}
                            width={50}
                            height={50}
                            className="rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-600">Qty: {product.quantity}</p>
                          </div>
                          <p className="font-medium">{safeFormatPrice(product.price * product.quantity)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              {checkoutStep > 1 && (
                <Button variant="outline" onClick={() => setCheckoutStep(checkoutStep - 1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}

              {checkoutStep < 3 ? (
                <Button onClick={handleNextStep} className="ml-auto">
                  Continue
                </Button>
              ) : (
                <Button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="ml-auto bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? "Processing..." : `Place Order - ${safeFormatPrice(total)}`}
                </Button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center gap-3">
                    <Image
                      src={product.image || "/placeholder.svg?height=40&width=40"}
                      alt={product.name}
                      width={40}
                      height={40}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                      <p className="text-xs text-gray-600">Qty: {product.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{safeFormatPrice(product.price * product.quantity)}</p>
                      {checkoutStep === 1 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(product.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-xs w-6 text-center">{product.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(product.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Price Breakdown */}
            <Card>
              <CardContent className="p-6 space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal ({products.length} items)</span>
                  <span>{safeFormatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "text-green-600" : ""}>
                    {shipping === 0 ? "FREE" : safeFormatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (GST)</span>
                  <span>{safeFormatPrice(tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{safeFormatPrice(total)}</span>
                </div>

                {shipping === 0 && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <Truck className="w-4 h-4" />
                    <span>You saved ₹100 on shipping!</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-blue-600 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Estimated delivery: Tomorrow</span>
                </div>
              </CardContent>
            </Card>

            {/* Security Badge */}
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="font-medium">100% Secure Payments</span>
                </div>
                <p className="text-xs text-gray-600">Your payment information is encrypted and secure</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Modals */}
      <UPIPayment
        isOpen={isUPIOpen}
        onClose={() => setIsUPIOpen(false)}
        amount={total}
        orderId={orderId}
        onSuccess={handlePaymentSuccess}
      />

      <PaymentConfirmation
        isOpen={isConfirmationOpen}
        onClose={handleConfirmationClose}
        amount={total}
        orderId={orderId}
      />
    </div>
  )
}
