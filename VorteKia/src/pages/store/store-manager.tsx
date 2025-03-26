import { ManageStoreCard } from "@/components/store/store-card";
import { getAllStores } from "@/controllers/store-controller";
import { ApiResponse, Income, Store } from "@/types";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { invoke } from "@tauri-apps/api/core";

export default function StoreManagerPage() {
    const [stores, setStores] = useState<Store[] | null>(null);
    const [remainingStores, setRemainingStores] = useState<Store[] | null>(
        null
    );
    const [originalStores, setOriginalStores] = useState<Store[] | null>(null);
    const [filter, setFilter] = useState("all");
    const [totalIncome, setTotalIncome] = useState(0);

    const fetchStores = async () => {
        const response = await getAllStores();

        const response2 = await invoke<ApiResponse<Income>>("get_cfo_income", {
            payload: "all",
        });

        if (response.success) {
            const allStores = response.data;

            if (allStores && allStores.length % 3 !== 0) {
                const nearestMultipleOfThree =
                    Math.floor(allStores.length / 3) * 3;
                const slicedData = allStores.slice(0, nearestMultipleOfThree);
                const remainingData = allStores.slice(nearestMultipleOfThree);

                setStores(slicedData);
                setRemainingStores(remainingData);
            } else {
                setStores(allStores);
                setRemainingStores([]);
            }
            setOriginalStores(allStores);
            if (response2 && response2.data) {
                setTotalIncome(response2.data.marketing);
            }
        } else {
            toast.error("Failed fetching stores!", {
                description: "An error occurred: " + response.message,
            });
        }
    };

    const filterStores = () => {
        if (originalStores) {
            if (filter === "all") {
                const allStores = originalStores;

                const nearestMultipleOfThree =
                    Math.floor(allStores.length / 3) * 3;
                const slicedData = allStores.slice(0, nearestMultipleOfThree);
                const remainingData = allStores.slice(nearestMultipleOfThree);

                setStores(slicedData);
                setRemainingStores(remainingData);
            } else {
                const filteredStores = originalStores.filter(
                    (store) => store.status === filter
                );

                const nearestMultipleOfThree =
                    Math.floor(filteredStores.length / 3) * 3;
                const slicedData = filteredStores.slice(
                    0,
                    nearestMultipleOfThree
                );
                const remainingData = filteredStores.slice(
                    nearestMultipleOfThree
                );

                setStores(slicedData);
                setRemainingStores(remainingData);
            }
        }
    };

    useEffect(() => {
        fetchStores();
    }, []);

    useEffect(() => {
        filterStores();
    }, [filter]);

    return (
        <div className="p-4">
            <Toaster position="bottom-right" richColors />
            <div className="w-full flex justify-evenly">
                <h1 className="text-4xl font-bold mb-8 text-center">
                    Store Supervisor Page
                </h1>
                <Select onValueChange={setFilter}>
                    <SelectTrigger className="w-2/12 h-12">
                        <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Stores</SelectItem>
                        <SelectItem value="Open.">Open</SelectItem>
                        <SelectItem value="Closed.">Closed</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="w-full flex justify-center items-center my-5">
                <Label className="text-xl">
                    All Store Income Today: ${totalIncome}
                </Label>
            </div>
            <div
                className={`justify-center grid gap-6 ${
                    stores && stores.length <= 2 ? "grid-cols-1" : "grid-cols-3"
                }`}>
                {stores?.map((r) => (
                    <ManageStoreCard key={r.id} store={r} />
                ))}
            </div>
            <div
                className={
                    "flex justify-center items-center mt-5 flex-wrap gap-x-6"
                }>
                {remainingStores?.map((r) => (
                    <ManageStoreCard key={r.id} store={r} />
                ))}
            </div>
            <div className="flex justify-between items-center"></div>
        </div>
    );
}
