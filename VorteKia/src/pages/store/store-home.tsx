import StoreCard from "@/components/store/store-card";
import { getAllStores } from "@/controllers/store-controller";
import { Store } from "@/types";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function StoreHomePage() {
    const [stores, setStores] = useState<Store[] | null>(null);
    const [remainingStores, setRemainingStores] = useState<Store[] | null>(
        null
    );
    const [search, setSearch] = useState("");
    const [originalStores, setOriginalStores] = useState<Store[] | null>(null);

    const fetchStores = async () => {
        const response = await getAllStores();

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
        } else {
            toast.error("Failed fetching stores!", {
                description: "An error occurred: " + response.message,
            });
        }
    };

    const searchStores = () => {
        if (originalStores) {
            if (search === "") {
                const allStores = originalStores;

                const nearestMultipleOfThree =
                    Math.floor(allStores.length / 3) * 3;
                const slicedData = allStores.slice(0, nearestMultipleOfThree);
                const remainingData = allStores.slice(nearestMultipleOfThree);

                setStores(slicedData);
                setRemainingStores(remainingData);
            } else {
                const filteredStores = originalStores.filter((store) =>
                    store.name.toLowerCase().includes(search.toLowerCase())
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
        searchStores();
    }, [search]);

    return (
        <div className="p-4">
            <Toaster position="bottom-right" richColors />
            <h1 className="text-4xl font-bold mb-4 text-center">
                VorteKia Stores
            </h1>
            <div className="place-self-center w-full justify-between items-center flex gap-3 mb-5">
                <Search className="w-8 h-8" />
                <Input
                    className="h-12"
                    placeholder="Search Store"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <div
                className={`justify-center grid gap-6 ${
                    stores && stores.length <= 2 ? "grid-cols-1" : "grid-cols-3"
                }`}>
                {stores?.map((r) => (
                    <StoreCard key={r.id} store={r} />
                ))}
            </div>
            <div
                className={
                    "flex justify-center items-center mt-5 flex-wrap gap-x-6"
                }>
                {remainingStores?.map((r) => (
                    <StoreCard key={r.id} store={r} />
                ))}
            </div>
        </div>
    );
}
