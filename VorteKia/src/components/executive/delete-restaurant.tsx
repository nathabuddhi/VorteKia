import {
    deleteRestaurantPromise,
    getAllRestaurants,
} from "@/controllers/restaurant-controller";
import { Restaurant } from "@/types";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import CreateRestaurantDialog from "../restaurant/create-restaurant";

export default function DeleteRestaurantDialog() {
    const [restaurants, setRestaurants] = useState<Restaurant[] | null>(null);

    const fetchRestaurants = async () => {
        const response = await getAllRestaurants();

        if (response.success) {
            setRestaurants(response.data);
        } else {
            toast.error("Failed fetching restaurants!", {
                description: "An error occurred: " + response.message,
            });
        }
    };

    useEffect(() => {
        fetchRestaurants();
    }, []);

    async function deleteRestaurant(restaurant_id: string) {
        const response = deleteRestaurantPromise(restaurant_id);
        toast.promise(response, {
            loading: "Deleting restaurant...",
            success: async () => {
                if ((await response).success) {
                    fetchRestaurants();
                    return "Successfully deleted restaurant.";
                } else
                    throw new Error(
                        (await response).message || "Unknown error."
                    );
            },
            error: (error) =>
                `Failed deleting restaurant: ${error.message || error}`,
        });
    }

    return (
        <Dialog>
            <DialogTrigger>
                <Button variant={"ghost"}>Manage Restaurants</Button>
            </DialogTrigger>
            <DialogContent>
                <CreateRestaurantDialog />
                <ScrollArea className="flex flex-row max-h-96">
                    {restaurants?.map((r) => (
                        <div className="flex flex-col py-2 justify-between">
                            {r.name}
                            <Button
                                variant={"destructive"}
                                onClick={() => deleteRestaurant(r.id)}>
                                Delete
                            </Button>
                        </div>
                    ))}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
