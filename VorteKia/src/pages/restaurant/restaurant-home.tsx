import RestaurantCard from "@/components/restaurant/restaurant-card";
import { getAllRestaurants } from "@/controllers/restaurant-controller";
import { Restaurant } from "@/types";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function RestaurantHomePage() {
    const [restaurants, setRestaurants] = useState<Restaurant[] | null>(null);
    const [remainingRestaurants, setRemainingRestaurants] = useState<
        Restaurant[] | null
    >(null);
    const [search, setSearch] = useState("");
    const [originalRestaurants, setOriginalRestaurants] = useState<
        Restaurant[] | null
    >(null);
    const [cuisine, setCuisine] = useState("all");

    const fetchRestaurants = async () => {
        const response = await getAllRestaurants();

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
        } else {
            toast.error("Failed fetching restaurants!", {
                description: "An error occurred: " + response.message,
            });
        }
    };

    const searchRestaurants = () => {
        if (originalRestaurants) {
            setCuisine("all");
            if (search === "") {
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
                    (restaurant) =>
                        restaurant.name
                            .toLowerCase()
                            .includes(search.toLowerCase())
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

    const filterRestaurants = () => {
        setSearch("");
        if (originalRestaurants) {
            if (cuisine === "all") {
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
                    (restaurant) => restaurant.cuisine === cuisine
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
        searchRestaurants();
    }, [search]);

    useEffect(() => {
        filterRestaurants();
    }, [cuisine]);

    return (
        <div className="p-4">
            <Toaster position="bottom-right" richColors />
            <h1 className="text-4xl font-bold mb-4 text-center">
                VorteKia Restaurants
            </h1>
            <div className="place-self-center w-full justify-between items-center flex gap-3 mb-5">
                <div className="w-10/12 flex gap-3 items-center">
                    <Search className="w-8 h-8" />
                    <Input
                        className="h-12"
                        placeholder="Search Restaurant"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select onValueChange={setCuisine}>
                    <SelectTrigger className="w-2/12 h-12">
                        <SelectValue placeholder="Filter by Cuisine" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Cuisine</SelectItem>
                        <SelectItem value="asian">Asian Cuisine</SelectItem>
                        <SelectItem value="western">Western Cuisine</SelectItem>
                        <SelectItem value="italian">Italian Cuisine</SelectItem>
                        <SelectItem value="fusion">Fusion Cuisine</SelectItem>
                    </SelectContent>
                </Select>
            </div>
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
