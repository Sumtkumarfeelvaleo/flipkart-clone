"use client"
import { Zap, Gift, Truck, Shield } from "lucide-react"

export function PromotionalBanners() {
  const promotions = [
    {
      id: 1,
      title: "Flash Sale",
      subtitle: "Limited Time Offers",
      icon: Zap,
      color: "bg-gradient-to-r from-red-500 to-pink-500",
      textColor: "text-white",
    },
    {
      id: 2,
      title: "Free Delivery",
      subtitle: "On orders above ₹499",
      icon: Truck,
      color: "bg-gradient-to-r from-green-500 to-emerald-500",
      textColor: "text-white",
    },
    {
      id: 3,
      title: "Gift Cards",
      subtitle: "Perfect for everyone",
      icon: Gift,
      color: "bg-gradient-to-r from-purple-500 to-indigo-500",
      textColor: "text-white",
    },
    {
      id: 4,
      title: "Secure Payment",
      subtitle: "100% Safe & Secure",
      icon: Shield,
      color: "bg-gradient-to-r from-blue-500 to-cyan-500",
      textColor: "text-white",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mx-2 md:mx-4 my-4">
      {promotions.map((promo) => {
        const IconComponent = promo.icon
        return (
          <div
            key={promo.id}
            className={`${promo.color} ${promo.textColor} p-3 md:p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer`}
          >
            <div className="flex items-center space-x-2 md:space-x-3">
              <IconComponent className="h-5 w-5 md:h-6 md:w-6" />
              <div>
                <h3 className="font-bold text-sm md:text-base">{promo.title}</h3>
                <p className="text-xs md:text-sm opacity-90">{promo.subtitle}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
