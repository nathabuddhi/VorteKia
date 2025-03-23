import { deleteRidePromise, getRides } from "@/controllers/ride-controller";
import { Ride } from "@/types";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogTrigger, DialogContent } from "@/components/!!ui/dialog";
import { Button } from "@/components/!!ui/button";
import { ScrollArea } from "@/components/!!ui/scroll-area";

export const DeleteRideDialog = () => {
    const [rides, setRides] = useState<Ride[] | null>(null);

    const fetchRides = async () => {
        const response = await getRides();

        if (response.success) {
            setRides(response.data);
        } else {
            toast.error("Failed fetching rides!", {
                description: "An error occurred: " + response.message,
            });
        }
    };

    useEffect(() => {
        fetchRides();
    }, []);

    async function deleteRide(ride_id: string) {
        const response = deleteRidePromise(ride_id);
        toast.promise(response, {
            loading: "Deleting ride...",
            success: async () => {
                if ((await response).success) {
                    fetchRides();
                    return "Successfully deleted ride.";
                } else
                    throw new Error(
                        (await response).message || "Unknown error."
                    );
            },
            error: (error) => `Failed deleting ride: ${error.message || error}`,
        });
    }

    return (
        <Dialog>
            <DialogTrigger>
                <Button variant={"ghost"}>Delete Ride</Button>
            </DialogTrigger>
            <DialogContent>
                <ScrollArea className="flex flex-row max-h-96">
                    {rides?.map((r) => (
                        <div className="flex flex-col py-2 justify-between">
                            {r.ride_name}
                            <Button
                                variant={"destructive"}
                                onClick={() => deleteRide(r.ride_id)}>
                                Delete
                            </Button>
                        </div>
                    ))}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};
