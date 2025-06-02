"use client"

import { useState, useEffect, Suspense, useMemo } from "react"
import { use } from "react"
import {
  Star,
  Heart,
  ShoppingCart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Award,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  Zap,
  Gift,
  CreditCard,
  Percent,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { SearchBar } from "@/components/search-bar"
import { ProductRecommendations } from "@/components/product-recommendations"
import Link from "next/link"
import Image from "next/image"
import { fetchProduct, getDiscountedPrice, formatPrice, type Product } from "@/lib/api"

interface ProductDetailPageProps {
  params: {
    id: string
  }
}

interface UserReview {
  id: string
  userName: string
  userAvatar?: string
  rating: number
  title: string
  comment: string
  date: string
  verified: boolean
  helpful: number
  images?: string[]
  pros?: string[]
  cons?: string[]
}

// Separate component for data fetching
function ProductData({ productId }: { productId: string }) {
  // Memoize the product promise to prevent unnecessary re-fetches
  const productPromise = useMemo(() => {
    return fetchProduct(Number.parseInt(productId))
  }, [productId]);

  const product = use(productPromise);
  return <ProductContent product={product} productId={productId} />;
}

// Loading component
function LoadingUI() {
  return (
    <div className="min-h-screen bg-gray-50">
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
        <p>Loading product details...</p>
      </div>
    </div>
  )
}

function ProductContent({ product, productId }: { product: Product, productId: string }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [cartItems, setCartItems] = useState<number[]>([])
  const [pincode, setPincode] = useState("")
  const [deliveryAvailable, setDeliveryAvailable] = useState<boolean | null>(null)
  const [userReviews, setUserReviews] = useState<UserReview[]>([])
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: "",
    comment: "",
    pros: "",
    cons: "",
  })
  const [showReviewForm, setShowReviewForm] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Get cart and wishlist data
    const savedCart = localStorage.getItem("cart")
    const savedWishlist = localStorage.getItem("wishlist")
    if (savedCart) setCartItems(JSON.parse(savedCart))
    if (savedWishlist) {
      const wishlist = JSON.parse(savedWishlist)
      setIsWishlisted(wishlist.includes(Number.parseInt(productId)))
    }

    // Load user reviews
    const savedReviews = localStorage.getItem(`reviews_${productId}`)
    if (savedReviews) {
      setUserReviews(JSON.parse(savedReviews))
    }
  }, [productId])

  const calculateAverageRating = () => {
    if (userReviews.length === 0) return product?.rating || 0
    const total = userReviews.reduce((sum, review) => sum + review.rating, 0)
    return (total / userReviews.length).toFixed(1)
  }

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    userReviews.forEach((review) => {
      distribution[review.rating as keyof typeof distribution]++
    })
    return distribution
  }

  const discountedPrice = getDiscountedPrice(product.price, product.discountPercentage)
  const productImages = product.images && product.images.length > 0 ? product.images : [product.thumbnail]
  const averageRating = calculateAverageRating()
  const ratingDistribution = getRatingDistribution()
  const totalReviews = userReviews.length + (product.reviews?.length || 0)

  const submitReview = () => {
    if (!newReview.title.trim() || !newReview.comment.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const review: UserReview = {
      id: Date.now().toString(),
      userName: "Anonymous User", // In real app, get from auth
      rating: newReview.rating,
      title: newReview.title,
      comment: newReview.comment,
      date: new Date().toISOString(),
      verified: true,
      helpful: 0,
      pros: newReview.pros ? newReview.pros.split(",").map((p) => p.trim()) : [],
      cons: newReview.cons ? newReview.cons.split(",").map((c) => c.trim()) : [],
    }

    const updatedReviews = [review, ...userReviews]
    setUserReviews(updatedReviews)
    localStorage.setItem(`reviews_${use(params).id}`, JSON.stringify(updatedReviews))

    // Reset form
    setNewReview({
      rating: 5,
      title: "",
      comment: "",
      pros: "",
      cons: "",
    })
    setShowReviewForm(false)

    toast({
      title: "Review Submitted",
      description: "Thank you for your review!",
    })
  }

  const addToCart = () => {
    if (!product) return
    const productId = product.id
    const newCart = [...cartItems]
    for (let i = 0; i < quantity; i++) {
      newCart.push(productId)
    }
    setCartItems(newCart)
    localStorage.setItem("cart", JSON.stringify(newCart))
    toast({
      title: "Added to Cart",
      description: `${quantity} item(s) added to your cart`,
    })
  }

  const buyNow = () => {
    if (!product) {
      toast({
        title: "Error",
        description: "Product not found. Please try again.",
        variant: "destructive",
      })
      return
    }

    try {
      // Create product data for cart
      const cartProduct = {
        id: product.id.toString(),
        name: product.title,
        price: getDiscountedPrice(product.price, product.discountPercentage),
        image: product.thumbnail,
        quantity: quantity,
      }

      // Get existing cart or create new one
      const existingCart = localStorage.getItem("cart")
      let cartProducts = []

      if (existingCart) {
        try {
          cartProducts = JSON.parse(existingCart)
          if (!Array.isArray(cartProducts)) {
            cartProducts = []
          }
        } catch (error) {
          console.error("Error parsing cart:", error)
          cartProducts = []
        }
      }

      // Check if product already exists in cart
      const existingProductIndex = cartProducts.findIndex((item: any) => item.id === cartProduct.id)

      if (existingProductIndex >= 0) {
        // Update quantity if product exists
        cartProducts[existingProductIndex].quantity += quantity
      } else {
        // Add new product to cart
        cartProducts.push(cartProduct)
      }

      // Save to localStorage
      localStorage.setItem("cart", JSON.stringify(cartProducts))

      toast({
        title: "Added to Cart",
        description: `${quantity} item(s) added. Redirecting to checkout...`,
      })

      // Redirect to checkout after a brief delay
      setTimeout(() => {
        window.location.href = "/checkout"
      }, 1000)
    } catch (error) {
      console.error("Error in buyNow:", error)
      toast({
        title: "Error",
        description: "Failed to add product to cart. Please try again.",
        variant: "destructive",
      })
    }
  }

  const toggleWishlist = () => {
    if (!product) return
    const productId = product.id
    const savedWishlist = localStorage.getItem("wishlist")
    let wishlist = savedWishlist ? JSON.parse(savedWishlist) : []

    if (isWishlisted) {
      wishlist = wishlist.filter((id: number) => id !== productId)
    } else {
      wishlist.push(productId)
    }

    setIsWishlisted(!isWishlisted)
    localStorage.setItem("wishlist", JSON.stringify(wishlist))
    toast({
      title: isWishlisted ? "Removed from Wishlist" : "Added to Wishlist",
      description: isWishlisted ? "Product removed from wishlist" : "Product added to wishlist",
    })
  }

  const checkDelivery = () => {
    if (pincode.length === 6) {
      setDeliveryAvailable(true)
      toast({
        title: "Delivery Available",
        description: `Delivery available to ${pincode}`,
      })
    } else {
      setDeliveryAvailable(false)
      toast({
        title: "Invalid Pincode",
        description: "Please enter a valid 6-digit pincode",
        variant: "destructive",
      })
    }
  }

  const shareProduct = () => {
    if (navigator.share && product) {
      navigator.share({
        title: product.title,
        text: `Check out this ${product.title}`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link Copied",
        description: "Product link copied to clipboard",
      })
    }
  }

  const nextImage = () => {
    if (!product) return
    setSelectedImage(selectedImage < product.images.length - 1 ? selectedImage + 1 : 0)
  }

  const prevImage = () => {
    if (!product) return
    setSelectedImage(selectedImage > 0 ? selectedImage - 1 : product.images.length - 1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
            <div className="flex items-center gap-4">
              <Link href="/wishlist">
                <Button variant="ghost" size="sm" className="text-white hover:bg-blue-700">
                  <Heart className="w-5 h-5" />
                </Button>
              </Link>
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
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-blue-600">
            Products
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/category/${product.category}`} className="hover:text-blue-600">
            {product.category}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Product Images */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-lg p-4">
              <div className="relative mb-4">
                <Image
                  src={productImages[selectedImage] || "/placeholder.svg?height=500&width=500"}
                  alt={product.title}
                  width={500}
                  height={500}
                  className="w-full h-96 object-contain rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg?height=500&width=500"
                  }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-4 right-4 bg-white/80 hover:bg-white"
                  onClick={shareProduct}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
                {productImages.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                      onClick={nextImage}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
              {productImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {productImages.map((image, index) => (
                    <Image
                      key={index}
                      src={image || "/placeholder.svg?height=80&width=80"}
                      alt={`${product.title} ${index + 1}`}
                      width={80}
                      height={80}
                      className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 flex-shrink-0 ${
                        selectedImage === index ? "border-blue-500" : "border-gray-200"
                      }`}
                      onClick={() => setSelectedImage(index)}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=80&width=80"
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-lg p-6">
              <div className="mb-4">
                {product.brand && <p className="text-gray-500 text-sm mb-1">Brand: {product.brand}</p>}
                <h1 className="text-2xl font-bold mb-3">{product.title}</h1>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded text-sm">
                      <span className="font-semibold">{averageRating}</span>
                      <Star className="w-3 h-3 fill-white" />
                    </div>
                    <span className="text-gray-500 text-sm">({totalReviews} reviews)</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {product.stock > 50 ? "In Stock" : product.stock > 0 ? "Limited Stock" : "Out of Stock"}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <span className="text-3xl font-bold">{formatPrice(discountedPrice)}</span>
                  {product.discountPercentage > 0 && (
                    <>
                      <span className="text-xl text-gray-500 line-through">{formatPrice(product.price)}</span>
                      <Badge variant="destructive" className="text-sm">
                        {Math.round(product.discountPercentage)}% OFF
                      </Badge>
                    </>
                  )}
                </div>

                {/* Key Features */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Key Features</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Brand: {product.brand || "Premium Quality"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Category: {product.category}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Rating: {product.rating}/5 Stars</span>
                    </div>
                    {product.tags &&
                      product.tags.slice(0, 3).map((tag, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>{tag}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="font-medium">Quantity:</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center font-semibold">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={quantity >= 10 || quantity >= product.stock}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Button
                      onClick={addToCart}
                      className="flex-1 bg-orange-500 hover:bg-orange-600"
                      size="lg"
                      disabled={product.stock === 0}
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      ADD TO CART
                    </Button>
                    <Button onClick={toggleWishlist} variant="outline" size="lg">
                      <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
                    </Button>
                  </div>
                  <Button
                    onClick={buyNow}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                    disabled={product.stock === 0}
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    BUY NOW
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery & Services */}
          <div className="lg:col-span-3">
            <div className="space-y-4">
              {/* Delivery Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Truck className="w-5 h-5" />
                    Delivery Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter pincode"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      maxLength={6}
                    />
                    <Button onClick={checkDelivery}>Check</Button>
                  </div>
                  {deliveryAvailable !== null && (
                    <div
                      className={`p-3 rounded-lg ${
                        deliveryAvailable ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                      }`}
                    >
                      {deliveryAvailable ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            <span className="font-medium">Delivery Available</span>
                          </div>
                          <div className="text-sm space-y-1">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              <span>Get it by Tomorrow</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Truck className="w-3 h-3" />
                              <span>FREE Delivery</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>✗ Delivery not available to this pincode</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Services */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Services</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span>1 Year Manufacturer Warranty</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <RotateCcw className="w-4 h-4 text-blue-600" />
                    <span>7 Days Return Policy</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span>Cash on Delivery Available</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Award className="w-4 h-4 text-blue-600" />
                    <span>Flipkart Assured Product</span>
                  </div>
                </CardContent>
              </Card>

              {/* Offers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Percent className="w-5 h-5" />
                    Available Offers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3 text-sm">
                    <Gift className="w-4 h-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Bank Offer</p>
                      <p className="text-gray-600">10% off on HDFC Bank Cards</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <Gift className="w-4 h-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Special Price</p>
                      <p className="text-gray-600">Get extra ₹500 off (price inclusive of discount)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <Gift className="w-4 h-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">No Cost EMI</p>
                      <p className="text-gray-600">₹1,667/month. Standard EMI also available</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({totalReviews})</TabsTrigger>
              <TabsTrigger value="qa">Q&A</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Product Description</h3>
                  <p className="text-gray-700 mb-6 leading-relaxed">{product.description}</p>

                  {product.tags && product.tags.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold mb-3">Product Tags:</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-sm">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Key Highlights</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Premium Quality Materials</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Durable and Long-lasting</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Easy to Use and Maintain</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Excellent Value for Money</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">What's in the Box</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <span>• 1 x {product.title}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span>• User Manual</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span>• Warranty Card</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span>• Accessories (if applicable)</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Product Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg">General</h4>
                      <div className="space-y-3">
                        {product.brand && (
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="font-medium text-gray-600">Brand:</span>
                            <span className="text-gray-900">{product.brand}</span>
                          </div>
                        )}
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="font-medium text-gray-600">Category:</span>
                          <span className="text-gray-900">{product.category}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="font-medium text-gray-600">Model:</span>
                          <span className="text-gray-900">{product.title}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="font-medium text-gray-600">Stock:</span>
                          <span className="text-gray-900">{product.stock} units</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg">Features</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="font-medium text-gray-600">Rating:</span>
                          <span className="text-gray-900">{product.rating}/5</span>
                        </div>
                        {product.discountPercentage > 0 && (
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="font-medium text-gray-600">Discount:</span>
                            <span className="text-gray-900">{Math.round(product.discountPercentage)}%</span>
                          </div>
                        )}
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="font-medium text-gray-600">Warranty:</span>
                          <span className="text-gray-900">1 Year</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="font-medium text-gray-600">Return Policy:</span>
                          <span className="text-gray-900">7 Days</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                {/* Rating Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Reviews & Ratings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold mb-2">{averageRating}</div>
                        <div className="flex items-center justify-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < Math.floor(Number(averageRating))
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-gray-600">{totalReviews} reviews</p>
                      </div>
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <div key={rating} className="flex items-center gap-2">
                            <span className="text-sm w-2">{rating}</span>
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <Progress
                              value={
                                (ratingDistribution[rating as keyof typeof ratingDistribution] /
                                  Math.max(userReviews.length, 1)) *
                                100
                              }
                              className="flex-1 h-2"
                            />
                            <span className="text-sm text-gray-600 w-8">
                              {ratingDistribution[rating as keyof typeof ratingDistribution]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Write Review */}
                <Card>
                  <CardHeader>
                    <CardTitle>Write a Review</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!showReviewForm ? (
                      <Button onClick={() => setShowReviewForm(true)} className="w-full">
                        Write a Review
                      </Button>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Rating</label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <Star
                                key={rating}
                                className={`w-6 h-6 cursor-pointer ${
                                  rating <= newReview.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                }`}
                                onClick={() => setNewReview({ ...newReview, rating })}
                              />
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Review Title</label>
                          <Input
                            placeholder="Summarize your review"
                            value={newReview.title}
                            onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Review</label>
                          <Textarea
                            placeholder="Write your detailed review here..."
                            value={newReview.comment}
                            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                            rows={4}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Pros (comma separated)</label>
                            <Input
                              placeholder="Great quality, fast delivery"
                              value={newReview.pros}
                              onChange={(e) => setNewReview({ ...newReview, pros: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Cons (comma separated)</label>
                            <Input
                              placeholder="Expensive, packaging"
                              value={newReview.cons}
                              onChange={(e) => setNewReview({ ...newReview, cons: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={submitReview}>Submit Review</Button>
                          <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* User Reviews */}
                {userReviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage src={review.userAvatar || "/placeholder.svg"} />
                          <AvatarFallback>{review.userName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{review.userName}</span>
                            {review.verified && (
                              <Badge variant="secondary" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified Purchase
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString()}</span>
                          </div>
                          <h4 className="font-semibold mb-2">{review.title}</h4>
                          <p className="text-gray-700 mb-3">{review.comment}</p>

                          {review.pros && review.pros.length > 0 && (
                            <div className="mb-3">
                              <p className="text-sm font-medium text-green-700 mb-1">Pros:</p>
                              <ul className="text-sm text-green-600">
                                {review.pros.map((pro, index) => (
                                  <li key={index}>• {pro}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {review.cons && review.cons.length > 0 && (
                            <div className="mb-3">
                              <p className="text-sm font-medium text-red-700 mb-1">Cons:</p>
                              <ul className="text-sm text-red-600">
                                {review.cons.map((con, index) => (
                                  <li key={index}>• {con}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-sm">
                            <Button variant="ghost" size="sm" className="text-gray-600">
                              <ThumbsUp className="w-4 h-4 mr-1" />
                              Helpful ({review.helpful})
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-600">
                              <ThumbsDown className="w-4 h-4 mr-1" />
                              Not Helpful
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Original API Reviews */}
                {product.reviews &&
                  product.reviews.map((review, index) => (
                    <Card key={`api-${index}`}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar>
                            <AvatarFallback>{review.reviewerName[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium">{review.reviewerName}</span>
                              <Badge variant="secondary" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified Purchase
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(review.date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700 mb-3">{review.comment}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <Button variant="ghost" size="sm" className="text-gray-600">
                                <ThumbsUp className="w-4 h-4 mr-1" />
                                Helpful
                              </Button>
                              <Button variant="ghost" size="sm" className="text-gray-600">
                                <ThumbsDown className="w-4 h-4 mr-1" />
                                Not Helpful
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="qa" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Questions & Answers</h3>
                  <div className="space-y-6">
                    <div className="border-b pb-4">
                      <h4 className="font-medium mb-2">Q: Is this product genuine?</h4>
                      <p className="text-gray-600 text-sm mb-2">
                        A: Yes, this is 100% genuine product with manufacturer warranty.
                      </p>
                      <p className="text-xs text-gray-500">Answered by Flipkart Customer Care</p>
                    </div>
                    <div className="border-b pb-4">
                      <h4 className="font-medium mb-2">Q: What is the return policy?</h4>
                      <p className="text-gray-600 text-sm mb-2">
                        A: You can return this product within 7 days of delivery for a full refund.
                      </p>
                      <p className="text-xs text-gray-500">Answered by Flipkart Customer Care</p>
                    </div>
                    <div className="border-b pb-4">
                      <h4 className="font-medium mb-2">Q: Is cash on delivery available?</h4>
                      <p className="text-gray-600 text-sm mb-2">
                        A: Yes, cash on delivery is available for this product.
                      </p>
                      <p className="text-xs text-gray-500">Answered by Flipkart Customer Care</p>
                    </div>
                  </div>
                  <Button className="mt-6">Ask a Question</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Product Recommendations */}
        <div className="mt-12">
          <ProductRecommendations currentProductId={product.id} category={product.category} />
        </div>
      </div>
    </div>
  )
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  // Memoize the params promise
  const paramsPromise = useMemo(() => Promise.resolve(params), [params]);
  const unwrappedParams = use(paramsPromise);
  
  return (
    <Suspense fallback={<LoadingUI />}>
      <ProductData productId={unwrappedParams.id} />
    </Suspense>
  )
}
