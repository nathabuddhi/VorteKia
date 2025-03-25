import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { User } from "@/types";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogFooter,
    DialogDescription,
    DialogTitle,
    DialogHeader,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    getAllChef,
    getAllWaiters,
    getAssignedChefs,
    getAssignedWaiters,
} from "@/controllers/staff-controller";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import {
    allocateChefPromise,
    allocateWaiterPromise,
    clearChefAllocation,
    clearWaiterAllocation,
} from "@/controllers/restaurant-controller";

export default function AllocateRestaurantStaff({
    restaurantId,
}: {
    restaurantId: string;
}) {
    const [allocatedWaiter, setAllocatedWaiter] = useState<string[]>([]);
    const [allocatedChef, setAllocatedChef] = useState<string[]>([]);
    const [chef, setChef] = useState<User[] | null>(null);
    const [waiter, setWaiter] = useState<User[] | null>(null);

    const [open, setOpen] = useState(false);

    const handleChefCheckboxChange = (userId: string) => {
        setAllocatedChef((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const handleWaiterCheckboxChange = (userId: string) => {
        setAllocatedWaiter((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const fetchAllocatedChef = async () => {
        const response = await getAssignedChefs(restaurantId);
        if (response && response.success && response.data) {
            const allocatedIds = response.data.map((s) => s.user_id);
            setAllocatedChef(allocatedIds);
        } else {
            setAllocatedChef([]);
        }
    };

    const fetchAllChef = async () => {
        const response = await getAllChef();
        setChef(response.data);
    };

    const fetchAllocatedWaiter = async () => {
        const response = await getAssignedWaiters(restaurantId);
        if (response && response.success && response.data) {
            const allocatedIds = response.data.map((s) => s.user_id);
            setAllocatedWaiter(allocatedIds);
        } else {
            setAllocatedWaiter([]);
        }
    };

    const fetchAllWaiter = async () => {
        const response = await getAllWaiters();
        setWaiter(response.data);
    };

    useEffect(() => {
        fetchAllChef();
        fetchAllWaiter();
        fetchAllocatedChef();
        fetchAllocatedWaiter();
    }, [restaurantId]);

    const handleAllocateChefSubmit = async () => {
        setOpen(false);
        toast.promise(clearChefAllocation(restaurantId), {
            loading: "Clearing chef allocation...",
            success: (response) => {
                if (response.success) {
                    return "Cleared chef allocation. Allocating chefs now...";
                } else {
                    throw new Error(String(response.message));
                }
            },
            error: (error) =>
                `Failed clearing chef allocation: ${error.message || error}`,
        });

        for (const staff_id of allocatedChef) {
            try {
                toast.promise(allocateChefPromise(restaurantId, staff_id), {
                    loading: "Allocating chef ->" + staff_id,
                    success: (response) => {
                        if (response.success) {
                            return "Successfully allocated chef -> " + staff_id;
                        } else {
                            throw new Error(String(response.message));
                        }
                    },
                    error: (error) => `${error.message || error}`,
                });
            } catch (error) {
                toast.error("Failed allocating chef!", {
                    description: "An error occured: " + error,
                    action: {
                        label: "Close",
                        onClick: () => {},
                    },
                });
            }
        }
        toast.success("Successfully allocated all chef!", {});
    };

    const handleAllocateWaiterSubmit = async () => {
        setOpen(false);
        toast.promise(clearWaiterAllocation(restaurantId), {
            loading: "Clearing waiter allocation...",
            success: (response) => {
                if (response.success) {
                    return "Cleared waiter allocation. Allocating waiters now...";
                } else {
                    throw new Error(String(response.message));
                }
            },
            error: (error) =>
                `Failed clearing waiter allocation: ${error.message || error}`,
        });

        for (const staff_id of allocatedWaiter) {
            try {
                toast.promise(allocateWaiterPromise(restaurantId, staff_id), {
                    loading: "Allocating waiter ->" + staff_id,
                    success: (response) => {
                        if (response.success) {
                            return (
                                "Successfully allocated waiter -> " + staff_id
                            );
                        } else {
                            throw new Error(String(response.message));
                        }
                    },
                    error: (error) => `${error.message || error}`,
                });
            } catch (error) {
                toast.error("Failed allocating waiter!", {
                    description: "An error occured: " + error,
                    action: {
                        label: "Close",
                        onClick: () => {},
                    },
                });
            }
        }
        toast.success("Successfully allocated all waiter!", {});
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Allocate Staff</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <Tabs defaultValue="waiter">
                    <TabsList className="w-full justify-evenly">
                        <TabsTrigger value="waiter" className="w-6/12">
                            Waiter
                        </TabsTrigger>
                        <TabsTrigger value="chef" className="w-6/12">
                            Chef
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="waiter">
                        <DialogHeader>
                            <DialogTitle>Waiter Allocation</DialogTitle>
                            <DialogDescription>
                                Allocate waiters to this location. Allocating
                                already allocated waiter will override the
                                previous allocation.
                            </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="max-h-96">
                            {waiter?.map((s) => (
                                <div
                                    key={s.user_id}
                                    className="flex flex-col gap-y-2">
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            id={s.user_id}
                                            checked={allocatedWaiter.includes(
                                                s.user_id
                                            )}
                                            onCheckedChange={() =>
                                                handleWaiterCheckboxChange(
                                                    s.user_id
                                                )
                                            }
                                        />
                                        <Label htmlFor={s.user_id}>
                                            {s.name}
                                        </Label>
                                    </div>
                                    <Separator />
                                </div>
                            ))}
                        </ScrollArea>
                        <DialogFooter>
                            <Button
                                type="button"
                                onClick={handleAllocateWaiterSubmit}>
                                Save Waiter Allocation
                            </Button>
                        </DialogFooter>
                    </TabsContent>
                    <TabsContent value="chef">
                        <DialogHeader>
                            <DialogTitle>Chef Allocation</DialogTitle>
                            <DialogDescription>
                                Allocate chef to this location. Allocating
                                already allocated chef will override the
                                previous allocation.
                            </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="max-h-96">
                            {chef?.map((s) => (
                                <div
                                    key={s.user_id}
                                    className="flex flex-col gap-y-2">
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            id={s.user_id}
                                            checked={allocatedChef.includes(
                                                s.user_id
                                            )}
                                            onCheckedChange={() =>
                                                handleChefCheckboxChange(
                                                    s.user_id
                                                )
                                            }
                                        />
                                        <Label htmlFor={s.user_id}>
                                            {s.name}
                                        </Label>
                                    </div>
                                    <Separator />
                                </div>
                            ))}
                        </ScrollArea>
                        <DialogFooter>
                            <Button
                                type="button"
                                onClick={handleAllocateChefSubmit}>
                                Save Chef Allocation
                            </Button>
                        </DialogFooter>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
