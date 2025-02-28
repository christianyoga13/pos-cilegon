"use client"

import { Toaster } from "@/components/ui/toaster"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { db, storage } from "@/lib/firebaseConfig"
import { addDoc, collection, getDocs, updateDoc, doc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  discount?: number
  weight?: string
  category: string
  stock: number
  image: string
}

export default function MinimarketPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [newProduct, setNewProduct] = useState<Partial<Product>>({})
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    const querySnapshot = await getDocs(collection(db, "minimarket"))
    const productsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[]
    setProducts(productsData)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const preview = URL.createObjectURL(file)
      setImagePreview(preview)
    }
  }

  const uploadImage = async (file: File) => {
    const storageRef = ref(storage, `products/${Date.now()}-${file.name}`)
    await uploadBytes(storageRef, file)
    return await getDownloadURL(storageRef)
  }

  const handleEditProduct = async () => {
    if (!editingProduct) return
    try {
      let imageUrl = editingProduct.image
      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
      }

      // Create update object and remove any undefined values
      const updateData = {
        name: editingProduct.name,
        price: Number(editingProduct.price) || 0,
        originalPrice: Number(editingProduct.originalPrice) || 0,
        discount: Number(editingProduct.discount) || 0,
        category: editingProduct.category,
        stock: Number(editingProduct.stock) || 0,
        image: imageUrl,
      }

      // Remove any undefined or null values
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] === undefined) {
          delete updateData[key as keyof typeof updateData]
        }
      })

      await updateDoc(doc(db, "minimarket", editingProduct.id), updateData)
      toast({
        title: "Produk diperbarui",
        description: "Perubahan produk berhasil disimpan",
        variant: "default",
      })
      setIsEditing(false)
      setEditingProduct(null)
      setImageFile(null)
      setImagePreview("")
      fetchProducts()
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: "Gagal memperbarui",
        description: "Terjadi kesalahan saat memperbarui produk",
        variant: "destructive",
      })
    }
  }

  const handleAddProduct = async () => {
    try {
      let imageUrl = ""
      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
      }

      const productData = {
        name: newProduct.name || "",
        price: Number(newProduct.price) || 0,
        originalPrice: Number(newProduct.originalPrice) || 0,
        discount: Number(newProduct.discount) || 0,
        category: newProduct.category || "",
        stock: Number(newProduct.stock) || 0,
        image: imageUrl,
      }

      await addDoc(collection(db, "minimarket"), productData)
      toast({
        title: "Produk ditambahkan",
        description: "Produk baru berhasil ditambahkan",
        variant: "default",
      })
      setNewProduct({})
      setImageFile(null)
      setImagePreview("")
      fetchProducts()
    } catch (error) {
      console.error("Error adding product:", error)
      toast({
        title: "Gagal menambahkan",
        description: "Terjadi kesalahan saat menambahkan produk",
        variant: "destructive",
      })
    }
  }

  return (
    <ProtectedRoute>
      <div className="container p-6 max-w-7xl mx-auto ">
        <div className="flex justify-between items-center mb-6 mt-4">
          <h1 className="text-4xl font-bold">Manajemen Produk Minimarket</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-green-500 hover:bg-green-700">Tambah Produk Baru</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Tambah Produk Baru</DialogTitle>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label>Nama Produk</Label>
                    <Input
                      value={newProduct.name || ""}
                      onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Harga</Label>
                    <Input
                      type="number"
                      value={newProduct.price || ""}
                      onChange={e => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Kategori</Label>
                    <Input
                      value={newProduct.category || ""}
                      onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Stok</Label>
                    <Input
                      type="number"
                      value={newProduct.stock || ""}
                      onChange={e => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label>Gambar Produk</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </div>
                  {(imagePreview || newProduct.image) && (
                    <div className="aspect-square relative rounded-lg overflow-hidden border">
                      <Image
                        src={imagePreview || newProduct.image || "/placeholder.jpg"}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <Button onClick={handleAddProduct} className="w-full">Simpan Produk</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-square relative">
                  <Image
                    src={product.image || "/placeholder.jpg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  {isEditing && editingProduct?.id === product.id ? (
                    <div className="space-y-3">
                      <Input
                        value={editingProduct.name}
                        onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        placeholder="Nama Produk"
                      />
                      <Input
                        type="number"
                        value={editingProduct.price}
                        onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                        placeholder="Harga"
                      />
                      <Input
                        value={editingProduct.category}
                        onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
                        placeholder="Kategori"
                      />
                      <Input
                        type="number"
                        value={editingProduct.stock}
                        onChange={e => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                        placeholder="Stok"
                      />
                      <div className="grid gap-2">
                        <Label>Gambar Baru</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                        {imagePreview && (
                          <div className="aspect-square relative rounded-lg overflow-hidden border">
                            <Image
                              src={imagePreview}
                              alt="Preview"
                              fill
                              className="object-cover"
                              width={200}
                              height={200}
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleEditProduct()}>Simpan</Button>
                        <Button variant="outline" onClick={() => {
                          setIsEditing(false)
                          setEditingProduct(null)
                          setImageFile(null)
                          setImagePreview("")
                        }}>Batal</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">Kategori: {product.category}</p>
                      <p className="font-semibold">Rp {product.price.toLocaleString()}</p>
                      <p className="text-sm">Stok: {product.stock}</p>
                      <Button
                        className="w-full"
                        onClick={() => {
                          setIsEditing(true)
                          setEditingProduct(product)
                        }}
                      >
                        Edit Produk
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <Toaster />
    </ProtectedRoute>
  )
}
