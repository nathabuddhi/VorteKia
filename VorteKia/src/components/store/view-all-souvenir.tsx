import SouvenirCard, {
    ManageSouvenirCard,
} from "@/components/store/souvenir-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getAllSouvenirByStore } from "@/controllers/store-controller";
import { getUserRole } from "@/controllers/user-controller";
import { Souvenir, Store } from "@/types";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { Search } from "lucide-react";

export default function ViewAllSouvenir(store: { store: Store }) {
    const [souvenirs, setSouvenirs] = useState<Souvenir[]>([]);
    const [filteredSouvenirs, setFilteredSouvenirs] = useState<Souvenir[]>([]);
    const [search, setSearch] = useState("");

    async function fetchSouvenirs() {
        const response = await getAllSouvenirByStore(store.store.id);
        if (response === null) {
            return;
        }

        if (response.success && response?.data) {
            setSouvenirs(response.data);
            setFilteredSouvenirs(response.data);
        } else {
            toast.error("Failed to fetch souvenirs!", {
                description: response.message,
            });
        }
    }

    async function searchSouvenir() {
        const filtered = souvenirs.filter((souvenir) =>
            souvenir.name.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredSouvenirs(filtered);
    }

    useEffect(() => {
        fetchSouvenirs();
    }, []);

    useEffect(() => {
        searchSouvenir();
    }, [search]);

    if (getUserRole() !== "customer") {
        return (
            <>
                <ScrollArea className="w-full h-[35rem] p-2 pr-4 relative overflow-y-scroll">
                    <div className="grid grid-cols-2 gap-4">
                        {souvenirs.map((souvenir) => (
                            <ManageSouvenirCard
                                key={souvenir.souvenir_id}
                                souvenir={souvenir}
                            />
                        ))}
                    </div>
                </ScrollArea>
            </>
        );
    } else
        return (
            <>
                <div className="place-self-center w-11/12 justify-between items-center flex gap-3">
                    <Search className="w-6 h-6" />
                    <Input
                        placeholder="Search Souvenir"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <ScrollArea className="w-full h-[32rem] p-2 pr-4 overflow-y-scroll">
                    <div className="grid grid-cols-2 gap-4">
                        {filteredSouvenirs.map((souvenir) => (
                            <SouvenirCard
                                key={souvenir.souvenir_id}
                                souvenir={souvenir}
                                status={store.store.status}
                            />
                        ))}
                    </div>
                </ScrollArea>
            </>
        );
}
