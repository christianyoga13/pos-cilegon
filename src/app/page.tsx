import Navbar from "@/components/navbar";
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import ReusableTable from "@/components/card-reusable"; // Fixed import path
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function Home() {

  const users = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "Admin" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User" },
  ]

  const userColumns = [
    { header: "Name", accessorKey: "name" as const },
    { header: "Email", accessorKey: "email" as const },
    {
      header: "Role",
      accessorKey: "role" as const,
      cell: (user: { role: string }) => <Badge variant={user.role === "Admin" ? "default" : "secondary"}>{user.role}</Badge>,
    },
  ]

  // Example 2: Products table with custom rendering
  const products = [
    {
      id: "p1",
      name: "Product 1",
      price: 99.99,
      stock: 10,
      status: "In Stock",
    },
    {
      id: "p2",
      name: "Product 2",
      price: 149.99,
      stock: 0,
      status: "Out of Stock",
    },
  ]

  const productColumns = [
    { header: "Product", accessorKey: "name" as const },
    {
      header: "Price",
      accessorKey: "price" as const,
      cell: (product: { price: number }) => `$${product.price.toFixed(2)}`,
    },
    {
      header: "Status",
      accessorKey: "status" as const,
      cell: (product: { stock: number, status: string }) => (
        <Badge 
          variant={product.stock > 0 ? "default" : "destructive"} 
          className="whitespace-nowrap"
        >
          {product.status}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id" as const,
      cell: (product: { id: string }) => (
        <Button variant="outline" size="sm">
          View Details
        </Button>
      ),
    },
  ]
  const sports = [
    { value: "badminton", label: "Badminton" },
    { value: "tennis", label: "Tennis" },
    { value: "soccer", label: "Soccer" },
  ];

  return (
    <main className="w-full min-h-screen bg-gray-50">
      <Navbar />
      <div className="mx-auto px-4 py-8 ">
        <div className="mb-8 flex justify-center items-center">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Booking slots</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Select defaultValue="badminton">
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Select a sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {sports.map((sport) => (
                      <SelectItem key={sport.value} value={sport.value}>
                        {sport.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="rounded-md border border-input bg-background">
                  <div className="p-4 font-medium">TIME</div>
                  {/* Time slots content would go here */}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ReusableTable
            data={users}
            columns={userColumns}
            title="Users"
            description="List of all system users"
          />
          <ReusableTable
            data={products}
            columns={productColumns}
            title="Products"
            description="Current inventory status"
          />
        </div>
      </div>
    </main>
  );
}
