import { Button } from "@/components/ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import { Label } from "@/components/ui/label";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import Autoplay from "embla-carousel-autoplay";
import { useEffect, useState } from "react";
import { Ride, User } from "@/types";
import {
    allocateRideStaffPromise,
    clearRideStaff,
    getRideById,
} from "@/controllers/ride-controller";
import { useNavigate } from "react-router";
import { toast, Toaster } from "sonner";
import {
    dequeuePromise,
    getQueuePos,
    checkIsInQueue,
    queuePromise,
} from "@/controllers/ride-controller";
import { NeonGradientCard } from "@/components/magicui/neon-gradient-card";
import { MagicCard } from "@/components/magicui/magic-card";
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
    getAllRideStaff,
    getAssignedRideStaffByRide,
} from "@/controllers/staff-controller";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

export default function ManageRidePage() {
    const [ride, setRide] = useState<Ride | null>(null);
    const [staff, setStaff] = useState<User[] | null>(null);
    const [allocatedStaff, setAllocatedStaff] = useState<string[]>([]);
    const [tempAllocatedStaff, setTempAllocatedStaff] = useState<string[]>([]);
    const navigate = useNavigate();

    const handleCheckboxChange = (userId: string) => {
        setTempAllocatedStaff((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const handleAllocateStaffSubmit = async () => {
        toast.promise(clearRideStaff(ride!.ride_id), {
            loading: "Clearing ride allocation...",
            success: (response) => {
                if (response.success) {
                    return "Cleared ride staff allocation. Allocating staff now...";
                } else {
                    throw new Error(
                        typeof response.message === "string"
                            ? response.message
                            : "Unknown error."
                    );
                }
            },
            error: (error) =>
                `Failed clearing staff allocati: ${error.message || error}`,
        });

        for (const staff_id of tempAllocatedStaff) {
            try {
                toast.promise(
                    allocateRideStaffPromise(ride!.ride_id, staff_id),
                    {
                        loading: "Allocating staff ->" + staff_id,
                        success: (response) => {
                            if (response.success) {
                                return (
                                    "Successfully allocated staff -> " +
                                    staff_id
                                );
                            } else {
                                throw new Error(
                                    "Unknown error allocating staff -> " +
                                        staff_id
                                );
                            }
                        },
                        error: (error) =>
                            `Failed logging in: ${error.message || error}`,
                    }
                );
            } catch (error) {
                toast.error("Failed logging In!", {
                    description: "An error occured: " + error,
                    action: {
                        label: "Close",
                        onClick: () => {},
                    },
                });
            }
        }
        toast.success("Successfully allocated all staff!", {
            description: "This page will reload in 2 seconds.",
        });
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    };

    useEffect(() => {
        const url = new URL(window.location.href);
        const pathParts = url.pathname.split("/");
        const rideId = pathParts[pathParts.length - 1];

        const fetchRideDetails = async () => {
            const response = await getRideById(rideId);
            if (response.data === null) {
                toast.error("Ride Not Found!", {
                    description:
                        "This ride does not exist. Redirecting in half a second.",
                });
                setTimeout(() => {
                    navigate("/ride");
                }, 500);
            }
            setRide(response.data);
        };

        const fetchAllocatedStaff = async () => {
            const response = await getAssignedRideStaffByRide(rideId);
            if (response && response.success && response.data) {
                const allocatedIds = response.data.map((s) => s.user_id);
                setAllocatedStaff(allocatedIds);
                setTempAllocatedStaff(allocatedIds);
            } else {
                setAllocatedStaff([]);
                setTempAllocatedStaff([]);
            }
        };

        const fetchAllStaff = async () => {
            const response = await getAllRideStaff();
            setStaff(response.data);
        };

        fetchRideDetails();
        fetchAllStaff();
        fetchAllocatedStaff();
    }, [navigate]);

    return (
        <div className="flex items-center justify-center text-center h-[calc(100vh-3.5rem)] w-screen">
            <NeonGradientCard className="h-[calc(100vh-10rem)] w-[calc(100vh-10rem)]">
                <Toaster position="bottom-right" richColors expand />
                <MagicCard
                    className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md"
                    gradientColor={"#D9D9D955"}>
                    <h1 className="text-2xl font-bold">{ride?.ride_name}</h1>
                    <p className="text-gray-600">{ride?.ride_description}</p>

                    <div className="mt-4 flex flex-col gap-y-2">
                        <Label>Operational Status: {ride?.ride_status}</Label>
                        <Label>Currently In Queue: {ride?.queue_count}</Label>
                        <Label>Attraction Price: ${ride?.ride_price}</Label>
                    </div>

                    <Carousel
                        className="w-full mt-4"
                        plugins={[Autoplay({ delay: 3000 })]}
                        opts={{ align: "start", loop: true }}>
                        <CarouselContent>
                            {ride?.ride_pictures.map((link) => (
                                <CarouselItem key={link}>
                                    <img
                                        className="w-full h-96 bg-cover bg-no-repeat rounded-lg object-cover"
                                        src={link}
                                        onError={(e) => {
                                            e.currentTarget.src =
                                                "https://placehold.co/800x400/lightgray/gray?text=Image+Not+Found";
                                        }}
                                    />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </Carousel>

                    <div className="mt-6 flex justify-between">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    Maintenance History
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="">
                                <DialogHeader>
                                    <DialogTitle>
                                        Maintenance History
                                    </DialogTitle>
                                    <DialogDescription>
                                        The full history of this ride's
                                        maintenance.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">erm</div>
                                <DialogFooter>
                                    <Button type="submit">
                                        New Maintenance Request
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    Allocate Staff
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Staff Allocation</DialogTitle>
                                    <DialogDescription>
                                        Allocate staff to this location.
                                        Allocating already allocated staff will
                                        override the previous allocation.
                                    </DialogDescription>
                                </DialogHeader>
                                <ScrollArea className="max-h-96">
                                    {staff?.map((s) => (
                                        <div
                                            key={s.user_id}
                                            className="flex flex-col gap-y-2">
                                            <div className="flex items-center gap-3">
                                                <Checkbox
                                                    id={s.user_id}
                                                    checked={tempAllocatedStaff.includes(
                                                        s.user_id
                                                    )}
                                                    onCheckedChange={() =>
                                                        handleCheckboxChange(
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
                                        onClick={handleAllocateStaffSubmit}>
                                        Save Staff Allocation
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    Edit Ride Details
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>
                                        Editing Ride Details
                                    </DialogTitle>
                                    <DialogDescription>
                                        Update the details of this ride.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    form here ig
                                </div>
                                <DialogFooter>
                                    <Button type="submit">
                                        Save Ride Details
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="destructive">
                                    Delete Ride
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Ride Deletion</DialogTitle>
                                    <DialogDescription>
                                        Are you sure? This action is
                                        irreversible. Ride Deletion requires COO
                                        approval.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid w-full gap-1.5">
                                    <Label htmlFor="reason">Reason</Label>
                                    <Textarea
                                        placeholder="Ride deletion reason here"
                                        id="reason"
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="submit">
                                        Submit Ride Deletion Proposal
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </MagicCard>
            </NeonGradientCard>
        </div>
    );
}
