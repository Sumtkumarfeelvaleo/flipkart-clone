"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { fetchCategories, formatCategoryName } from "@/lib/api"

interface CategoryItem {
  slug: string
  name: string
  icon: string
}

export function CategoryBar() {
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await fetchCategories()

        // Predefined categories with better icons for Flipkart-like experience
        const predefinedCategories = [
          { slug: "smartphones", name: "Mobiles", icon: "📱" },
          { slug: "laptops", name: "Laptops", icon: "💻" },
          { slug: "home-decoration", name: "Home & Furniture", icon: "🏠" },
          { slug: "mens-shirts", name: "Fashion", icon: "👕" },
          { slug: "groceries", name: "Grocery", icon: "🛒" },
          { slug: "beauty", name: "Beauty", icon: "💄" },
          { slug: "sports-accessories", name: "Sports", icon: "⚽" },
          { slug: "automotive", name: "Automotive", icon: "🚗" },
          { slug: "kitchen-accessories", name: "Appliances", icon: "🔌" },
        ]

        // Use predefined categories or fallback to API data
        const categoriesToShow =
          predefinedCategories.length > 0
            ? predefinedCategories
            : categoriesData.slice(0, 9).map((category) => {
                const categoryName =
                  typeof category === "string" ? category : category.slug || category.name || category
                return {
                  slug: categoryName,
                  name: formatCategoryName(categoryName),
                  icon: "🛍️",
                }
              })

        setCategories(categoriesToShow)
      } catch (error) {
        console.error("Error loading categories:", error)
        // Fallback categories
        setCategories([
          { slug: "smartphones", name: "Mobiles", icon: "📱" },
          { slug: "laptops", name: "Laptops", icon: "💻" },
          { slug: "home-decoration", name: "Home", icon: "🏠" },
          { slug: "mens-shirts", name: "Fashion", icon: "👕" },
          { slug: "groceries", name: "Grocery", icon: "🛒" },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    loadCategories()
  }, [])

  if (isLoading) {
    return (
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center overflow-x-auto hide-scrollbar">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="flex flex-col items-center min-w-[70px] animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-full mb-2"></div>
                <div className="h-3 w-12 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow-sm border-b border-gray-100">
      <div className="container mx-auto px-4 py-2">
        <div className="flex justify-between items-center overflow-x-auto hide-scrollbar space-x-2">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="flex flex-col items-center min-w-[70px] py-2 px-1 hover:bg-gray-50 rounded-lg transition-colors group"
            >
              <div className="w-12 h-12 mb-1 flex items-center justify-center text-2xl bg-gray-50 rounded-full group-hover:bg-gray-100 transition-colors">
                {category.icon}
              </div>
              <span className="text-xs font-medium text-center text-gray-700 group-hover:text-[#2874f0] transition-colors leading-tight">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
