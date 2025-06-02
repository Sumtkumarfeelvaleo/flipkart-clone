"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { searchProducts, type Product } from "@/lib/api"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface SearchBarProps {
  onSearch?: (query: string) => void
  className?: string
}

export function SearchBar({ onSearch, className }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.trim().length > 2) {
        setIsLoading(true)
        try {
          const results = await searchProducts(query, 5)
          setSuggestions(results.products)
          setShowSuggestions(true)
        } catch (error) {
          console.error("Search error:", error)
          setSuggestions([])
        } finally {
          setIsLoading(false)
        }
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 300)

    return () => clearTimeout(searchTimeout)
  }, [query])

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query
    if (finalQuery.trim()) {
      setShowSuggestions(false)
      if (onSearch) {
        onSearch(finalQuery)
      } else {
        router.push(`/search?q=${encodeURIComponent(finalQuery)}`)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const selectSuggestion = (product: Product) => {
    setQuery(product.title)
    setShowSuggestions(false)
    router.push(`/product/${product.id}`)
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2">
        <Search className="w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search for products, brands and more"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="border-0 focus-visible:ring-0 text-black"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("")
              setSuggestions([])
              setShowSuggestions(false)
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Search Suggestions */}
      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-2">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Searching...</div>
            ) : (
              <div className="space-y-1">
                {suggestions.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded cursor-pointer"
                    onClick={() => selectSuggestion(product)}
                  >
                    <Image
                      src={product.thumbnail || "/placeholder.svg"}
                      alt={product.title}
                      width={40}
                      height={40}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.title}</p>
                      <p className="text-xs text-gray-500">{product.category}</p>
                    </div>
                    <div className="text-sm font-semibold">${product.price}</div>
                  </div>
                ))}
                <div
                  className="p-2 text-center text-blue-600 hover:bg-gray-100 rounded cursor-pointer text-sm"
                  onClick={() => handleSearch()}
                >
                  View all results for "{query}"
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
