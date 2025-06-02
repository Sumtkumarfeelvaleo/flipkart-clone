"use client"

import { useState, useEffect } from "react"
import { Filter, Grid, List, Star, Heart, ShoppingCart, SlidersHorizontal, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { SearchBar } from "@/components/search-bar"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"
import Image from "next/image"
import {
  fetchProducts,
  fetchCategories,
  getDiscountedPrice,
  formatCategoryName,
  type Product,
  type Category,
} from "@/lib/api"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("popularity")
  const [priceRange, setPriceRange] = useState([0, 2000])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedRating, setSelectedRating] = useState<number>(0)
  const [cartItems, setCartItems] = useState<number[]>([])
  const [wishlistItems, setWishlistItems] = useState<number[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const { toast } = useToast()

  const [availableBrands, setAvailableBrands] = useState<string[]>([])

  useEffect(() => {
    // Load cart and wishlist from localStorage
    const savedCart = localStorage.getItem("cart")
    const savedWishlist = localStorage.getItem("wishlist")
    if (savedCart) setCartItems(JSON.parse(savedCart))
    if (savedWishlist) setWishlistItems(JSON.parse(savedWishlist))

    // Load data
    loadData()
  }, [])

  useEffect(() => {
    filterAndSortProducts()
  }, [products, sortBy, priceRange, selectedBrands, selectedCategories, selectedRating])

  const loadData = async () => {
    try {
      const [productsResponse, categoriesData] = await Promise.all([fetchProducts(100, 0), fetchCategories()])

      setProducts(productsResponse.products)
      setCategories(categoriesData)

      // Extract unique brands
      const brands = [...new Set(productsResponse.products.map((p) => p.brand).filter(Boolean))]
      setAvailableBrands(brands)

      // Set price range based on products
      const prices = productsResponse.products.map((p) => p.price)
      const maxPrice = Math.max(...prices)
      setPriceRange([0, Math.ceil(maxPrice)])
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
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
      const matchesRating = selectedRating === 0 || product.rating >= selectedRating

      return matchesPrice && matchesBrand && matchesCategory && matchesRating
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
      case "name":
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      default:
        // popularity - keep original order
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

  const clearAllFilters = () => {
    setSelectedBrands([])
    setSelectedCategories([])
    setSelectedRating(0)
    setPriceRange([0, 2000])
  }

  const getActiveFiltersCount = () => {
    return selectedBrands.length + selectedCategories.length + (selectedRating > 0 ? 1 : 0)
  }

  const FilterContent = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Clear Filters */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-medium">Filters Applied</span>
          <Button variant="outline" size="sm" onClick={clearAllFilters} className="text-xs h-7">
            Clear All
          </Button>
        </div>
      )}

      {/* Price Range */}
      <div>
        <h4 className="font-medium mb-2 sm:mb-3 text-gray-900 text-sm">Price Range</h4>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={Math.max(...products.map((p) => p.price), 2000)}
          step={50}
          className="mb-2 sm:mb-3"
        />
        <div className="flex justify-between text-xs text-gray-600">
          <span>₹{priceRange[0].toLocaleString()}</span>
          <span>₹{priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <h4 className="font-medium mb-2 sm:mb-3 text-gray-900 text-sm">Customer Rating</h4>
        <div className="space-y-1.5 sm:space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={selectedRating === rating}
                onCheckedChange={(checked) => {
                  setSelectedRating(checked ? rating : 0)
                }}
              />
              <label htmlFor={`rating-${rating}`} className="text-xs sm:text-sm cursor-pointer flex items-center">
                <span className="mr-1">{rating}</span>
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="ml-1">& above</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Brands */}
      {availableBrands.length > 0 && (
        <div>
          <h4 className="font-medium mb-2 sm:mb-3 text-gray-900 text-sm">Brand</h4>
          <div className="space-y-1.5 sm:space-y-2 max-h-32 sm:max-h-48 overflow-y-auto">
            {availableBrands.slice(0, 10).map((brand) => (
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
                <label htmlFor={brand} className="text-xs sm:text-sm cursor-pointer truncate">
                  {brand}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <h4 className="font-medium mb-2 sm:mb-3 text-gray-900 text-sm">Category</h4>
          <div className="space-y-1.5 sm:space-y-2 max-h-32 sm:max-h-48 overflow-y-auto">
            {categories.slice(0, 10).map((category) => (
              <div key={category.slug} className="flex items-center space-x-2">
                <Checkbox
                  id={category.slug}
                  checked={selectedCategories.includes(category.slug)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedCategories([...selectedCategories, category.slug])
                    } else {
                      setSelectedCategories(selectedCategories.filter((c) => c !== category.slug))
                    }
                  }}
                />
                <label htmlFor={category.slug} className="text-xs sm:text-sm cursor-pointer truncate">
                  {formatCategoryName(category.slug)}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f1f3f6]">
        {/* Loading Navbar */}
        <nav className="sticky top-0 z-50 bg-[#2874f0] text-white shadow-lg">
          <div className="w-full px-2 sm:px-4 py-2 sm:py-3">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex flex-col">
                <span className="text-sm sm:text-xl font-bold italic">Flipkart</span>
                <span className="text-xs italic flex items-center">
                  Explore <span className="text-yellow-300 font-medium mx-0.5">Plus</span>
                  <Image src="/placeholder.svg?height=10&width=10" alt="Plus" width={8} height={8} />
                </span>
              </Link>
              <div className="flex-1 max-w-md mx-2 sm:mx-4">
                <SearchBar />
              </div>
              <Link href="/cart">
                <Button variant="ghost" size="sm" className="text-white hover:bg-blue-700 p-1 sm:p-2">
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </nav>
        <div className="w-full px-2 sm:px-4 py-8 sm:py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#2874f0] text-white shadow-lg">
        <div className="w-full px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex flex-col min-w-0 flex-shrink-0">
              <span className="text-sm sm:text-xl font-bold italic truncate">Flipkart</span>
              <span className="text-xs italic flex items-center">
                Explore <span className="text-yellow-300 font-medium mx-0.5">Plus</span>
                <Image src="/placeholder.svg?height=10&width=10" alt="Plus" width={8} height={8} />
              </span>
            </Link>
            <div className="flex-1 max-w-md mx-2 sm:mx-4 hidden md:block">
              <SearchBar />
            </div>
            <div className="flex items-center gap-1 sm:gap-4">
              <Link href="/cart">
                <Button variant="ghost" size="sm" className="text-white hover:bg-blue-700 relative p-1 sm:p-2">
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                  {cartItems.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs h-4 w-4 flex items-center justify-center p-0 rounded-full">
                      {cartItems.length > 9 ? "9+" : cartItems.length}
                    </Badge>
                  )}
                </Button>
              </Link>
            </div>
          </div>
          {/* Mobile Search */}
          <div className="md:hidden mt-2">
            <SearchBar />
          </div>
        </div>
      </nav>

      <div className="w-full px-1 sm:px-2 md:px-4 py-2 sm:py-4 md:py-6">
        {/* Mobile Filter and Sort Bar */}
        <div className="flex md:hidden items-center justify-between mb-3 sm:mb-4 bg-white p-2 sm:p-3 rounded-lg shadow-sm">
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1 sm:gap-2 text-xs h-8">
                <SlidersHorizontal className="w-3 h-3 sm:w-4 sm:h-4" />
                Filters
                {getActiveFiltersCount() > 0 && (
                  <Badge className="bg-[#2874f0] text-white text-xs h-4 w-4 flex items-center justify-center p-0 rounded-full">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-80">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                  Filters
                </SheetTitle>
              </SheetHeader>
              <div className="mt-4 sm:mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-28 sm:w-40 h-8 text-xs">
              <ArrowUpDown className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity" className="text-xs sm:text-sm">
                Popularity
              </SelectItem>
              <SelectItem value="price-low" className="text-xs sm:text-sm">
                Price: Low to High
              </SelectItem>
              <SelectItem value="price-high" className="text-xs sm:text-sm">
                Price: High to Low
              </SelectItem>
              <SelectItem value="rating" className="text-xs sm:text-sm">
                Customer Rating
              </SelectItem>
              <SelectItem value="discount" className="text-xs sm:text-sm">
                Discount
              </SelectItem>
              <SelectItem value="name" className="text-xs sm:text-sm">
                Name
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 sm:gap-4 md:gap-6">
          {/* Desktop Filters Sidebar */}
          <div className="hidden md:block w-56 lg:w-64 bg-white rounded-lg shadow-sm p-4 lg:p-6 h-fit sticky top-20 lg:top-24">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-gray-900 text-sm lg:text-base">
              <Filter className="w-4 h-4 lg:w-5 lg:h-5" />
              Filters
            </h3>
            <FilterContent />
          </div>

          {/* Products */}
          <div className="flex-1 min-w-0">
            {/* Desktop Toolbar */}
            <div className="hidden md:flex items-center justify-between mb-4 lg:mb-6 bg-white p-3 lg:p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-3 lg:gap-4">
                <span className="text-gray-600 font-medium text-sm lg:text-base">
                  {filteredProducts.length} products found
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={`h-8 ${viewMode === "grid" ? "bg-[#2874f0]" : ""}`}
                  >
                    <Grid className="w-3 h-3 lg:w-4 lg:h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={`h-8 ${viewMode === "list" ? "bg-[#2874f0]" : ""}`}
                  >
                    <List className="w-3 h-3 lg:w-4 lg:h-4" />
                  </Button>
                </div>
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 lg:w-48 h-8 text-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Popularity</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Customer Rating</SelectItem>
                  <SelectItem value="discount">Discount</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Products Grid/List */}
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1.5 sm:gap-2 md:gap-3 lg:gap-4"
                  : "space-y-2 sm:space-y-4"
              }
            >
              {filteredProducts.map((product) => {
                const discountedPrice = getDiscountedPrice(product.price, product.discountPercentage)
                return (
                  <Card
                    key={product.id}
                    className={`hover:shadow-lg transition-all duration-200 bg-white product-card ${
                      viewMode === "list" ? "flex" : ""
                    }`}
                  >
                    <CardContent
                      className={`p-2 sm:p-3 md:p-4 ${viewMode === "list" ? "flex gap-3 sm:gap-4 w-full" : ""}`}
                    >
                      <div className={`relative ${viewMode === "list" ? "w-32 sm:w-48 flex-shrink-0" : ""}`}>
                        <Link href={`/product/${product.id}`}>
                          <Image
                            src={product.thumbnail || "/placeholder.svg"}
                            alt={product.title}
                            width={200}
                            height={200}
                            className={`object-cover rounded-lg mb-2 sm:mb-3 hover:scale-105 transition-transform ${
                              viewMode === "list" ? "w-full h-20 sm:h-32" : "w-full h-24 sm:h-32 md:h-36 lg:h-48"
                            }`}
                          />
                        </Link>
                        {product.discountPercentage > 0 && (
                          <Badge className="absolute top-1 left-1 bg-[#ff9f00] text-white text-xs font-medium px-1 py-0.5">
                            {Math.round(product.discountPercentage)}% OFF
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-1 right-1 bg-white/80 hover:bg-white h-6 w-6 p-0"
                          onClick={() => toggleWishlist(product.id)}
                        >
                          <Heart
                            className={`w-3 h-3 ${
                              wishlistItems.includes(product.id) ? "fill-red-500 text-red-500" : "text-gray-600"
                            }`}
                          />
                        </Button>
                      </div>
                      <div className={`${viewMode === "list" ? "flex-1 min-w-0" : ""}`}>
                        <Link href={`/product/${product.id}`}>
                          <h3 className="font-medium mb-1 sm:mb-2 hover:text-[#2874f0] line-clamp-2 text-xs sm:text-sm md:text-base">
                            {product.title}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                          <div className="flex items-center bg-green-600 text-white px-1 py-0.5 rounded text-xs">
                            <span className="font-medium">{product.rating}</span>
                            <Star className="w-2 h-2 sm:w-3 sm:h-3 fill-white ml-0.5" />
                          </div>
                          <span className="text-xs text-gray-500">({Math.floor(Math.random() * 1000) + 100})</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
                          <span className="text-sm sm:text-lg md:text-xl font-bold text-gray-900">
                            ₹{discountedPrice.toLocaleString()}
                          </span>
                          {product.discountPercentage > 0 && (
                            <>
                              <span className="text-gray-500 line-through text-xs sm:text-sm">
                                ₹{product.price.toLocaleString()}
                              </span>
                              <span className="text-green-600 text-xs sm:text-sm font-medium">
                                {Math.round(product.discountPercentage)}% off
                              </span>
                            </>
                          )}
                        </div>
                        <div className="flex gap-1 sm:gap-2">
                          <Button
                            size="sm"
                            onClick={() => addToCart(product.id)}
                            className="flex-1 bg-[#ff9f00] hover:bg-[#ff9f00]/90 text-white text-xs h-6 sm:h-8"
                          >
                            Add to Cart
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => buyNow(product.id)}
                            variant="outline"
                            className="flex-1 border-[#2874f0] text-[#2874f0] hover:bg-[#2874f0] hover:text-white text-xs h-6 sm:h-8"
                          >
                            Buy Now
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-8 sm:py-12 bg-white rounded-lg shadow-sm">
                <div className="mb-4">
                  <Image
                    src="/placeholder.svg?height=120&width=120"
                    alt="No products found"
                    width={80}
                    height={80}
                    className="mx-auto opacity-50 sm:w-[120px] sm:h-[120px]"
                  />
                </div>
                <p className="text-gray-500 text-sm sm:text-lg mb-4">No products found matching your criteria.</p>
                <Button onClick={clearAllFilters} className="bg-[#2874f0] hover:bg-[#2874f0]/90 text-sm h-8 sm:h-10">
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
