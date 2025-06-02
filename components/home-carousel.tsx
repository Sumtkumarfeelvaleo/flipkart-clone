"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface CarouselItem {
  id: number
  imageUrl: string
  alt: string
  link: string
}

export function HomeCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const carouselItems: CarouselItem[] = [
    {
      id: 1,
      imageUrl: "https://rukminim2.flixcart.com/fk-p-flap/1620/790/image/e23696de917283c9.jpg?q=20",
      alt: "Payday Sale - Stock up on essentials, Get ₹250 Off on groceries",
      link: "/category/grocery",
    },
    {
      id: 2,
      imageUrl: "https://rukminim2.flixcart.com/fk-p-flap/1620/790/image/50c02a3dd659a3c7.jpg?q=20",
      alt: "Electronics Fest - Up to 80% Off on Smartphones, Laptops & More",
      link: "/category/electronics",
    },
    {
      id: 3,
      imageUrl: "https://rukminim2.flixcart.com/fk-p-flap/1620/790/image/4cd6690ef44564f3.jpg?q=20",
      alt: "Fashion Sale - Min 50% Off on Clothing, Footwear & Accessories",
      link: "/category/fashion",
    },
    {
      id: 4,
      imageUrl: "https://rukminim2.flixcart.com/fk-p-flap/1620/790/image/2a783dd42e7ad3e3.jpg?q=20",
      alt: "Home & Kitchen - Up to 70% Off on Appliances & Home Decor",
      link: "/category/home",
    },
    {
      id: 5,
      imageUrl: "https://rukminim2.flixcart.com/fk-p-flap/1620/790/image/7fd0e4ab26429926.jpg?q=20",
      alt: "Big Billion Days - Biggest Sale of the Year with Mega Discounts",
      link: "/products",
    },
  ]

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isAutoPlaying) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev === carouselItems.length - 1 ? 0 : prev + 1))
      }, 4000)
    }

    return () => clearInterval(interval)
  }, [isAutoPlaying, carouselItems.length])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 8000)
  }

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? carouselItems.length - 1 : prev - 1))
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 8000)
  }

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev === carouselItems.length - 1 ? 0 : prev + 1))
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 8000)
  }

  return (
    <div className="relative overflow-hidden bg-gray-100 rounded-lg mx-2 md:mx-4 my-2">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {carouselItems.map((item) => (
          <div key={item.id} className="w-full flex-shrink-0">
            <a href={item.link} className="block">
              <Image
                src={item.imageUrl || "/placeholder.svg"}
                alt={item.alt}
                width={1620}
                height={400}
                className="w-full h-[180px] sm:h-[220px] md:h-[280px] lg:h-[350px] xl:h-[400px] object-cover rounded-lg"
                priority={item.id === 1}
                crossOrigin="anonymous"
              />
            </a>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-white/95 hover:bg-white text-gray-800 rounded-full h-8 w-8 md:h-10 md:w-10 shadow-lg transition-all duration-200 hover:scale-110 border border-gray-200"
        onClick={goToPrevSlide}
      >
        <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-white/95 hover:bg-white text-gray-800 rounded-full h-8 w-8 md:h-10 md:w-10 shadow-lg transition-all duration-200 hover:scale-110 border border-gray-200"
        onClick={goToNextSlide}
      >
        <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
      </Button>

      {/* Indicators */}
      <div className="absolute bottom-3 md:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {carouselItems.map((_, index) => (
          <button
            key={index}
            className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${
              currentSlide === index ? "w-6 md:w-8 bg-white shadow-lg" : "w-1.5 md:w-2 bg-white/60 hover:bg-white/80"
            }`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>

      {/* Sale Badge */}
      <div className="absolute top-3 md:top-4 left-3 md:left-4 bg-red-500 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold shadow-lg animate-pulse">
        LIVE SALE
      </div>
    </div>
  )
}
