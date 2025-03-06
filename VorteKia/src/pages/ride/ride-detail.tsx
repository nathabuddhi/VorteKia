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
import { Ride } from "@/types";
import { getRideById } from "@/controllers/ride-controller";
import { useNavigate } from "react-router";
import { toast, Toaster } from "sonner";
import { getUserRole, refreshUserSession } from "@/controllers/user-controller";
import {
    dequeuePromise,
    getQueuePos,
    checkIsInQueue,
    queuePromise,
} from "@/controllers/ride-controller";
import { NeonGradientCard } from "@/components/magicui/neon-gradient-card";
import { MagicCard } from "@/components/magicui/magic-card";

export default function RideDetailPage() {
    const [ride, setRide] = useState<Ride | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const url = new URL(window.location.href);
        const pathParts = url.pathname.split("/");
        const rideId = pathParts[pathParts.length - 1];

        const fetchRideDetails = async () => {
            const response = await getRideById(rideId);
            console.log(response);
            if (response.data === null) {
                toast.error("Ride Not Found!", {
                    description:
                        "This ride does not exist. Redirecting in half a second.",
                });
                console.log(response.data);
                setTimeout(() => {
                    navigate("/ride");
                }, 500);
            }
            setRide(response.data);
        };

        fetchRideDetails();
    });

    const [queuePosition, setQueuePosition] = useState(0);
    const [isInQueue, setIsInQueue] = useState(false);

    useEffect(() => {
        if (ride === null) return;
        setQueuePosition(getQueuePos(ride?.queue_list));

        const user = localStorage.getItem("user");
        const parsedUser = user ? JSON.parse(user) : null;

        if (parsedUser && parsedUser.role === "customer") {
            const fetchQueueStatus = async () => {
                try {
                    const response = await checkIsInQueue(parsedUser.user_id);
                    setIsInQueue(response.data ? true : false);
                } catch (error) {
                    console.error("Error checking queue status:", error);
                }
            };

            fetchQueueStatus();
        }
    }, [ride]);

    async function enqueue() {
        try {
            if (ride === null) return;
            toast.promise(queuePromise(ride.ride_id), {
                loading: "Entering queue...",
                success: (response) => {
                    if (response.success) {
                        refreshUserSession();
                        return "Successfully enqueued!";
                    } else {
                        throw new Error(
                            typeof response.message === "string"
                                ? response.message
                                : "Unknown error."
                        );
                    }
                },
                error: (error) => `${error.message || error}`,
            });
        } catch (error) {
            toast.error("Failed to enqueue!", {
                description: "An Error Happened: " + error,
                action: {
                    label: "Close",
                    onClick: () => {},
                },
            });
        }
    }

    async function dequeue() {
        try {
            if (ride === null) return;
            toast.promise(dequeuePromise(ride.ride_id), {
                loading: "Leaving queue...",
                success: (response) => {
                    if (response.success) {
                        setTimeout(() => {
                            window.location.reload();
                        }, 300);
                        return "Successfully dequeued!";
                    } else {
                        throw new Error(
                            typeof response.message === "string"
                                ? response.message
                                : "Unknown error."
                        );
                    }
                },
                error: (error) => `${error.message || error}`,
            });
        } catch (error) {
            toast.error("Failed to dequeue!", {
                description: "An Error Happened: " + error,
                action: {
                    label: "Close",
                    onClick: () => {},
                },
            });
        }
    }

    return (
        <div className="flex items-center justify-center text-center h-[calc(100vh-3.5rem)] w-screen">
            <NeonGradientCard className="h-[calc(100vh-10rem)] w-[calc(100vh-10rem)]">
                <Toaster position="bottom-right" richColors />
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

                    <div className="mt-6">
                        {queuePosition === 0 ? (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        className="w-full"
                                        variant="outline"
                                        disabled={
                                            getUserRole() !== "customer" ||
                                            isInQueue ||
                                            ride?.ride_status !== "Operational."
                                        }>
                                        {ride?.ride_status !== "Operational." &&
                                            !isInQueue && (
                                                <i>Ride is not operational.</i>
                                            )}
                                        {isInQueue &&
                                            getUserRole() === "customer" && (
                                                <i>
                                                    Leave your current queue to
                                                    enqueue.
                                                </i>
                                            )}
                                        {getUserRole() !== "customer" &&
                                            ride?.ride_status ==
                                                "Operational." && (
                                                <i>
                                                    Please login first to
                                                    enqueue.
                                                </i>
                                            )}
                                        {getUserRole() === "customer" &&
                                            !isInQueue &&
                                            ride?.ride_status ===
                                                "Operational." &&
                                            "Enqueue"}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Are you sure you want to join the
                                            queue?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This
                                            will deduct ${ride?.ride_price} from
                                            your balance.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => enqueue()}>
                                            Continue
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        ) : (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="destructive"
                                        className="w-full">
                                        Leave Ride Queue
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Are you sure you want to leave the
                                            queue?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This
                                            will remove you from this ride's
                                            queue. You will NOT be refunded.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => dequeue()}>
                                            Continue
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                </MagicCard>
            </NeonGradientCard>
        </div>
    );
}
