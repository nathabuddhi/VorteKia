import { Button } from "@/components/!!ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/!!ui/carousel";
import { Label } from "@/components/!!ui/label";
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
import { NeonGradientCard } from "@/components/!magicui/neon-gradient-card";
import { MagicCard } from "@/components/!magicui/magic-card";
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
import { Textarea } from "@/components/!!ui/textarea";
import AllocateRideStaff from "../../components/ride/allocate-ride-staff";
import EditRide from "@/components/ride/edit-ride";
import RideMaintenanceCard from "@/components/ride/ride-maintenance-card";

export default function ManageRidePage() {
    const [ride, setRide] = useState<Ride | null>(null);
    const navigate = useNavigate();

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

        fetchRideDetails();
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
                    <div className="mt-6 flex justify-evenly">
                        {ride && <RideMaintenanceCard rideId={ride.ride_id} />}
                        {ride && <AllocateRideStaff rideId={ride.ride_id} />}
                        {ride && <EditRide ride={ride} />}
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
