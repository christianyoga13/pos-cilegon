"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Image from "next/image";
import { db, auth } from "@/lib/firebaseConfig"; // Add auth import
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface CourtData {
  id: string;
  name: string;
  price: number;
  address: string;
  category: string;
  imageUrl: string; // Make sure imageUrl is not optional
}

export default function Admin() {
  const router = useRouter();
  const [courts, setCourts] = useState<CourtData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const sportsList = ["badminton", "futsal", "basketball", "driving range", "tennis"];

  // Add admin check
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user || user.email !== 'admin@gmail.com') {
        router.push('/'); 
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const fetchAllCourts = async () => {
      const allCourts: CourtData[] = [];

      try {
        for (const sport of sportsList) {
          const courtsRef = collection(db, "sports_center", sport, "courts");
          const courtSnapshot = await getDocs(courtsRef);

          courtSnapshot.forEach((doc) => {
            const courtData = doc.data();
            allCourts.push({
              id: doc.id,
              name: courtData.name || doc.id,
              price: courtData.pricePerHour || 0,
              address: courtData.alamat || "",
              category: sport,
              imageUrl: courtData.imageUrl,
            });
          });
        }

        setCourts(allCourts);
      } catch (error) {
        console.error("Error fetching courts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllCourts();
  }, []);

  // Calculate pagination
  const totalPages = Math.ceil(courts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCourts = courts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDelete = async (category: string, courtId: string) => {
    try {
      const courtRef = doc(db, "sports_center", category, "courts", courtId);
      await deleteDoc(courtRef);
      
      // Update the UI by removing the deleted court
      setCourts(courts.filter(court => !(court.category === category && court.id === courtId)));
    } catch (error) {
      console.error("Error deleting court:", error);
    }
  };

  const handleEdit = (category: string, courtId: string) => {
    router.push(`/Editpage/${category}/${courtId}`);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow container mx-auto p-6">
          <div className="flex flex-row justify-between items-center">
            <h1 className="text-4xl font-bold mb-6 mt-4">Admin View</h1>
            <Button
              asChild
              className="bg-green-500 text-white hover:bg-green-600"
            >
              <Link href="/Addpage">
                <Plus />
                Add Courts
              </Link>
            </Button>
          </div>
          {isLoading ? (
            <p>Loading courts data...</p>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentCourts.map((court) => (
                    <TableRow key={`${court.category}-${court.id}`}>
                      <TableCell>
                        {court.imageUrl && (
                          <Image
                            src={court.imageUrl}
                            alt={court.name}
                            className="w-20 h-20 object-cover rounded"
                            width={80}
                            height={80}
                          />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {court.name}
                      </TableCell>
                      <TableCell>Rp {court.price.toLocaleString()}</TableCell>
                      <TableCell>{court.address}</TableCell>
                      <TableCell className="capitalize">
                        {court.category}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(court.category, court.id)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="icon" className="text-red-600">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the court.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(court.category, court.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        currentPage > 1 && handlePageChange(currentPage - 1)
                      }
                      className={
                        currentPage <= 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {[...Array(totalPages)].map((_, index) => (
                    <PaginationItem key={index + 1}>
                      <PaginationLink
                        onClick={() => handlePageChange(index + 1)}
                        isActive={currentPage === index + 1}
                        className="cursor-pointer"
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        currentPage < totalPages &&
                        handlePageChange(currentPage + 1)
                      }
                      className={
                        currentPage >= totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
