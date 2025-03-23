import RestaurantCard from "@/components/restaurant/restaurant-card";
import { getAllRestaurants } from "@/controllers/restaurant-controller";
import { Restaurant } from "@/types";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";

export default function RestaurantHomePage() {
    const [restaurants, setRestaurants] = useState<Restaurant[] | null>(null);
    const [remainingRestaurants, setRemainingRestaurants] = useState<
        Restaurant[] | null
    >(null);

    const fetchRides = async () => {
        const response = await getAllRestaurants();

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

                setRestaurants(slicedData);
                setRemainingRestaurants(remainingData);
            } else {
                setRestaurants(response.data);
                setRemainingRestaurants([]);
            }
        } else {
            toast.error("Failed fetching restaurants!", {
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
                VorteKia Restaurants
            </h1>
            <div
                className={`justify-center grid gap-6 ${
                    restaurants && restaurants.length <= 2
                        ? "grid-cols-1"
                        : "grid-cols-3"
                }`}>
                {restaurants?.map((r) => (
                    <RestaurantCard key={r.id} restaurant={r} />
                ))}
            </div>
            <div
                className={
                    "flex justify-center items-center mt-5 flex-wrap gap-x-6"
                }>
                {remainingRestaurants?.map((r) => (
                    <RestaurantCard key={r.id} restaurant={r} />
                ))}
            </div>
        </div>
    );
}
