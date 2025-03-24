import { Order } from "@/types";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { MagicCard } from "@/components/!magicui/magic-card";
import { Label } from "@/components/ui/label";

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
                        Status: {order.status}
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
