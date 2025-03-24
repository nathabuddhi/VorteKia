import { Order } from "@/types";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { MagicCard } from "@/components/!magicui/magic-card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    cookOrder,
    deliverOrder,
    processOrder,
} from "@/controllers/restaurant-controller";
import { toast } from "sonner";

export function OrderCard({ order }: { order: Order }) {
    return (
        <Card className="max-w-[20rem] h-full flex flex-col justify-between">
            <MagicCard
                gradientColor={"#D9D9D955"}
                className="h-full flex flex-col justify-between">
                <CardHeader className="pb-0 text-center">
                    <CardTitle className="text-xs">
                        Order #{order.order_id}
                    </CardTitle>
                    <CardDescription className="min-h-[48px] text-sm text-gray-600">
                        Status:{" "}
                        <p
                            className={`inline-block font-semibold ${
                                order.status === "complete" && "text-green-700"
                            }`}>
                            {order.status}
                        </p>
                    </CardDescription>
                </CardHeader>
                <CardContent className="pb-2 flex flex-col gap-y-2">
                    <Label className="font-semibold">
                        Menu: {order.menu_name}
                    </Label>
                    <Label className="">Quantity: {order.quantity}</Label>
                </CardContent>
            </MagicCard>
        </Card>
    );
}

export function StaffOrderCard({ order }: { order: Order }) {
    async function takeOrder() {
        const response = processOrder(order.order_id);
        toast.promise(response, {
            loading: "Submitting order to kitchen...",
            success: "Order submitted successfully!",
            error: "Failed to submit order: " + (await response).message,
        });
    }

    async function orderCooked() {
        const response = cookOrder(order.order_id);
        toast.promise(response, {
            loading: "Saving database...",
            success: "Order status updated!",
            error: "Failed to update order status: " + (await response).message,
        });
    }

    async function orderDelivered() {
        const response = deliverOrder(order.order_id);
        toast.promise(response, {
            loading: "Saving database...",
            success: "Order status updated!",
            error: "Failed to update order status: " + (await response).message,
        });
    }

    return (
        <Card className="max-w-[20rem] h-full flex flex-col justify-between">
            <MagicCard
                gradientColor={"#D9D9D955"}
                className="h-full flex flex-col justify-between">
                <CardHeader className="pb-0 text-center">
                    <CardTitle className="text-xs">
                        Order #{order.order_id}
                    </CardTitle>
                    <CardDescription className="min-h-[48px] text-sm text-gray-600">
                        Status: {order.status}
                    </CardDescription>
                </CardHeader>
                <CardContent className="pb-2 flex flex-col gap-y-2">
                    <Label className="font-semibold">
                        Menu: {order.menu_name}
                    </Label>
                    <Label className="">Quantity: {order.quantity}</Label>
                </CardContent>
                <CardFooter>
                    <Button
                        className="w-full"
                        onClick={
                            order.status === "pending"
                                ? takeOrder
                                : order.status === "cooking"
                                ? orderCooked
                                : orderDelivered
                        }>
                        {order.status === "pending"
                            ? "Take Order"
                            : order.status === "cooking"
                            ? "Cook Order"
                            : "Deliver Order"}
                    </Button>
                </CardFooter>
            </MagicCard>
        </Card>
    );
}
