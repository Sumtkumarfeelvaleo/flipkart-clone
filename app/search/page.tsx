"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Star, Heart, ShoppingCart, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { SearchBar } from "@/components/search-bar"
import Link from "next/link"
import Image from "next/image"
import { searchProducts, getDiscountedPrice, type Product } from "@/lib/api"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""

  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState("relevance")
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [cartItems, setCartItems] = useState<number[]>([])
  const [wishlistItems, setWishlistItems] = useState<number[]>([])
  const { toast } = useToast()

  const [availableBrands, setAvailableBrands] = useState<string[]>([])
  const [availableCategories, setAvailableCategories] = useState<string[]>([])

  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    const savedWishlist = localStorage.getItem("wishlist")
    if (savedCart) setCartItems(JSON.parse(savedCart))
    if (savedWishlist) setWishlistItems(JSON.parse(savedWishlist))
  }, [])

  useEffect(() => {
    if (query) {
      searchForProducts(query)
    }
  }, [query])

  useEffect(() => {
    filterAndSortProducts()
  }, [products, sortBy, priceRange, selectedBrands, selectedCategories])

  const searchForProducts = async (searchQuery: string) => {
    setIsLoading(true)
    try {
      const response = await searchProducts(searchQuery, 100)
      setProducts(response.products)

      // Extract unique brands and categories
      const brands = [...new Set(response.products.map((p) => p.brand).filter(Boolean))]
      const categories = [...new Set(response.products.map((p) => p.category))]
      setAvailableBrands(brands)
      setAvailableCategories(categories)

      // Set price range based on products
      const prices = response.products.map((p) => p.price)
      const maxPrice = Math.max(...prices)
      setPriceRange([0, Math.ceil(maxPrice)])
    } catch (error) {
      console.error("Search error:", error)
      toast({
        title: "Search Error",
        description: "Failed to search products. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortProducts = () => {
    const filtered = products.filter((product) => {
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand)
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category)
      return matchesPrice && matchesBrand && matchesCategory
    })

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case "discount":
        filtered.sort((a, b) => b.discountPercentage - a.discountPercentage)
        break
      default:
        // relevance - keep original order
        break
    }

    setFilteredProducts(filtered)
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

  const buyNow = (productId: number) => {
    const newCart = [...cartItems, productId]
    setCartItems(newCart)
    localStorage.setItem("cart", JSON.stringify(newCart))
    window.location.href = "/checkout"
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="sticky top-0 z-50 bg-blue-600 text-white shadow-lg">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold">
                Flipkart
              </Link>
              <div className="flex-1 max-w-md mx-4">
                <SearchBar />
              </div>
              <Link href="/cart">
                <Button variant="ghost" size="sm" className="text-white hover:bg-blue-700">
                  <ShoppingCart className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </nav>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Searching for "{query}"...</p>
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
            <div className="flex-1 max-w-md mx-4">
              <SearchBar />
            </div>
            <Link href="/cart">
              <Button variant="ghost" size="sm" className="text-white hover:bg-blue-700 relative">
                <ShoppingCart className="w-5 h-5" />
                {cartItems.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs">{cartItems.length}</Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Search Results for "{query}"</h1>
          <p className="text-gray-600">{filteredProducts.length} products found</p>
        </div>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <div className="w-64 space-y-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </h3>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Price Range</h4>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={Math.max(...products.map((p) => p.price), 1000)}
                  step={10}
                  className="mb-2"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>

              {/* Brands */}
              {availableBrands.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Brands</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableBrands.map((brand) => (
                      <div key={brand} className="flex items-center space-x-2">
                        <Checkbox
                          id={brand}
                          checked={selectedBrands.includes(brand)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedBrands([...selectedBrands, brand])
                            } else {
                              setSelectedBrands(selectedBrands.filter((b) => b !== brand))
                            }
                          }}
                        />
                        <label htmlFor={brand} className="text-sm cursor-pointer">
                          {brand}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories */}
              {availableCategories.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Categories</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableCategories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={category}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCategories([...selectedCategories, category])
                            } else {
                              setSelectedCategories(selectedCategories.filter((c) => c !== category))
                            }
                          }}
                        />
                        <label htmlFor={category} className="text-sm cursor-pointer">
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Products */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-gray-600">{filteredProducts.length} products found</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Customer Rating</SelectItem>
                  <SelectItem value="discount">Discount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const discountedPrice = getDiscountedPrice(product.price, product.discountPercentage)
                return (
                  <Card key={product.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="relative">
                        <Image
                          src={product.thumbnail || "/placeholder.svg"}
                          alt={product.title}
                          width={200}
                          height={200}
                          className="w-full h-48 object-cover rounded-lg mb-3"
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
                            className={`w-5 h-5 ${wishlistItems.includes(product.id) ? "fill-red-500 text-red-500" : ""}`}
                          />
                        </Button>
                      </div>
                      <Link href={`/product/${product.id}`}>
                        <h3 className="font-semibold mb-2 hover:text-blue-600 line-clamp-2">{product.title}</h3>
                      </Link>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm ml-1">{product.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl font-bold">${discountedPrice}</span>
                        {product.discountPercentage > 0 && (
                          <span className="text-gray-500 line-through">${product.price}</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => addToCart(product.id)} className="flex-1">
                          Add to Cart
                        </Button>
                        <Button size="sm" onClick={() => buyNow(product.id)} variant="outline" className="flex-1">
                          Buy Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
                <Button
                  onClick={() => {
                    setSelectedBrands([])
                    setSelectedCategories([])
                    setPriceRange([0, 1000])
                  }}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
