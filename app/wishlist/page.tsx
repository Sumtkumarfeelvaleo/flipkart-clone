"use client"

import { useState, useEffect } from "react"
import { Heart, ShoppingCart, Trash2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import Image from "next/image"

// Mock products data
const mockProducts = {
  1: { id: 1, name: "iPhone 15 Pro", price: 999, image: "/placeholder.svg?height=200&width=200", rating: 4.8 },
  2: { id: 2, name: "Samsung Galaxy S24", price: 799, image: "/placeholder.svg?height=200&width=200", rating: 4.6 },
  3: { id: 3, name: "MacBook Air M3", price: 1099, image: "/placeholder.svg?height=200&width=200", rating: 4.9 },
  4: { id: 4, name: "Wireless Headphones", price: 199, image: "/placeholder.svg?height=200&width=200", rating: 4.5 },
  5: { id: 5, name: "Smart Watch", price: 299, image: "/placeholder.svg?height=200&width=200", rating: 4.3 },
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<number[]>([])
  const [cartItems, setCartItems] = useState<number[]>([])
  const { toast } = useToast()

  useEffect(() => {
    // Load wishlist and cart from localStorage
    const savedWishlist = localStorage.getItem("wishlist")
    const savedCart = localStorage.getItem("cart")
    if (savedWishlist) setWishlistItems(JSON.parse(savedWishlist))
    if (savedCart) setCartItems(JSON.parse(savedCart))
  }, [])

  const removeFromWishlist = (productId: number) => {
    const newWishlist = wishlistItems.filter((id) => id !== productId)
    setWishlistItems(newWishlist)
    localStorage.setItem("wishlist", JSON.stringify(newWishlist))
    toast({
      title: "Removed from Wishlist",
      description: "Product has been removed from your wishlist",
    })
  }

  const addToCart = (productId: number) => {
    const newCart = [...cartItems, productId]
    setCartItems(newCart)
    localStorage.setItem("cart", JSON.stringify(newCart))
    toast({
      title: "Added to Cart",
      description: "Product has been added to your cart",
    })
  }

  const moveToCart = (productId: number) => {
    addToCart(productId)
    removeFromWishlist(productId)
    toast({
      title: "Moved to Cart",
      description: "Product has been moved from wishlist to cart",
    })
  }

  if (wishlistItems.length === 0) {
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

        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <Heart className="w-24 h-24 mx-auto text-gray-300 mb-6" />
            <h1 className="text-3xl font-bold mb-4">Your wishlist is empty</h1>
            <p className="text-gray-600 mb-8">Save items you love to your wishlist and shop them later.</p>
            <Link href="/products">
              <Button size="lg">Start Shopping</Button>
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
            <div className="flex items-center gap-4">
              <Link href="/cart">
                <Button variant="ghost" size="sm" className="text-white hover:bg-blue-700 relative">
                  <ShoppingCart className="w-5 h-5" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItems.length}
                    </span>
                  )}
                </Button>
              </Link>
              <Link href="/products">
                <Button variant="ghost" size="sm" className="text-white hover:bg-blue-700">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Wishlist ({wishlistItems.length} items)</h1>
          <Button
            variant="outline"
            onClick={() => {
              wishlistItems.forEach((id) => addToCart(id))
              setWishlistItems([])
              localStorage.setItem("wishlist", JSON.stringify([]))
              toast({
                title: "All Items Added to Cart",
                description: "All wishlist items have been moved to your cart",
              })
            }}
          >
            Add All to Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((productId) => {
            const product = mockProducts[productId as keyof typeof mockProducts]
            if (!product) return null

            return (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="relative mb-4">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={200}
                      height={200}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                      onClick={() => removeFromWishlist(product.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>

                  <Link href={`/product/${product.id}`}>
                    <h3 className="font-semibold mb-2 hover:text-blue-600">{product.name}</h3>
                  </Link>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm ml-1">{product.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold">${product.price}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => moveToCart(product.id)} className="flex-1" size="sm">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Move to Cart
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => removeFromWishlist(product.id)}>
                      <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
