import Image from "next/image"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"

interface MenuItemProps {
  name: string
  price: string
  image: string
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
          <p className="text-primary font-semibold">Rp {price}</p>
        </div>
      </CardContent>
    </Card>
  )
}