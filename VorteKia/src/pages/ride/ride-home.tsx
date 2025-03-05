import RideCard from "@/components/ride-card";
import { getRides } from "@/controllers/ride-controller";
import { Ride } from "@/types";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";

export default function RideHomePage() {
    const [rides, setRides] = useState<Ride[] | null>(null);
    const [remainingRides, setRemainingRides] = useState<Ride[] | null>(null);

    const fetchRides = async () => {
        const response = await getRides();

        if (response.success) {
            if (response.data && response.data.length % 3 !== 0) {
                const nearestMultipleOfThree =
                    Math.floor(response.data.length / 3) * 3;
                const slicedData = response.data.slice(
                    0,
                    nearestMultipleOfThree
                );
                const remainingData = response.data.slice(
                    nearestMultipleOfThree
                );

                setRides(slicedData);
                setRemainingRides(remainingData);
            } else {
                setRides(response.data);
                setRemainingRides([]);
            }
        } else {
            toast.error("Failed fetching rides!", {
                description: "An error occurred: " + response.message,
            });
        }
    };

    useEffect(() => {
        fetchRides();
    }, []);

    return (
        <div className="p-4">
            <Toaster position="bottom-right" richColors />
            <h1 className="text-4xl font-bold mb-4 text-center">
                Ride Home Page
            </h1>
            <div
                className={`justify-center grid gap-6 ${
                    rides && rides.length <= 2 ? "grid-cols-1" : "grid-cols-3"
                }`}>
                {rides?.map((r) => (
                    <RideCard key={r.ride_id} ride={r} />
                ))}
            </div>
            <div
                className={
                    "flex justify-center items-center mt-5 flex-wrap gap-x-6"
                }>
                {remainingRides?.map((r) => (
                    <RideCard key={r.ride_id} ride={r} />
                ))}
            </div>
        </div>
    );
}
