import { ScrollArea } from "@/components/ui/scroll-area";
import {
    getAllRestaurantOrders,
    getCustomerOrders,
} from "@/controllers/restaurant-controller";
import { Order, Restaurant } from "@/types";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { OrderCard } from "./order-card";

export default function ViewOrderHistory(restaurant: {
    restaurant: Restaurant;
}) {
    const [orders, setOrders] = useState<Order[]>([]);

    async function fetchOrders() {
        const response = await getCustomerOrders(restaurant.restaurant.id);
        if (response === null) {
            return;
        }

        if (response.success && response?.data) {
            setOrders(response.data);
        } else {
            toast.error("Failed to fetch order history!", {
                description: response.message,
            });
        }
    }

    useEffect(() => {
        fetchOrders();
    }, []);

    return (
        <ScrollArea className="w-full max-h-96 p-2 pr-4 relative">
            <div className="grid grid-cols-2 gap-4">
                {orders.map((order) => (
                    <OrderCard key={order.order_id} order={order} />
                ))}
            </div>
        </ScrollArea>
    );
}

export function ViewAllOrders(restaurant: { restaurant: Restaurant }) {
    const [orders, setOrders] = useState<Order[]>([]);

    async function fetchOrders() {
        const response = await getAllRestaurantOrders(restaurant.restaurant.id);
        console.log(response);
        if (response === null) {
            return;
        }

        if (response.success && response?.data) {
            setOrders(response.data);
        } else {
            toast.error("Failed to fetch order history!", {
                description: response.message,
            });
        }
    }

    useEffect(() => {
        fetchOrders();
    }, []);

    return (
        <ScrollArea className="w-full max-h-96 p-2 pr-4 relative">
            <div className="grid grid-cols-2 gap-4">
                {orders.map((order) => (
                    <OrderCard key={order.order_id} order={order} />
                ))}
            </div>
        </ScrollArea>
    );
}
