"use client"

import { useState, useEffect } from "react"
import { Star, Heart, ShoppingCart, TrendingUp, Eye, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import Image from "next/image"
import { fetchProducts, formatPrice, type Product } from "@/lib/api"

interface ProductRecommendationsProps {
  currentProductId: number
  category: string
}

export function ProductRecommendations({ currentProductId, category }: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<{
    similar: Product[]
    trending: Product[]
    recentlyViewed: Product[]
    frequentlyBought: Product[]
  }>({
    similar: [],
    trending: [],
    recentlyViewed: [],
    frequentlyBought: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [cartItems, setCartItems] = useState<number[]>([])
  const [wishlistItems, setWishlistItems] = useState<number[]>([])
  const { toast } = useToast()

  useEffect(() => {
    loadRecommendations()
    loadUserData()
  }, [currentProductId, category])

  const loadUserData = () => {
    const savedCart = localStorage.getItem("cart")
    const savedWishlist = localStorage.getItem("wishlist")
    if (savedCart) setCartItems(JSON.parse(savedCart))
    if (savedWishlist) setWishlistItems(JSON.parse(savedWishlist))
  }

  const loadRecommendations = async () => {
    setIsLoading(true)
    try {
      // Fetch products for recommendations
      const response = await fetchProducts(50, 0)
      const allProducts = response.products.filter((p) => p.id !== currentProductId)

      // Similar products (same category) - if none found, show random products
      const similar = allProducts.filter((p) => p.category === category).slice(0, 6)
      const similarFallback = similar.length > 0 ? similar : allProducts.slice(0, 6)

      // Trending products (high rating + high discount)
      const trending = allProducts
        .sort((a, b) => b.rating * b.discountPercentage - a.rating * a.discountPercentage)
        .slice(0, 6)

      // Recently viewed - if none found, show trending products
      const recentlyViewedIds = JSON.parse(localStorage.getItem("recentlyViewed") || "[]")
      const recentlyViewed = allProducts.filter((p) => recentlyViewedIds.includes(p.id)).slice(0, 6)
      const recentFallback = recentlyViewed.length > 0 ? recentlyViewed : trending.slice(0, 6)

      // Frequently bought together (random selection for demo)
      const frequentlyBought = allProducts.sort(() => Math.random() - 0.5).slice(0, 6)

      setRecommendations({
        similar: similarFallback,
        trending,
        recentlyViewed: recentFallback,
        frequentlyBought,
      })

      // Add current product to recently viewed
      const updatedRecentlyViewed = [
        currentProductId,
        ...recentlyViewedIds.filter((id: number) => id !== currentProductId),
      ].slice(0, 10)
      localStorage.setItem("recentlyViewed", JSON.stringify(updatedRecentlyViewed))
    } catch (error) {
      console.error("Error loading recommendations:", error)
    } finally {
      setIsLoading(false)
    }
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

  const toggleWishlist = (productId: number) => {
    const newWishlist = wishlistItems.includes(productId)
      ? wishlistItems.filter((id) => id !== productId)
      : [...wishlistItems, productId]
    setWishlistItems(newWishlist)
    localStorage.setItem("wishlist", JSON.stringify(newWishlist))
    toast({
      title: wishlistItems.includes(productId) ? "Removed from Wishlist" : "Added to Wishlist",
      description: wishlistItems.includes(productId) ? "Product removed from wishlist" : "Product added to wishlist",
    })
  }

  const ProductGrid = ({
    products,
    emptyMessage,
    fallbackProducts,
  }: {
    products: Product[]
    emptyMessage: string
    fallbackProducts?: Product[]
  }) => {
    const productsToShow = products.length > 0 ? products : fallbackProducts || []

    if (productsToShow.length === 0) {
      return <div className="text-center py-8 text-gray-500">{emptyMessage}</div>
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {productsToShow.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="relative">
                <Image
                  src={product.thumbnail || "/placeholder.svg"}
                  alt={product.title}
                  width={200}
                  height={200}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
                {product.discountPercentage > 0 && (
                  <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                    {Math.round(product.discountPercentage)}% OFF
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => toggleWishlist(product.id)}
                >
                  <Heart
                    className={`w-4 h-4 ${wishlistItems.includes(product.id) ? "fill-red-500 text-red-500" : ""}`}
                  />
                </Button>
              </div>

              <Link href={`/product/${product.id}`}>
                <h3 className="font-semibold mb-2 hover:text-blue-600 line-clamp-2 text-sm">{product.title}</h3>
              </Link>

              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs ml-1">{product.rating}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-sm">{formatPrice(product.price)}</span>
              </div>

              <Button onClick={() => addToCart(product.id)} className="w-full" size="sm">
                <ShoppingCart className="w-3 h-3 mr-1" />
                Add to Cart
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading recommendations...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended for You</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="similar" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="similar" className="text-xs">
              <Eye className="w-3 h-3 mr-1" />
              Similar
            </TabsTrigger>
            <TabsTrigger value="trending" className="text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="recent" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              Recent
            </TabsTrigger>
            <TabsTrigger value="together" className="text-xs">
              <ShoppingCart className="w-3 h-3 mr-1" />
              Together
            </TabsTrigger>
          </TabsList>

          <TabsContent value="similar" className="mt-4">
            <ProductGrid products={recommendations.similar} emptyMessage="No similar products found" />
          </TabsContent>

          <TabsContent value="trending" className="mt-4">
            <ProductGrid products={recommendations.trending} emptyMessage="No trending products available" />
          </TabsContent>

          <TabsContent value="recent" className="mt-4">
            <ProductGrid products={recommendations.recentlyViewed} emptyMessage="No recently viewed products" />
          </TabsContent>

          <TabsContent value="together" className="mt-4">
            <ProductGrid
              products={recommendations.frequentlyBought}
              emptyMessage="No frequently bought together items"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
