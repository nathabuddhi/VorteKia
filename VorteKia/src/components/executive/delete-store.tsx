import {
    deleteStorePromise,
    getAllStores,
} from "@/controllers/store-controller";
import { Store } from "@/types";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import CreateStoreDialog from "../store/create-store";

export default function DeleteStoreDialog() {
    const [stores, setStores] = useState<Store[] | null>(null);

    const fetchStores = async () => {
        const response = await getAllStores();

        if (response.success) {
            setStores(response.data);
        } else {
            toast.error("Failed fetching stores!", {
                description: "An error occurred: " + response.message,
            });
        }
    };

    useEffect(() => {
        fetchStores();
    }, []);

    async function deleteStore(store_id: string) {
        const response = deleteStorePromise(store_id);
        toast.promise(response, {
            loading: "Deleting store...",
            success: async () => {
                if ((await response).success) {
                    fetchStores();
                    return "Successfully deleted store.";
                } else
                    throw new Error(
                        (await response).message || "Unknown error."
                    );
            },
            error: (error) =>
                `Failed deleting store: ${error.message || error}`,
        });
    }

    return (
        <Dialog>
            <DialogTrigger>
                <Button variant={"ghost"}>Manage Stores</Button>
            </DialogTrigger>
            <DialogContent>
                <CreateStoreDialog />
                <ScrollArea className="flex flex-row max-h-96">
                    {stores?.map((r) => (
                        <div className="flex flex-col py-2 justify-between">
                            {r.name}
                            <Button
                                variant={"destructive"}
                                onClick={() => deleteStore(r.id)}>
                                Delete
                            </Button>
                        </div>
                    ))}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
