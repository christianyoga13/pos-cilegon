"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseConfig";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import ReusableTable from "@/components/card-reusable";
import FacilityCard from "@/components/booking-card";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
// import { Button } from "@/components/ui/button";
// import Link from "next/link";
// import { Plus } from "lucide-react";

interface Booking extends Record<string, unknown> {
  id: string;
  sport: string;
  court: string;
  date: string;
  time: string;
  booked_by: string;
  username: string;
  status: string;
}

export default function Home() {
  const router = useRouter(); // Added this line
  const [selectedSport, setSelectedSport] = useState<string>("all");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sportsList = [
    "All",
    "Badminton",
    "Futsal",
    "Basketball",
    "Driving Range",
    "Tennis",
  ];

  const getSportDatabaseName = (displayName: string): string => {
    // Pastikan mapping ini sesuai dengan nama koleksi di Firestore
    const sportMapping: Record<string, string> = {
      'Tennis': 'tennis',
      'Driving Range': 'driving range',
      'Basketball': 'basketball',
      'Futsal': 'futsal',
      'Badminton': 'badminton',
      'All': 'all'
    };
    
    console.log('Original name:', displayName);
    const mappedName = sportMapping[displayName] || displayName.toLowerCase();
    console.log('Mapped to:', mappedName);
    
    return mappedName;
  };

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      setError(null);
      const bookingsData: Booking[] = [];

      try {
        const dbSelectedSport = getSportDatabaseName(selectedSport);
        console.log('Selected sport:', selectedSport);
      console.log('DB sport name:', dbSelectedSport);

        const sportsToFetch =
          dbSelectedSport === "all"
            ? sportsList
                .filter((sport) => sport !== "All")
                .map(getSportDatabaseName)
            : [dbSelectedSport];

            console.log('Sports to fetch:', sportsToFetch);

        for (const sport of sportsToFetch) {
          console.log('Trying to fetch courts for:', sport);
        const courtsRef = collection(db, "sports_center", sport, "courts");
        console.log('Collection path:', `sports_center/${sport}/courts`);
        
        const courtsSnapshot = await getDocs(courtsRef);
        console.log(`Found ${courtsSnapshot.docs.length} courts for ${sport}`)

          for (const courtDoc of courtsSnapshot.docs) {
            const courtName = courtDoc.id;
            const bookingsSnapshot = await getDocs(
              collection(
                db,
                "sports_center",
                sport,
                "courts",
                courtName,
                "bookings"
              )
            );

            for (const bookingDoc of bookingsSnapshot.docs) {
              const date = bookingDoc.id;
              const timeSlotsData = bookingDoc.data();

              for (const [timeSlot, data] of Object.entries(timeSlotsData)) {
                if (typeof data === "object" && data !== null && 'booked_by' in data) {
                  let username;
                  
                  if (data.booked_by && data.booked_by.length > 20) {
                    const userDoc = await getDoc(doc(db, "users", data.booked_by));
                    const userData = userDoc.data();
                    username = userData?.username || "Unknown User";
                  } else {
                    username = data.booked_by || "Unknown User";
                  }

                  bookingsData.push({
                    id: `${courtName}-${date}-${timeSlot}`,
                    sport: sport,
                    court: courtName,
                    date: date,
                    time: timeSlot,
                    booked_by: data.booked_by || "Unknown User",
                    username: username,
                    status: data.status || "pending",
                  });
                }
              }
            }
          }
        }

        setBookings(bookingsData);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSport]);

  const handleBookClick = (facility: string) => {
    const formattedFacility = facility.toLowerCase();
    router.push(`/Booking/${formattedFacility}`);
  };

  const facilityData = [
    {
      title: "Futsal",
      dbName: "futsal", 
      description: "Standard size football field with artificial turf",
      imageUrl: "/soccer field.jpg",
      pricePerHour: 50,
      TotalFacility: 100,
    },
    {
      title: "Badminton",
      dbName: "badminton",
      description: "Indoor tennis court with wooden flooring",
      imageUrl: "/badminton field.jpeg",
      pricePerHour: 40,
      TotalFacility: 80,
    },
    {
      title: "Basketball",
      dbName: "basketball",
      description: "Indoor basketball court with wooden flooring",
      imageUrl: "/basketball field.jpg",
      pricePerHour: 40,
      TotalFacility: 65,
    },
    {
      title: "Driving Range",
      dbName: "driving range",
      description: "Outdoor driving range with multiple bays",
      imageUrl: "/driving range.jpg",
      pricePerHour: 40,
      TotalFacility: 100,
    },
    {
      title: "Tennis",
      dbName: "tennis",
      description: "Outdoor driving range with multiple bays",
      imageUrl: "/tennis field.jpeg",
      pricePerHour: 60,
      TotalFacility: 100,
    },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow container mx-auto p-6">
          <div className="flex flex-row justify-between items-center">
            <h1 className="text-4xl font-bold mb-6 mt-4">Book Facilities</h1>
          </div>
          <div className="grid md:grid-cols-5 gap-4">
            {facilityData.map((facility) => (
              <FacilityCard
                key={facility.dbName}
                title={facility.title}
                description={facility.description}
                imageUrl={facility.imageUrl}
                pricePerHour={facility.pricePerHour}
                TotalFacility={facility.TotalFacility}
                isAvailable={true}
                onBook={() => handleBookClick(facility.title)}
              />
            ))}
          </div>
          <h1 className="text-4xl font-bold mb-6 mt-10">View Data</h1>
          <div className="mb-6">
            <label className="font-semibold">Select Sport: </label>
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="border p-2 ml-2"
            >
              {sportsList.map((sport) => (
                <option key={sport} value={sport}>
                  {sport}
                </option>
              ))}
            </select>
          </div>
          {isLoading && <p>Loading bookings...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {bookings.length > 0 && !isLoading && (
            <ReusableTable
              data={bookings}
              columns={[
                { header: "Sport", accessorKey: "sport" },
                { header: "Court", accessorKey: "court" },
                { header: "Date", accessorKey: "date" },
                { header: "Time Available", accessorKey: "time" },
                { header: "Booked By", accessorKey: "username" },
                { header: "Status", accessorKey: "status" },
              ]}
              title="Bookings"
              description="List of all bookings"
            />
          )}
          {!isLoading && bookings.length === 0 && <p>No bookings found.</p>}
        </div>
      </div>
    </ProtectedRoute>
  );
};