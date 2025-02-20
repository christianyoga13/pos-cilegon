import Image from "next/image"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"

interface MenuItemProps {
  name: string
  price: number
  image: string
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
}

export function MenuItem({ name, price, image }: MenuItemProps) {
  return (
    <Card>
      <CardHeader className="relative h-48 p-0">
        <Image 
          src={image || "/placeholder.svg"} 
          alt={name} 
          fill 
          className="object-cover rounded-t-lg"
        />
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">{name}</h3>
          <p className="text-primary font-semibold">{formatPrice(price)}</p>
        </div>
      </CardContent>
    </Card>
  )
}