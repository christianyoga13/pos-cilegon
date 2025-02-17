import ProtectedRoute from "@/components/ProtectedRoute"
import { MenuItem } from "@/components/menu-card"
import { Container } from "@/components/ui/container"

export default function Food() {
  const menuItems = [
    {
      id: 1,
      name: "Chicken Wings",
      price: "150.000",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 2,
      name: "Fish Calamari",
      price: "240.000",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 3,
      name: "Caesar Salad",
      price: "180.000",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 4,
      name: "Margherita Pizza",
      price: "195.000",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 5,
      name: "Classic Burger",
      price: "220.000",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 6,
      name: "Veggie Wrap",
      price: "160.000",
      image: "/placeholder.svg?height=200&width=300",
    },
  ]

  return (
    <ProtectedRoute>
      <Container className="py-6">
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter">Menu Makanan</h1>
            <p className="text-muted-foreground">Pilih menu makanan</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => (
              <MenuItem key={item.id} {...item} />
            ))}
          </div>
        </div>
      </Container>
    </ProtectedRoute>
  )
}
