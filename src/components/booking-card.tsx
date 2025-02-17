import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import Image from "next/image";

interface FacilityCardProps {
  title: string;
  description: string;
  imageUrl: string;
  pricePerHour: number;
  TotalFacility: number;
  isAvailable: boolean;
  onBook?: () => void;
}

export default function FacilityCard({
  title,
  description,
  imageUrl,
  pricePerHour,
  TotalFacility,
  isAvailable,
  onBook,
}: FacilityCardProps) {
  return (
    <Card className="overflow-hidden w-full max-w-sm">
      <div className="relative h-48">
        <Badge
          className={`absolute right-2 top-2 z-10 ${
            isAvailable ? "bg-emerald-500" : "bg-rose-500"
          } hover:${isAvailable ? "bg-emerald-600" : "bg-rose-600"}`}
        >
          {isAvailable ? "Available" : "Booked"}
        </Badge>
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <CardHeader className="p-4">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <p className="font-semibold text-primary">
          {pricePerHour}
          <span className="text-muted-foreground font-normal">
            /{TotalFacility}
          </span>
        </p>
        {isAvailable ? (
          <Button onClick={onBook}>Book Here</Button>
        ) : (
          <Button variant="secondary" disabled>
            Full Book
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
