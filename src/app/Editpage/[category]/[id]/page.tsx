"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebaseConfig";
import { storage } from "@/lib/firebaseConfig";
import { ref, uploadBytes, getDownloadURL, listAll, deleteObject } from "firebase/storage";
import { doc, getDoc, updateDoc, deleteDoc, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProtectedRoute from "@/components/ProtectedRoute";
import React from "react";
import Image from "next/image";

interface PageProps {
  params: Promise<{
    category: string;
    id: string;
  }>;
}

export default function EditPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const [isLoading, setIsLoading] = useState(true);
  const [originalData, setOriginalData] = useState({
    name: "",
    price: "",
    alamat: "",
    imageUrl: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    alamat: "",
    imageUrl: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    const fetchCourt = async () => {
      setIsLoading(true);
      try {
        // Decode and normalize the category
        const category = decodeURIComponent(resolvedParams.category)
          .toLowerCase()
          .replace(/%20/g, ' ')
          .trim();
        const courtId = decodeURIComponent(resolvedParams.id.trim());
        
        console.log('Attempting to fetch:', {
          category,
          courtId,
          originalCategory: resolvedParams.category,
          originalId: resolvedParams.id,
          fullPath: `sports_center/${category}/courts/${courtId}`
        });

        const courtRef = doc(db, "sports_center", category, "courts", courtId);
        const courtSnap = await getDoc(courtRef);
        
        if (courtSnap.exists()) {
          const data = courtSnap.data();
          console.log('Found document:', data);
          
          const formattedData = {
            name: data.nama || "",
            price: (data.price || 0).toString(),
            alamat: data.alamat || "",
            imageUrl: data.imageUrl || "",
          };
          
          console.log('Formatted data:', formattedData);
          setOriginalData(formattedData);
          setFormData(formattedData);
        } else {
          console.error('Document not found. Path:', `sports_center/${category}/courts/${courtId}`);
          alert('Court not found!');
          router.push('/Admin');
        }
      } catch (error) {
        console.error("Error fetching court:", error);
        alert('Error loading court data: ' + (error instanceof Error ? error.message : 'Unknown error'));
        router.push('/Admin');
      } finally {
        setIsLoading(false);
      }
    };

    if (resolvedParams.category && resolvedParams.id) {
      fetchCourt();
    }
  }, [resolvedParams.category, resolvedParams.id, router]);

  const handleReset = () => {
    setFormData(originalData);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File) => {
    const category = resolvedParams.category.toLowerCase();
    const courtId = decodeURIComponent(resolvedParams.id);
    const storageRef = ref(storage, `courts/${category}/${courtId}/${file.name}`);
    
    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const category = decodeURIComponent(resolvedParams.category)
        .toLowerCase()
        .replace(/%20/g, ' ')
        .trim();
      const oldId = decodeURIComponent(resolvedParams.id);
      const newId = formData.name.trim();
      
      console.log('Submitting with category:', {
        originalCategory: resolvedParams.category,
        normalizedCategory: category,
        oldId,
        newId
      });

      if (oldId !== newId) {
        const newCourtRef = doc(db, "sports_center", category, "courts", newId);
        const oldCourtRef = doc(db, "sports_center", category, "courts", oldId);
        
        let imageUrl = formData.imageUrl;
        if (selectedImage) {
          const newStorageRef = ref(storage, `courts/${category}/${newId}/${selectedImage.name}`);
          const snapshot = await uploadBytes(newStorageRef, selectedImage);
          imageUrl = await getDownloadURL(snapshot.ref);
          
          const oldStorageRef = ref(storage, `courts/${category}/${oldId}`);
          const oldFiles = await listAll(oldStorageRef);
          await Promise.all(oldFiles.items.map(item => deleteObject(item)));
        } else if (formData.imageUrl) {
          const oldImageName = formData.imageUrl.split('/').pop();
          if (oldImageName) {
            const oldStorageRef = ref(storage, `courts/${category}/${oldId}/${oldImageName}`);
            const newStorageRef = ref(storage, `courts/${category}/${newId}/${oldImageName}`);
            
            const response = await fetch(formData.imageUrl);
            const blob = await response.blob();
            await uploadBytes(newStorageRef, blob);
            imageUrl = await getDownloadURL(newStorageRef);
            
            await deleteObject(oldStorageRef);
          }
        }

        await setDoc(newCourtRef, {
          name: formData.name,
          price: Number(formData.price),
          alamat: formData.alamat,
          imageUrl: imageUrl,
        });

        await deleteDoc(oldCourtRef);

        console.log('Court renamed and updated successfully');
      } else {
        const courtRef = doc(db, "sports_center", category, "courts", oldId);
        
        let imageUrl = formData.imageUrl;
        if (selectedImage) {
          imageUrl = await uploadImage(selectedImage);
        }

        await updateDoc(courtRef, {
          name: formData.name,
          price: Number(formData.price),
          alamat: formData.alamat,
          imageUrl: imageUrl,
        });
      }

      router.push("/Admin");
    } catch (error) {
      console.error("Error updating court:", error);
      alert('Error updating court: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-center h-screen">
            <div className="text-xl">Loading...</div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Edit Court</h1>
        
        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Current Data:</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>Name:</strong> {originalData.name}</p>
              <p><strong>Price:</strong> {originalData.price}</p>
              <p><strong>Address:</strong> {originalData.alamat}</p>
            </div>
            <div>
              <p><strong>Current Image:</strong></p>
              {originalData.imageUrl && (
                <Image
                  src={originalData.imageUrl}
                  alt="Current court image"
                  width={200}
                  height={200}
                  className="object-cover rounded"
                />
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block mb-2">Price</label>
            <Input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block mb-2">Address</label>
            <Input
              value={formData.alamat}
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block mb-2">Court Image</label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mb-2"
            />
            {imagePreview && (
              <div className="mt-2">
                <p>New Image Preview:</p>
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={200}
                  height={200}
                  className="object-cover rounded"
                />
              </div>
            )}
          </div>
          <div className="flex space-x-4">
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
              Update Court
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              Reset to Original
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/Admin")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
