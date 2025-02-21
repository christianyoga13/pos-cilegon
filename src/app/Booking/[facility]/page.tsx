"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import ProtectedRoute from "@/components/ProtectedRoute";

interface BookingDetails {
  booked_by?: string;
  feedback?: string;
  rating?: number;
  status?: string;
}

interface CourtBooking {
  [timeSlot: string]: BookingDetails;
}

interface Court {
  id: string;
  name: string;
  bookings: Record<string, CourtBooking>;
  price: number;
  alamat?: string;
  availableStartTime?: string;
  availableEndTime?: string;
  capacity?: number;
}

// Define available time slots in the correct format
const TIME_SLOTS = [
  "07:00 - 08:00",
  "08:00 - 09:00",
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "12:00 - 13:00",
  "13:00 - 14:00",
  "14:00 - 15:00",
  "15:00 - 16:00",
  "16:00 - 17:00",
  "17:00 - 18:00",
  "18:00 - 19:00",
  "19:00 - 20:00",
  "20:00 - 21:00",
  "21:00 - 22:00"
];

const BookingPage = () => {
  const params = useParams();
  // Decode the facility name to handle spaces correctly
  const facility = params ? decodeURIComponent(params.facility as string) : "";
  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [tempDate, setTempDate] = useState(selectedDate);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [bookingName, setBookingName] = useState("");
  const [bookingPhone, setBookingPhone] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [selectedCourtId, setSelectedCourtId] = useState<string>("");

  console.log("Facility received in booking page:", facility);

  const capitalizeWords = (str: string) => {
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const fetchCourtsAndBookings = useCallback(async () => {
    setIsTableLoading(true);
    setError(null);

    try {
      const courtsPath = `sports_center/${facility.toLowerCase()}/courts`;
      console.log('Fetching courts from path:', courtsPath);
      
      const courtsRef = collection(db, "sports_center", facility.toLowerCase(), "courts");
      const courtsSnapshot = await getDocs(courtsRef);
      const courtsData: Court[] = [];

      // Optimize fetching by using Promise.all
      const bookingPromises = courtsSnapshot.docs.map(async (courtDoc) => {
        const courtData = courtDoc.data();
        const bookingsPath = `sports_center/${facility.toLowerCase()}/courts/${courtDoc.id}/bookings/${selectedDate}`;
        console.log('Fetching bookings from path:', bookingsPath);
        
        const bookingsRef = doc(
          db,
          "sports_center",
          facility.toLowerCase(),
          "courts",
          courtDoc.id,
          "bookings",
          selectedDate
        );
        
        const bookingsSnapshot = await getDoc(bookingsRef);
        return {
          courtDoc,
          courtData,
          bookingsData: bookingsSnapshot.exists() ? bookingsSnapshot.data() : {}
        };
      });
      

      const results = await Promise.all(bookingPromises);

      results.forEach(({ courtDoc, courtData, bookingsData }) => {
        courtsData.push({
          id: courtDoc.id,
          name: courtData.name || courtDoc.id,
          bookings: { [selectedDate]: bookingsData },
          price: courtData.price || 0,
          alamat: courtData.alamat,
          availableStartTime: courtData.availableStartTime,
          availableEndTime: courtData.availableEndTime,
          capacity: courtData.capacity
        });
      });

      setCourts(courtsData);
    } catch (err) {
      setError("Failed to load facility data. Please try again.");
      console.error("Error fetching data:", err);
    } finally {
      setIsTableLoading(false);
      setIsLoading(false);
    }
  }, [facility, selectedDate]);

  useEffect(() => {
    if (facility) {
      fetchCourtsAndBookings();
    }
  }, [fetchCourtsAndBookings, facility]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setTempDate(newDate);
    setSelectedDate(newDate); // Clear success state when date changes
  };

  const handleBooking = async () => {
    if (!selectedCourtId || !selectedTimeSlot || !bookingName || !bookingPhone) {
      setBookingError("Please fill in all fields");
      return;
    }

    setIsBooking(true);
    setBookingError(null);

    try {
      const bookingPath = `sports_center/${facility.toLowerCase()}/courts/${selectedCourtId}/bookings/${selectedDate}`;
      console.log('Setting booking at path:', bookingPath);
      
      const bookingRef = doc(
        db,
        "sports_center",
        facility.toLowerCase(),
        "courts",
        selectedCourtId,
        "bookings",
        selectedDate
      );

      // Get existing bookings for the date
      const existingBookings = (await getDoc(bookingRef)).data() || {};

      // Make sure we use the full time slot format (e.g., "07:00 - 08:00")
      const timeSlotKey = selectedTimeSlot;  // selectedTimeSlot already contains the full format

      // Update bookings with new slot using the full time slot format
      await setDoc(bookingRef, {
        ...existingBookings,
        [timeSlotKey]: {
          status: "booked",
          booked_by: bookingName,
          phone: bookingPhone,
          booking_time: new Date().toISOString()
        }
      });

      setSelectedCourtId("");
      setSelectedTimeSlot("");
      setBookingName("");
      setBookingPhone("");
      fetchCourtsAndBookings(); // Refresh the data
    } catch (err) {
      console.error("Booking error:", err);
      setBookingError("Failed to book the slot. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  // Court icon component
  const CourtIcon = ({ status, isSelected }: { 
    status?: string; 
    isSelected: boolean;
  }) => {
    let iconColor = "text-gray-400 hover:text-gray-600"; // Available slots are gray
    if (status === "booked") {
      iconColor = "text-red-500";     // Booked slots are red
    } else if (isSelected) {
      iconColor = "text-blue-500";    // Selected slot is blue
    }

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`w-8 h-8 ${iconColor} cursor-pointer transition-colors duration-200`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        {/* Football field icon */}
        <rect x="2" y="2" width="20" height="20" rx="2" strokeWidth="1.5" />
        {/* Center circle */}
        <circle cx="12" cy="12" r="4" strokeWidth="1.5" />
        {/* Center line */}
        <line x1="12" y1="2" x2="12" y2="22" strokeWidth="1.5" />
        {/* Penalty areas */}
        <rect x="2" y="7" width="4" height="10" strokeWidth="1.5" />
        <rect x="18" y="7" width="4" height="10" strokeWidth="1.5" />
        {/* Goal areas */}
        <rect x="2" y="9" width="2" height="6" strokeWidth="1.5" />
        <rect x="20" y="9" width="2" height="6" strokeWidth="1.5" />
      </svg>
    );
  };

  if (isLoading) {
    return <div className="container mx-auto p-4">Loading facility data...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold mb-6">
          Book {capitalizeWords(facility)}
        </h1>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">
            Select Date:
          </label>
          <input
            type="date"
            value={tempDate}
            onChange={handleDateChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="overflow-x-auto">
          {isTableLoading ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2">Updating bookings...</p>
            </div>
          ) : (
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2">Court</th>
                  {TIME_SLOTS.map((slot) => (
                    <th key={slot} className="border border-gray-300 p-2 text-sm">
                      {slot}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {courts.map((court) => (
                  <tr key={court.id}>
                    <td className="border border-gray-300 p-2">
                      <div className="font-semibold text-center">{court.name}</div>
                    </td>
                    {TIME_SLOTS.map((slot) => {
                      const booking = court.bookings[selectedDate]?.[slot];
                      const isBooked = booking?.status === "booked";
                      const slotId = `${court.id}-${slot}`;
                      const isSelected = selectedSlot === slotId;
                      
                      return (
                        <td 
                          key={`${court.id}-${slot}`} 
                          className="border border-gray-300 p-2 text-center"
                          onClick={() => {
                            if (!isBooked) {
                              setSelectedSlot(slotId);
                              setSelectedCourtId(court.id);
                              setSelectedTimeSlot(slot);
                            }
                          }}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <CourtIcon 
                              status={booking?.status}
                              isSelected={isSelected}
                            />
                            {isBooked && (
                              <div className="text-xs text-gray-500">
                                <div>Booked</div>
                                {booking.rating && <div>Rating: {booking.rating}/5</div>}
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {selectedSlot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Confirm Booking</h2>
              <div className="space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                  <p>Court: {courts.find(c => c.id === selectedCourtId)?.name}</p>
                  <p>Time: {selectedTimeSlot}</p>
                  <p>Date: {selectedDate}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    value={bookingName}
                    onChange={(e) => setBookingName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={bookingPhone}
                    onChange={(e) => setBookingPhone(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter your phone number"
                  />
                </div>
                {bookingError && (
                  <div className="text-red-500 text-sm">{bookingError}</div>
                )}
                <div className="flex space-x-3">
                  <button
                    onClick={handleBooking}
                    disabled={isBooking}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                  >
                    {isBooking ? "Booking..." : "Confirm Booking"}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedSlot(null);
                      setBookingError(null);
                    }}
                    disabled={isBooking}
                    className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default BookingPage;