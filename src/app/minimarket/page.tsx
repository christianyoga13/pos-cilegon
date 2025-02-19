"use client"

import { ProductCard } from "@/components/product-card"
import { CartSheet } from "@/components/cart-sheet"
import { CartProvider, useCart } from "@/lib/cart-context"

const products = [
  {
    id: "1",
    name: "Gelichips Basreng Pedas Pouch",
    image: "/Pocari.jpg",
    price: 11500,
    originalPrice: 12900,
    discount: 11,
    weight: "65 g",
    inStock: true,
  },
  {
    id: "2",
    name: "Keripik Kentang Original",
    image: "/pocari.jpg",
    price: 15000,
    originalPrice: 18000,
    discount: 17,
    weight: "80 g",
    inStock: true,
  },
  {
    id: "3",
    name: "Keripik Singkong Balado",
    image: "/pocari.jpg",
    price: 8500,
    originalPrice: 10000,
    discount: 15,
    weight: "50 g",
    inStock: true,
  },
  {
    id: "4",
    name: "Keripik Singkong Balado",
    image: "/pocari.jpg",
    price: 8500,
    originalPrice: 10000,
    discount: 15,
    weight: "50 g",
    inStock: true,
  },
  {
    id: "5",
    name: "Keripik Singkong Balado",
    image: "/pocari.jpg",
    price: 8500,
    originalPrice: 10000,
    discount: 15,
    weight: "50 g",
    inStock: true,
  },
  {
    id: "6",
    name: "Keripik Singkong Balado",
    image: "/pocari.jpg",
    price: 8500,
    originalPrice: 10000,
    discount: 15,
    weight: "50 g",
    inStock: true,
  },
  {
    id: "7",
    name: "Keripik Singkong Balado",
    image: "/pocari.jpg",
    price: 8500,
    originalPrice: 10000,
    discount: 15,
    weight: "50 g",
    inStock: true,
  },
  {
    id: "8",
    name: "Keripik Singkong Balado mantap uhuy pokonye yeeeee",
    image: "/pocari.jpg",
    price: 8500,
    originalPrice: 10000,
    discount: 15,
    weight: "50 g",
    inStock: true,
  },
]

function ShopLayout() {
  const { state } = useCart()

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1">
        {/* Products Grid */}
        <div className={`flex-1 p-4 transition-all duration-300 ${state.isOpen ? "lg:mr-[400px]" : ""}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>

        {/* Cart - Shown when there are items */}
        {state.isOpen && (
          <div className="fixed right-0 top-0 bottom-0 w-full sm:w-[400px] z-50">
            <CartSheet />
          </div>
        )}
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <CartProvider>
      <ShopLayout />
    </CartProvider>
  )
}

