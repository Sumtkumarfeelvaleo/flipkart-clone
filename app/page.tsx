"use client"

import { useState, useEffect } from "react"
import { Truck, Shield, Gift, Zap, ArrowRight, AlertCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Navbar } from "@/components/navbar"
import { CategoryBar } from "@/components/category-bar"
import { HomeCarousel } from "@/components/home-carousel"
import Link from "next/link"
import Image from "next/image"
import { fetchProducts, fetchCategories, getDiscountedPrice, type Product, type Category } from "@/lib/api"
import { formatPrice, safeLocalStorage, handleApiError, validateProducts } from "@/lib/error-utils"

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cartItems, setCartItems] = useState<number[]>([])
  const [wishlistItems, setWishlistItems] = useState<number[]>([])
  const { toast } = useToast()

  useEffect(() => {
    // Load cart and wishlist from localStorage
    try {
      const savedCart = safeLocalStorage.getItem("cart")
      const savedWishlist = safeLocalStorage.getItem("wishlist")
      
      if (savedCart && Array.isArray(savedCart)) {
        setCartItems(savedCart)
      }
      if (savedWishlist && Array.isArray(savedWishlist)) {
        setWishlistItems(savedWishlist)
      }
    } catch (error) {
      console.error("Error loading saved data:", error)
      toast({
        title: "Error",
        description: "Failed to load saved items. Starting fresh.",
        variant: "destructive",
      })
    }

    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setError(null)
    setIsLoading(true)
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        fetchProducts(24, 0),
        fetchCategories()
      ])
      
      if (!productsResponse?.products) {
        throw new Error("Invalid response from server")
      }

      const validatedProducts = validateProducts(productsResponse.products)
      
      // Use predefined categories for consistency
      const predefinedCategories = [
        { slug: "smartphones", name: "Mobiles", image: "/categories/mobile.svg" },
        { slug: "laptops", name: "Laptops", image: "/categories/laptop.svg" },
        { slug: "home-decoration", name: "Home & Furniture", image: "/categories/home.svg" },
        { slug: "mens-shirts", name: "Fashion", image: "/categories/fashion.svg" },
        { slug: "groceries", name: "Grocery", image: "/categories/grocery.svg" },
        { slug: "beauty", name: "Beauty", image: "/categories/beauty.svg" },
        { slug: "sports-accessories", name: "Sports", image: "/categories/sports.svg" },
        { slug: "automotive", name: "Automotive", image: "/categories/auto.svg" },
        { slug: "kitchen-accessories", name: "Appliances", image: "/categories/appliances.svg" },
      ]
      
      setProducts(validatedProducts)
      setCategories(predefinedCategories)

      if (validatedProducts.length === 0) {
        throw new Error("No valid products found")
      }
    } catch (error) {
      const errorMessage = handleApiError(error)
      setError(errorMessage)
      console.error("Error loading initial data:", error)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addToCart = (productId: number) => {
    try {
      const newCart = [...cartItems, productId]
      setCartItems(newCart)
      
      if (!safeLocalStorage.setItem("cart", newCart)) {
        throw new Error("Failed to save cart")
      }

      toast({
        title: "Added to Cart",
        description: "Product has been added to your cart",
      })
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      })
    }
  }

  const toggleWishlist = (productId: number) => {
    try {
      const newWishlist = wishlistItems.includes(productId)
        ? wishlistItems.filter((id) => id !== productId)
        : [...wishlistItems, productId]
      
      setWishlistItems(newWishlist)
      
      if (!safeLocalStorage.setItem("wishlist", newWishlist)) {
        throw new Error("Failed to save wishlist")
      }

      toast({
        title: wishlistItems.includes(productId) ? "Removed from Wishlist" : "Added to Wishlist",
        description: wishlistItems.includes(productId) ? "Product removed from wishlist" : "Product added to wishlist",
      })
    } catch (error) {
      console.error("Error updating wishlist:", error)
      toast({
        title: "Error",
        description: "Failed to update wishlist. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f1f3f6]">
        <Navbar />
        <CategoryBar />
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center mb-4 text-red-600">
            <AlertCircle className="h-8 w-8 mr-2" />
            <h2 className="text-xl font-semibold">Error Loading Products</h2>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadInitialData} className="bg-blue-600 hover:bg-blue-700">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      <Navbar />
      <CategoryBar />

      {/* Main Content */}
      <main className="container mx-auto px-2 md:px-4 py-2 space-y-6">
        {/* Top Banner Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-2 h-[200px] md:h-[400px] overflow-hidden rounded-lg">
            <HomeCarousel />
          </div>
          <div className="hidden md:flex flex-col gap-4">
            <div className="relative h-[190px] overflow-hidden rounded-lg">
              <Image
                src="/banners/side-banner-1.svg"
                alt="Special Offer"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="relative h-[190px] overflow-hidden rounded-lg">
              <Image
                src="/banners/side-banner-2.svg"
                alt="New Arrivals"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>

        {/* Category Highlights */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-bold mb-4">Top Categories</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
            {categories.map((category, index) => {
              // Ensure category slug is a string
              const categorySlug = typeof category.slug === 'string' 
                ? category.slug 
                : typeof category === 'string' 
                  ? category 
                  : 'unknown';
                  
              return (
                <Link key={index} href={`/category/${categorySlug}`} className="text-center group">
                  <div className="relative w-16 h-16 mx-auto mb-2 bg-gray-50 rounded-full p-2">
                    <Image
                      src={category.image}
                      alt={category.name}
                      width={48}
                      height={48}
                      className="object-contain group-hover:scale-110 transition-transform"
                    />
                  </div>
                  <p className="text-xs font-medium text-gray-700 group-hover:text-blue-600 line-clamp-2">
                    {category.name}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Promotional Banners */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg transition-all hover:-translate-y-1">
            <CardContent className="p-4 text-center">
              <Truck className="h-8 w-8 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Free Delivery</h3>
              <p className="text-xs opacity-90">On orders above ₹499</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg transition-all hover:-translate-y-1">
            <CardContent className="p-4 text-center">
              <Shield className="h-8 w-8 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Secure Payment</h3>
              <p className="text-xs opacity-90">100% Safe & Secure</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg transition-all hover:-translate-y-1">
            <CardContent className="p-4 text-center">
              <Gift className="h-8 w-8 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Gift Cards</h3>
              <p className="text-xs opacity-90">Perfect for gifting</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-lg transition-all hover:-translate-y-1">
            <CardContent className="p-4 text-center">
              <Zap className="h-8 w-8 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Flash Sale</h3>
              <p className="text-xs opacity-90">Limited Time Offers</p>
            </CardContent>
          </Card>
        </div>

        {/* Deals of the Day */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock className="h-6 w-6" />
                <span className="text-lg font-bold">Deals of the Day</span>
                <Badge className="bg-red-500 text-white font-bold animate-pulse">Ends in 05:23:45</Badge>
              </div>
              <Link href="/deals" className="flex items-center text-sm hover:underline">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {products.slice(0, 6).map((product) => (
                <Link key={product.id} href={`/product/${product.id}`} className="group">
                  <div className="text-center">
                    <div className="relative mb-2 aspect-square bg-gray-50 rounded-lg p-2">
                      <Image
                        src={product.thumbnail}
                        alt={product.title}
                        fill
                        className="object-contain p-2 group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1 group-hover:text-blue-600">
                      {product.title}
                    </h3>
                    <p className="text-green-600 font-semibold">{formatPrice(getDiscountedPrice(product.price, product.discountPercentage))}</p>
                    <p className="text-gray-500 text-xs">{product.brand}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Featured Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-pink-50 to-pink-100">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Fashion Deals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {products.filter(p => p.category === "fashion").slice(0, 4).map((product) => (
                  <Link key={product.id} href={`/product/${product.id}`} className="group">
                    <div className="relative aspect-square bg-white rounded-lg overflow-hidden">
                      <Image
                        src={product.thumbnail}
                        alt={product.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <p className="text-xs font-medium text-gray-700 line-clamp-1 mt-2 group-hover:text-blue-600">{product.title}</p>
                    <p className="text-xs text-green-600">{formatPrice(getDiscountedPrice(product.price, product.discountPercentage))}</p>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Electronics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {products.filter(p => p.category === "electronics").slice(0, 4).map((product) => (
                  <Link key={product.id} href={`/product/${product.id}`} className="group">
                    <div className="relative aspect-square bg-white rounded-lg overflow-hidden">
                      <Image
                        src={product.thumbnail}
                        alt={product.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <p className="text-xs font-medium text-gray-700 line-clamp-1 mt-2 group-hover:text-blue-600">{product.title}</p>
                    <p className="text-xs text-green-600">{formatPrice(getDiscountedPrice(product.price, product.discountPercentage))}</p>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Home & Living</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {products.filter(p => p.category === "home-decoration").slice(0, 4).map((product) => (
                  <Link key={product.id} href={`/product/${product.id}`} className="group">
                    <div className="relative aspect-square bg-white rounded-lg overflow-hidden">
                      <Image
                        src={product.thumbnail}
                        alt={product.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <p className="text-xs font-medium text-gray-700 line-clamp-1 mt-2 group-hover:text-blue-600">{product.title}</p>
                    <p className="text-xs text-green-600">{formatPrice(getDiscountedPrice(product.price, product.discountPercentage))}</p>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Best Sellers */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock className="h-6 w-6" />
                <span className="text-lg font-bold">Best Sellers</span>
              </div>
              <Link href="/best-sellers" className="flex items-center text-sm hover:underline">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {products.sort((a, b) => b.rating - a.rating).slice(0, 6).map((product) => (
                <Link key={product.id} href={`/product/${product.id}`} className="group">
                  <div className="text-center">
                    <div className="relative aspect-square bg-gray-50 rounded-lg p-2">
                      <Image
                        src={product.thumbnail}
                        alt={product.title}
                        fill
                        className="object-contain p-2 group-hover:scale-105 transition-transform"
                      />
                      <Badge className="absolute top-2 right-2 bg-yellow-400 text-yellow-800">
                        ⭐ {product.rating}
                      </Badge>
                    </div>
                    <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mt-2 group-hover:text-blue-600">
                      {product.title}
                    </h3>
                    <p className="text-green-600 font-semibold">{formatPrice(getDiscountedPrice(product.price, product.discountPercentage))}</p>
                    <p className="text-gray-500 text-xs">{product.brand}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recently Viewed */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Recently Viewed</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {products.slice(-6).map((product) => (
                <Link key={product.id} href={`/product/${product.id}`} className="group">
                  <div className="text-center">
                    <div className="relative aspect-square bg-gray-50 rounded-lg p-2">
                      <Image
                        src={product.thumbnail}
                        alt={product.title}
                        fill
                        className="object-contain p-2 group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mt-2 group-hover:text-blue-600">
                      {product.title}
                    </h3>
                    <p className="text-green-600 font-semibold">{formatPrice(getDiscountedPrice(product.price, product.discountPercentage))}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-[#172337] text-white mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">ABOUT</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:underline text-gray-300">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline text-gray-300">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline text-gray-300">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline text-gray-300">
                    Press
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">HELP</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:underline text-gray-300">
                    Payments
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline text-gray-300">
                    Shipping
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline text-gray-300">
                    Returns
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline text-gray-300">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">POLICY</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:underline text-gray-300">
                    Return Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline text-gray-300">
                    Terms Of Use
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline text-gray-300">
                    Security
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline text-gray-300">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">SOCIAL</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:underline text-gray-300">
                    Facebook
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline text-gray-300">
                    Twitter
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline text-gray-300">
                    YouTube
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline text-gray-300">
                    Instagram
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-600 mt-8 pt-6 text-center text-sm text-gray-300">
            <p>&copy; 2024 Flipkart Clone. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
