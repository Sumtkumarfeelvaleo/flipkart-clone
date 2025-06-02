"use client"

import { useState, useEffect } from "react"
import { X, Star, Check, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { fetchProduct, formatPrice, type Product } from "@/lib/api"

interface ProductComparisonProps {
  isOpen: boolean
  onClose: () => void
  productIds: number[]
  onRemoveProduct: (productId: number) => void
}

export function ProductComparison({ isOpen, onClose, productIds, onRemoveProduct }: ProductComparisonProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen && productIds.length > 0) {
      loadProducts()
    }
  }, [isOpen, productIds])

  const loadProducts = async () => {
    setIsLoading(true)
    try {
      const productPromises = productIds.map((id) => fetchProduct(id))
      const loadedProducts = await Promise.all(productPromises)
      setProducts(loadedProducts)
    } catch (error) {
      console.error("Error loading products for comparison:", error)
      toast({
        title: "Error",
        description: "Failed to load products for comparison",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addToCart = (productId: number) => {
    const savedCart = localStorage.getItem("cart")
    const cart = savedCart ? JSON.parse(savedCart) : []
    cart.push(productId)
    localStorage.setItem("cart", JSON.stringify(cart))
    toast({
      title: "Added to Cart",
      description: "Product has been added to your cart",
    })
  }

  const getComparisonFeatures = () => {
    if (products.length === 0) return []

    return [
      { key: "price", label: "Price", type: "price" },
      { key: "rating", label: "Rating", type: "rating" },
      { key: "stock", label: "Stock", type: "number" },
      { key: "brand", label: "Brand", type: "text" },
      { key: "category", label: "Category", type: "text" },
      { key: "discountPercentage", label: "Discount", type: "percentage" },
    ]
  }

  const renderFeatureValue = (product: Product, feature: any) => {
    const value = product[feature.key as keyof Product]

    switch (feature.type) {
      case "price":
        return <span className="font-bold text-green-600">{formatPrice(value as number)}</span>
      case "rating":
        return (
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>{value}</span>
          </div>
        )
      case "percentage":
        return value > 0 ? <Badge variant="destructive">{Math.round(value as number)}% OFF</Badge> : <span>-</span>
      case "number":
        return <span>{value}</span>
      default:
        return <span>{value || "-"}</span>
    }
  }

  const getBestValue = (feature: any) => {
    if (products.length === 0) return null

    switch (feature.key) {
      case "price":
        return Math.min(...products.map((p) => p.price))
      case "rating":
        return Math.max(...products.map((p) => p.rating))
      case "stock":
        return Math.max(...products.map((p) => p.stock))
      case "discountPercentage":
        return Math.max(...products.map((p) => p.discountPercentage))
      default:
        return null
    }
  }

  const isBestValue = (product: Product, feature: any) => {
    const bestValue = getBestValue(feature)
    if (bestValue === null) return false

    const productValue = product[feature.key as keyof Product]
    return productValue === bestValue
  }

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading comparison...</span>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Product Comparison ({products.length} products)</DialogTitle>
        </DialogHeader>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No products to compare</p>
            <Button onClick={onClose} className="mt-4">
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Product Images and Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-4">
                    <div className="relative">
                      <Image
                        src={product.thumbnail || "/placeholder.svg"}
                        alt={product.title}
                        width={200}
                        height={200}
                        className="w-full h-48 object-cover rounded-lg mb-3"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 bg-white/80"
                        onClick={() => onRemoveProduct(product.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <h3 className="font-semibold mb-2 line-clamp-2">{product.title}</h3>
                    <div className="space-y-2">
                      <Button onClick={() => addToCart(product.id)} className="w-full" size="sm">
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Comparison Table */}
            <Card>
              <CardHeader>
                <CardTitle>Feature Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-medium">Feature</th>
                        {products.map((product) => (
                          <th key={product.id} className="text-center p-2 font-medium min-w-[150px]">
                            {product.title.substring(0, 20)}...
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {getComparisonFeatures().map((feature) => (
                        <tr key={feature.key} className="border-b">
                          <td className="p-2 font-medium">{feature.label}</td>
                          {products.map((product) => (
                            <td key={product.id} className="p-2 text-center">
                              <div
                                className={`${isBestValue(product, feature) ? "bg-green-100 rounded px-2 py-1" : ""}`}
                              >
                                {renderFeatureValue(product, feature)}
                                {isBestValue(product, feature) && (
                                  <Check className="w-4 h-4 text-green-600 inline ml-1" />
                                )}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Pros and Cons */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <Card key={product.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{product.title.substring(0, 30)}...</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-green-600 mb-2 flex items-center gap-1">
                          <Plus className="w-4 h-4" />
                          Pros
                        </h4>
                        <ul className="text-sm space-y-1">
                          {product.rating >= 4.5 && <li>• High customer rating</li>}
                          {product.discountPercentage > 20 && <li>• Great discount available</li>}
                          {product.stock > 50 && <li>• Good stock availability</li>}
                          {product.brand && <li>• Trusted brand</li>}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-red-600 mb-2 flex items-center gap-1">
                          <Minus className="w-4 h-4" />
                          Cons
                        </h4>
                        <ul className="text-sm space-y-1">
                          {product.rating < 3 && <li>• Low customer rating</li>}
                          {product.stock < 10 && <li>• Limited stock</li>}
                          {product.discountPercentage < 5 && <li>• Minimal discount</li>}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
