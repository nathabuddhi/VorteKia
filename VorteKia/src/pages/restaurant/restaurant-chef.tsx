import { MagicCard } from "@/components/!magicui/magic-card";
import { NeonGradientCard } from "@/components/!magicui/neon-gradient-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    getAssignedRestaurant,
    getChefOrders,
} from "@/controllers/restaurant-controller";
import { StaffOrderCard } from "@/components/restaurant/order-card";
import { Toaster } from "sonner";
import { useEffect, useState } from "react";
import { Order, Restaurant } from "@/types";
import { Label } from "@/components/ui/label";

export default function RestaurantChefPage() {
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [orders, setOrders] = useState<Order[] | null>(null);

    const fetchAssignedRestaurant = async () => {
        const response = await getAssignedRestaurant();
        if (response.success) {
            setRestaurant(response.data);
            if (response.data) {
                fetchOrders(response.data);
            }
        }
    };

    const fetchOrders = async (restaurant: Restaurant) => {
        const response = await getChefOrders(restaurant.id);
        if (response.success) {
            setOrders(response.data);
        }
    };

    useEffect(() => {
        fetchAssignedRestaurant();
    }, [restaurant]);

    if (!restaurant)
        return (
            <div className="flex items-center justify-center text-center h-[calc(100vh-3.5rem)] w-screen">
                <NeonGradientCard className="h-[calc(100vh-10rem)] w-[calc(100vh-10rem)]">
                    <Toaster position="bottom-right" richColors expand />
                    <MagicCard
                        className="max-w-3xl mx-auto h-full bg-white p-6 rounded-lg shadow-md flex items-center justify-center"
                        gradientColor={"#D9D9D955"}>
                        <h1 className="text-2xl font-bold">
                            No Assigned Restaurant
                        </h1>
                        <Label className="italic">
                            Take rest while you can.
                        </Label>
                    </MagicCard>
                </NeonGradientCard>
            </div>
        );

    return (
        <div className="flex items-center justify-center text-center h-[calc(100vh-3.5rem)] w-screen">
            <NeonGradientCard className="h-[calc(100vh-10rem)] w-[calc(100vh-10rem)]">
                <Toaster position="bottom-right" richColors expand />
                <MagicCard
                    className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md h-full"
                    gradientColor={"#D9D9D955"}>
                    <h1 className="text-2xl font-bold">{restaurant.name}</h1>
                    <p className="text-gray-600">{restaurant.description}</p>

                    <div className="my-4 flex flex-col gap-y-2">
                        <Label>Operational Status: {restaurant.status}</Label>
                    </div>

                    <ScrollArea className="w-full max-h-96 p-2 pr-4 relative">
                        <div className="grid grid-cols-2 gap-4">
                            {orders?.map((o) => (
                                <StaffOrderCard key={o.order_id} order={o} />
                            ))}
                        </div>
                    </ScrollArea>
                </MagicCard>
            </NeonGradientCard>
        </div>
    );
}
