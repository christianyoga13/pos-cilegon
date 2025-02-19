"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { useCart } from "@/lib/cart-context"
import Image from "next/image"

interface ProductCardProps {
  id: string
  name: string
  image: string
  price: number
  originalPrice?: number
  discount?: number
  weight?: string
  variant?: string
  inStock?: boolean
}

export function ProductCard({
  id,
  name,
  image,
  price,
  originalPrice,
  discount,
  weight,
  variant = "Regular",
  inStock = true,
}: ProductCardProps) {
  const { dispatch } = useCart()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const handleAddToCart = () => {
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id,
        name,
        variant,
        price,
        quantity: 1,
      },
    })
  }

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="p-0 relative">
        <div className="aspect-square relative">
          <Image src={image || "/placeholder.svg"} alt={name} fill className="object-cover" />
        </div>
        {discount && <Badge className="absolute top-2 right-2 bg-orange-500 text-white">{discount}%</Badge>}
        <Badge className="absolute top-2 left-2 bg-red-500 text-white">Promo Spesial</Badge>
      </CardHeader>
      <CardContent className="p-3 space-y-2">
        <h3 className="font-medium line-clamp-2">
          {name} {weight && `${weight}`}
        </h3>
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground line-through">
            {originalPrice && formatPrice(originalPrice)}
          </div>
          <div className="text-lg font-semibold text-red-500">{formatPrice(price)}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{inStock ? "Stok dari gudang" : "Stok habis"}</span>
        </div>
      </CardContent>
      <CardFooter className="p-3 pt-0">
        <Button
          className="w-full"
          variant={inStock ? "default" : "secondary"}
          disabled={!inStock}
          onClick={handleAddToCart}
        >
          {inStock ? "Tambah ke Keranjang" : "Stok Kosong"}
        </Button>
      </CardFooter>
    </Card>
  )
}

