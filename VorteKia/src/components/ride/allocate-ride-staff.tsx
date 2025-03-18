import { Button } from "@/components/!!ui/button";
import { Label } from "@/components/!!ui/label";
import { useEffect, useState } from "react";
import { User } from "@/types";
import {
    allocateRideStaffPromise,
    clearRideStaff,
} from "@/controllers/ride-controller";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogFooter,
    DialogDescription,
    DialogTitle,
    DialogHeader,
} from "@/components/!!ui/dialog";
import { ScrollArea } from "@/components/!!ui/scroll-area";
import {
    getAllRideStaff,
    getAssignedRideStaffByRide,
} from "@/controllers/staff-controller";
import { Separator } from "@/components/!!ui/separator";
import { Checkbox } from "@/components/!!ui/checkbox";

export default function AllocateRideStaff({ rideId }: { rideId: string }) {
    const [allocatedStaff, setAllocatedStaff] = useState<string[]>([]);
    const [staff, setStaff] = useState<User[] | null>(null);
    const [open, setOpen] = useState(false);

    const handleCheckboxChange = (userId: string) => {
        setAllocatedStaff((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const fetchAllocatedStaff = async () => {
        const response = await getAssignedRideStaffByRide(rideId);
        if (response && response.success && response.data) {
            const allocatedIds = response.data.map((s) => s.user_id);
            setAllocatedStaff(allocatedIds);
        } else {
            setAllocatedStaff([]);
        }
    };

    const fetchAllStaff = async () => {
        const response = await getAllRideStaff();
        setStaff(response.data);
    };

    useEffect(() => {
        fetchAllStaff();
        fetchAllocatedStaff();
    }, [rideId]);

    const handleAllocateStaffSubmit = async () => {
        setOpen(false);
        toast.promise(clearRideStaff(rideId), {
            loading: "Clearing ride allocation...",
            success: (response) => {
                if (response.success) {
                    return "Cleared ride staff allocation. Allocating staff now...";
                } else {
                    throw new Error(String(response.message));
                }
            },
            error: (error) =>
                `Failed clearing staff allocation: ${error.message || error}`,
        });

        for (const staff_id of allocatedStaff) {
            try {
                toast.promise(allocateRideStaffPromise(rideId, staff_id), {
                    loading: "Allocating staff ->" + staff_id,
                    success: (response) => {
                        if (response.success) {
                            return (
                                "Successfully allocated staff -> " + staff_id
                            );
                        } else {
                            throw new Error(String(response.message));
                        }
                    },
                    error: (error) => `${error.message || error}`,
                });
            } catch (error) {
                toast.error("Failed allocating staff!", {
                    description: "An error occured: " + error,
                    action: {
                        label: "Close",
                        onClick: () => {},
                    },
                });
            }
        }
        toast.success("Successfully allocated all staff!", {});
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Allocate Staff</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Staff Allocation</DialogTitle>
                    <DialogDescription>
                        Allocate staff to this location. Allocating already
                        allocated staff will override the previous allocation.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-96">
                    {staff?.map((s) => (
                        <div key={s.user_id} className="flex flex-col gap-y-2">
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    id={s.user_id}
                                    checked={allocatedStaff.includes(s.user_id)}
                                    onCheckedChange={() =>
                                        handleCheckboxChange(s.user_id)
                                    }
                                />
                                <Label htmlFor={s.user_id}>{s.name}</Label>
                            </div>
                            <Separator />
                        </div>
                    ))}
                </ScrollArea>
                <DialogFooter>
                    <Button type="button" onClick={handleAllocateStaffSubmit}>
                        Save Staff Allocation
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
