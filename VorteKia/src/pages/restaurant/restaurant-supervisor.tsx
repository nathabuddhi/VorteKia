import { ManageRestaurantCard } from "@/components/restaurant/restaurant-card";
import { getAllRestaurants } from "@/controllers/restaurant-controller";
import { ApiResponse, Income, Restaurant } from "@/types";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { invoke } from "@tauri-apps/api/core";
import { Label } from "@/components/ui/label";

export default function RestaurantSupervisorPage() {
    const [restaurants, setRestaurants] = useState<Restaurant[] | null>(null);
    const [remainingRestaurants, setRemainingRestaurants] = useState<
        Restaurant[] | null
    >(null);
    const [originalRestaurants, setOriginalRestaurants] = useState<
        Restaurant[] | null
    >(null);
    const [filter, setFilter] = useState("all");
    const [totalIncome, setTotalIncome] = useState(0);

    const fetchRestaurants = async () => {
        const response = await getAllRestaurants();

        const response2 = await invoke<ApiResponse<Income>>("get_cfo_income", {
            payload: "all",
        });

        if (response.success) {
            const allRestaurants = response.data;

            if (allRestaurants && allRestaurants.length % 3 !== 0) {
                const nearestMultipleOfThree =
                    Math.floor(allRestaurants.length / 3) * 3;
                const slicedData = allRestaurants.slice(
                    0,
                    nearestMultipleOfThree
                );
                const remainingData = allRestaurants.slice(
                    nearestMultipleOfThree
                );

                setRestaurants(slicedData);
                setRemainingRestaurants(remainingData);
            } else {
                setRestaurants(allRestaurants);
                setRemainingRestaurants([]);
            }

            setOriginalRestaurants(allRestaurants);
            if (response2 && response2.data) {
                setTotalIncome(response2.data.consumption);
            }
        } else {
            toast.error("Failed fetching restaurants!", {
                description: "An error occurred: " + response.message,
            });
        }
    };

    const filterRestaurants = () => {
        if (originalRestaurants) {
            if (filter === "all") {
                const allRestaurants = originalRestaurants;

                const nearestMultipleOfThree =
                    Math.floor(allRestaurants.length / 3) * 3;
                const slicedData = allRestaurants.slice(
                    0,
                    nearestMultipleOfThree
                );
                const remainingData = allRestaurants.slice(
                    nearestMultipleOfThree
                );

                setRestaurants(slicedData);
                setRemainingRestaurants(remainingData);
            } else {
                const filteredRestaurants = originalRestaurants.filter(
                    (restaurant) => restaurant.status === filter
                );

                const nearestMultipleOfThree =
                    Math.floor(filteredRestaurants.length / 3) * 3;
                const slicedData = filteredRestaurants.slice(
                    0,
                    nearestMultipleOfThree
                );
                const remainingData = filteredRestaurants.slice(
                    nearestMultipleOfThree
                );

                setRestaurants(slicedData);
                setRemainingRestaurants(remainingData);
            }
        }
    };

    useEffect(() => {
        fetchRestaurants();
    }, []);

    useEffect(() => {
        filterRestaurants();
    }, [filter]);

    return (
        <div className="p-4">
            <Toaster position="bottom-right" richColors />
            <div className="w-full flex justify-evenly">
                <h1 className="text-4xl font-bold mb-8 text-center">
                    Restaurant Supervisor Page
                </h1>
                <Select onValueChange={setFilter}>
                    <SelectTrigger className="w-2/12 h-12">
                        <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Restaurants</SelectItem>
                        <SelectItem value="Open.">Open</SelectItem>
                        <SelectItem value="Closed.">Closed</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="w-full flex justify-center items-center my-5">
                <Label className="text-xl">
                    All Restaurant Income Today: ${totalIncome}
                </Label>
            </div>
            <div
                className={`justify-center grid gap-6 ${
                    restaurants && restaurants.length <= 2
                        ? "grid-cols-1"
                        : "grid-cols-3"
                }`}>
                {restaurants?.map((r) => (
                    <ManageRestaurantCard key={r.id} restaurant={r} />
                ))}
            </div>
            <div
                className={
                    "flex justify-center items-center mt-5 flex-wrap gap-x-6"
                }>
                {remainingRestaurants?.map((r) => (
                    <ManageRestaurantCard key={r.id} restaurant={r} />
                ))}
            </div>
            <div className="flex justify-between items-center"></div>
        </div>
    );
}
