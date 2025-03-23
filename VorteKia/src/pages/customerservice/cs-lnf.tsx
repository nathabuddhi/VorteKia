// import ItemCard from "@/components/customerservice/item-card";
import ItemCard from "@/components/customerservice/item-card";
import { getLostItems } from "@/controllers/cs-controller";
import { LostItem } from "@/types";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";

export default function CSLostAndFoundPage() {
    const [items, setItems] = useState<LostItem[] | null>(null);
    const [remainingItems, setRemainingItems] = useState<LostItem[] | null>(
        null
    );
    const fetchRides = async () => {
        const response = await getLostItems();

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

                setItems(slicedData);
                setRemainingItems(remainingData);
            } else {
                setItems(response.data);
                setRemainingItems([]);
            }
        } else {
            toast.error("Failed fetching item log!", {
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
                Lost Item Log
            </h1>
            {items?.length === 0 && remainingItems?.length === 0 && (
                <div className="items-center justify-center flex h-[40rem]">
                    <p className="self-center text-center ">
                        No items yet. Take rest while you can.
                    </p>
                </div>
            )}
            <div
                className={`justify-center grid gap-6 ${
                    items && items.length <= 2 ? "grid-cols-1" : "grid-cols-3"
                }`}>
                {items?.map((i) => (
                    <ItemCard key={String(i.item_id)} item={i} />
                ))}
            </div>
            <div
                className={
                    "flex justify-center items-center mt-5 flex-wrap gap-x-6"
                }>
                {remainingItems?.map((i) => (
                    <ItemCard key={String(i.item_id)} item={i} />
                ))}
            </div>
        </div>
    );
}
