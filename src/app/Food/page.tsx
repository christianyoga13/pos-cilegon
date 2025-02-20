import ProtectedRoute from "@/components/ProtectedRoute"
import { MenuItem } from "@/components/menu-card"
import { Container } from "@/components/ui/container"
import { db } from "@/lib/firebaseConfig"
import { collection, getDocs } from "firebase/firestore"

export default async function Food() {
  // Fetch data from Firestore
  const querySnapshot = await getDocs(collection(db, "makanan"));
  const menuItems = querySnapshot.docs.map(doc => ({
    id: doc.id,
    name: doc.data().nama,
    price: doc.data().harga,
    image: doc.data().imageUrl
  }));

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
              <MenuItem 
                key={item.id} 
                name={item.name} 
                price={item.price} 
                image={item.image} 
              />
            ))}
          </div>
        </div>
      </Container>
    </ProtectedRoute>
  )
}
