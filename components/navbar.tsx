"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ShoppingCart, ChevronDown, Menu, X, Search, User, Heart, MapPin, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import Image from "next/image"

export function Navbar() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [cartCount, setCartCount] = useState(0)
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const popularSearches = [
    "iPhone 15",
    "Samsung Galaxy",
    "MacBook",
    "Nike Shoes",
    "Adidas",
    "Washing Machine",
    "Refrigerator",
    "Smart TV",
    "Headphones",
    "Laptop",
  ]

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        const cartItems = JSON.parse(savedCart)
        setCartCount(cartItems.length)
      }
    }
  }, [])

  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = popularSearches.filter((item) => item.toLowerCase().includes(searchQuery.toLowerCase()))
      setSearchSuggestions(filtered.slice(0, 5))
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }, [searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setShowSuggestions(false)
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion)
    setShowSuggestions(false)
    window.location.href = `/search?q=${encodeURIComponent(suggestion)}`
  }

  return (
    <>
      {/* Desktop & Mobile Navbar */}
      <header className="sticky top-0 z-50 bg-[#2874f0] text-white shadow-lg">
        <div className="w-full px-2 sm:px-3 lg:px-4">
          {/* Main Navigation */}
          <div className="flex items-center justify-between h-12 sm:h-14">
            {/* Logo - Responsive sizing */}
            <Link href="/" className="flex flex-col min-w-0 flex-shrink-0">
              <div className="flex items-center">
                <span className="text-sm sm:text-lg lg:text-xl font-bold italic text-white truncate">Flipkart</span>
                <div className="hidden xs:flex items-center ml-1">
                  <span className="text-[9px] sm:text-[10px] lg:text-[11px] italic text-yellow-300">Explore</span>
                  <span className="text-[9px] sm:text-[10px] lg:text-[11px] italic text-yellow-300 font-semibold ml-0.5">
                    Plus
                  </span>
                  <Image src="/placeholder.svg?height=8&width=8" alt="Plus" width={6} height={6} className="ml-0.5" />
                </div>
              </div>
            </Link>

            {/* Search Bar - Desktop Only */}
            <div className="hidden lg:flex flex-1 max-w-xl mx-4 relative">
              <form onSubmit={handleSearch} className="w-full flex relative">
                <Input
                  type="text"
                  placeholder="Search for products, brands and more"
                  className="w-full h-8 lg:h-9 rounded-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-white text-black text-sm pl-3 lg:pl-4 pr-10 lg:pr-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length > 0 && setShowSuggestions(true)}
                />
                <Button
                  type="submit"
                  className="absolute right-0 top-0 h-8 lg:h-9 px-2 lg:px-4 rounded-sm bg-white hover:bg-gray-100 text-[#2874f0] border-0"
                  variant="ghost"
                >
                  <Search className="h-3 w-3 lg:h-4 lg:w-4" />
                </Button>
              </form>

              {/* Search Suggestions */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-md shadow-lg z-50 max-h-60 overflow-y-auto">
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="w-full text-left px-3 lg:px-4 py-2 hover:bg-gray-50 text-black text-sm border-b border-gray-100 last:border-b-0"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <Search className="h-3 w-3 inline mr-2 text-gray-400" />
                      {suggestion}
                    </button>
                  ))}
                  {searchSuggestions.length === 0 && (
                    <div className="px-3 lg:px-4 py-2 text-gray-500 text-sm">No suggestions found</div>
                  )}
                </div>
              )}
            </div>

            {/* Desktop Navigation Items */}
            <nav className="hidden lg:flex items-center space-x-3 xl:space-x-6">
              {/* Login */}
              <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-blue-700 h-8 px-2 xl:px-3 text-xs xl:text-sm font-medium"
                  >
                    <User className="h-3 w-3 xl:h-4 xl:w-4 mr-1" />
                    Login
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-md mx-auto">
                  <DialogHeader>
                    <DialogTitle className="text-lg xl:text-xl">Login</DialogTitle>
                    <DialogDescription className="text-sm">
                      Get access to your Orders, Wishlist and Recommendations
                    </DialogDescription>
                  </DialogHeader>
                  <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="login" className="text-xs sm:text-sm">
                        Login
                      </TabsTrigger>
                      <TabsTrigger value="signup" className="text-xs sm:text-sm">
                        Signup
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="login" className="space-y-3 sm:space-y-4 py-4">
                      <div className="space-y-3 sm:space-y-4">
                        <Input type="email" placeholder="Enter Email/Mobile number" className="h-10 sm:h-12 text-sm" />
                        <Input type="password" placeholder="Enter Password" className="h-10 sm:h-12 text-sm" />
                        <p className="text-xs text-gray-500">
                          By continuing, you agree to Flipkart's Terms of Use and Privacy Policy.
                        </p>
                        <Button className="w-full h-10 sm:h-12 bg-[#fb641b] hover:bg-[#fb641b]/90 font-medium text-sm">
                          Login
                        </Button>
                        <div className="text-center text-sm text-[#2874f0] font-medium">OR</div>
                        <Button
                          variant="outline"
                          className="w-full h-10 sm:h-12 text-[#2874f0] border-[#2874f0] text-sm"
                        >
                          Request OTP
                        </Button>
                      </div>
                    </TabsContent>
                    <TabsContent value="signup" className="space-y-3 sm:space-y-4 py-4">
                      <div className="space-y-3 sm:space-y-4">
                        <Input type="text" placeholder="Enter Name" className="h-10 sm:h-12 text-sm" />
                        <Input type="tel" placeholder="Enter Mobile number" className="h-10 sm:h-12 text-sm" />
                        <Input type="email" placeholder="Enter Email" className="h-10 sm:h-12 text-sm" />
                        <Input type="password" placeholder="Create Password" className="h-10 sm:h-12 text-sm" />
                        <p className="text-xs text-gray-500">
                          By continuing, you agree to Flipkart's Terms of Use and Privacy Policy.
                        </p>
                        <Button className="w-full h-10 sm:h-12 bg-[#fb641b] hover:bg-[#fb641b]/90 font-medium text-sm">
                          Continue
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>

              {/* Become a Seller */}
              <Link href="#" className="text-white hover:underline text-xs xl:text-sm font-medium whitespace-nowrap">
                Become a Seller
              </Link>

              {/* More Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-blue-700 h-8 px-2 xl:px-3 text-xs xl:text-sm font-medium"
                  >
                    More <ChevronDown className="h-2 w-2 xl:h-3 xl:w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 sm:w-56">
                  <DropdownMenuItem>
                    <Gift className="h-4 w-4 mr-2" />
                    <Link href="#" className="flex items-center w-full text-sm">
                      Gift Cards
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <MapPin className="h-4 w-4 mr-2" />
                    <Link href="#" className="flex items-center w-full text-sm">
                      Track Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="#" className="flex items-center w-full text-sm">
                      Notification Preferences
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="#" className="flex items-center w-full text-sm">
                      24x7 Customer Care
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="#" className="flex items-center w-full text-sm">
                      Advertise
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="#" className="flex items-center w-full text-sm">
                      Download App
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Cart */}
              <Link href="/cart" className="flex items-center text-white hover:bg-blue-700 px-2 xl:px-3 py-2 rounded">
                <div className="relative mr-1">
                  <ShoppingCart className="h-3 w-3 xl:h-4 xl:w-4" />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-[#ff6161] text-white text-xs h-3 w-3 xl:h-4 xl:w-4 flex items-center justify-center p-0 rounded-full">
                      {cartCount > 99 ? "99+" : cartCount}
                    </Badge>
                  )}
                </div>
                <span className="text-xs xl:text-sm font-medium">Cart</span>
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden items-center space-x-1 sm:space-x-2">
              <Link href="/wishlist" className="p-1.5 sm:p-2">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
              <Link href="/cart" className="relative p-1.5 sm:p-2">
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-0.5 -right-0.5 sm:top-0 sm:right-0 bg-[#ff6161] text-white text-xs h-4 w-4 flex items-center justify-center p-0 rounded-full">
                    {cartCount > 9 ? "9+" : cartCount}
                  </Badge>
                )}
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="text-white p-1 hover:bg-blue-700"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="lg:hidden pb-2 sm:pb-3 relative">
            <form onSubmit={handleSearch} className="flex relative">
              <Input
                type="text"
                placeholder="Search for products, brands and more"
                className="w-full h-8 sm:h-9 rounded-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-white text-black text-xs sm:text-sm pl-3 pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length > 0 && setShowSuggestions(true)}
              />
              <Button
                type="submit"
                className="absolute right-0 top-0 h-8 sm:h-9 px-2 sm:px-3 rounded-sm bg-white hover:bg-gray-100 text-[#2874f0] border-0"
                variant="ghost"
              >
                <Search className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </form>

            {/* Mobile Search Suggestions */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-md shadow-lg z-50 max-h-48 sm:max-h-60 overflow-y-auto">
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-black text-xs sm:text-sm border-b border-gray-100 last:border-b-0"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <Search className="h-3 w-3 inline mr-2 text-gray-400" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white text-black border-t border-gray-200">
            <div className="flex flex-col">
              <Button
                variant="ghost"
                className="justify-start rounded-none h-10 sm:h-12 px-3 sm:px-4 hover:bg-gray-50 text-gray-800 border-b border-gray-100 text-sm"
                onClick={() => {
                  setIsLoginOpen(true)
                  setIsMobileMenuOpen(false)
                }}
              >
                <User className="h-4 w-4 mr-3" />
                Login & Signup
              </Button>
              <Link
                href="#"
                className="flex items-center h-10 sm:h-12 px-3 sm:px-4 hover:bg-gray-50 border-b border-gray-100 text-sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="text-gray-800">Become a Seller</span>
              </Link>
              <Link
                href="#"
                className="flex items-center h-10 sm:h-12 px-3 sm:px-4 hover:bg-gray-50 border-b border-gray-100 text-sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Gift className="h-4 w-4 mr-3" />
                <span className="text-gray-800">Gift Cards</span>
              </Link>
              <Link
                href="#"
                className="flex items-center h-10 sm:h-12 px-3 sm:px-4 hover:bg-gray-50 border-b border-gray-100 text-sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <MapPin className="h-4 w-4 mr-3" />
                <span className="text-gray-800">Track Orders</span>
              </Link>
              <Link
                href="#"
                className="flex items-center h-10 sm:h-12 px-3 sm:px-4 hover:bg-gray-50 border-b border-gray-100 text-sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="text-gray-800">24x7 Customer Care</span>
              </Link>
              <Link
                href="#"
                className="flex items-center h-10 sm:h-12 px-3 sm:px-4 hover:bg-gray-50 text-sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="text-gray-800">Download App</span>
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
