"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { db, storage } from "@/lib/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { Toaster } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { CustomFileInput } from "@/components/custom-file-input";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import ProtectedRoute from "@/components/ProtectedRoute";

const formSchema = z.object({
  nama: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  alamat: z.string().min(10, {
    message: "Address must be at least 10 characters.",
  }),
  availableStartTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Please enter a valid time in HH:MM format",
  }),
  availableEndTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Please enter a valid time in HH:MM format",
  }),
  capacity: z.string().transform((val) => parseInt(val)),
  category: z.enum(["basketball", "badminton", "briving range", "tennis"]),
  jenisLapangan: z.string(),
  imageUrl: z.string().url(),
  pricePerHour: z.string().transform((val) => parseInt(val)),
});

export default function AddPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama: "",
      alamat: "",
      availableStartTime: "",
      availableEndTime: "",
      capacity: 0,
      category: "" as z.infer<typeof formSchema>["category"], // Remove default "Badminton"
      jenisLapangan: "", // Remove default "Badminton"
      imageUrl: "",
      pricePerHour: 0,
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    setUploading(true);
    try {
      const file = e.target.files[0];
      const storageRef = ref(storage, `images/${Date.now()}-${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      form.setValue("imageUrl", downloadURL);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload image",
      });
    }
    setUploading(false);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const sportCategory = values.category.toLowerCase();

      // Parse the input times
      const [startHour, startMinute] = values.availableStartTime.split(':').map(Number);
      const [endHour, endMinute] = values.availableEndTime.split(':').map(Number);

      // Create a new date object for today
      const today = new Date();

      // Create start time
      const startTime = new Date(today);
      startTime.setHours(startHour, startMinute, 0); // Set hours and minutes directly

      // Create end time
      const endTime = new Date(today);
      endTime.setHours(endHour, endMinute, 0); // Set hours and minutes directly

      const courtRef = doc(
        db,
        "sports_center",
        sportCategory,
        "courts",
        values.nama
      );

      await setDoc(courtRef, {
        nama: values.nama,
        alamat: values.alamat,
        availableStartTime: startTime,
        availableEndTime: endTime,
        capacity: values.capacity,
        category: sportCategory,
        jenisLapangan: values.jenisLapangan,
        imageUrl: values.imageUrl,
        pricePerHour: values.pricePerHour,
        createdAt: new Date(),
      });

      toast({
        variant: "default",
        title: "Success",
        description: "Court has been added successfully",
      });

      
    } catch (error) {
      console.error("Error adding court:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add court. Please try again.",
      });
    }
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-bold mb-6 mt-4">Add Court</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="nama"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Court Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter court name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="alamat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="availableStartTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opening Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormDescription>Daily opening time</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="availableEndTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Closing Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormDescription>Daily closing time</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter capacity"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="basketball">Basketball</SelectItem>
                      <SelectItem value="badminton">Badminton</SelectItem>
                      <SelectItem value="driving range">
                        Driving Range
                      </SelectItem>
                      <SelectItem value="tennis">Tennis</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jenisLapangan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Lapangan</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter court type" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Court Image</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <CustomFileInput
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                      {uploading && <p className="text-sm">Uploading...</p>}
                      {field.value && (
                        <div className="mt-2">
                          <Image
                            src={field.value}
                            alt="Preview"
                            className="max-w-[200px] rounded-md"
                            width={200}
                            height={200}
                          />
                        </div>
                      )}
                      <Input type="hidden" {...field} />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Upload an image of the court
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pricePerHour"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price Per Hour</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter price per hour"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button type="submit">Submit</Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => router.push("/Admin")}
              >
                Exit
              </Button>
            </div>
          </form>
        </Form>
      </div>
      <Toaster />
    </ProtectedRoute>
  );
}
