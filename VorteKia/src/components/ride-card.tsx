import { Ride } from "@/types";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { MagicCard } from "@/components/magicui/magic-card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import Autoplay from "embla-carousel-autoplay";
import { Label } from "@/components/ui/label";
import { getUserRole } from "@/controllers/user-controller";
import { toast } from "sonner";
import {
    dequeuePromise,
    getQueuePos,
    checkIsInQueue,
    queuePromise,
} from "@/controllers/ride-controller";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function RideCard({ ride }: { ride: Ride }) {
    const navigate = useNavigate();

    const [queuePosition, setQueuePosition] = useState(0);
    const [isInQueue, setIsInQueue] = useState(false);

    useEffect(() => {
        setQueuePosition(getQueuePos(ride.queue_list));

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
    }, [ride.queue_list]);

    async function enqueue() {
        try {
            toast.promise(queuePromise(ride.ride_id), {
                loading: "Entering queue...",
                success: (response) => {
                    if (response.success) {
                        setTimeout(() => {
                            window.location.reload();
                        }, 300);
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
        <Card className="max-w-[29rem]">
            <MagicCard gradientColor={"#D9D9D955"}>
                <CardHeader className="pb-0">
                    <CardTitle className="text-2xl pl-1 text-center">
                        {ride.ride_name}
                    </CardTitle>
                    <CardDescription className="pl-1 text-justify line-clamp-3">
                        {ride.ride_description}
                    </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                    <Label>
                        Currently In Queue:{" "}
                        {ride.ride_status === "Operational."
                            ? ride.queue_count
                            : 0}
                    </Label>
                    <Carousel
                        className="w-full"
                        plugins={[
                            Autoplay({
                                delay: 3000,
                            }),
                        ]}
                        opts={{
                            align: "start",
                            loop: true,
                        }}>
                        <CarouselContent className="">
                            {ride.ride_pictures.map((link) => (
                                <CarouselItem key={link}>
                                    <img
                                        className="w-full h-56 bg-cover bg-no-repeat rounded-lg object-cover"
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
                </CardContent>
                <CardFooter>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full">
                                View Ride Detail
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[calc(100vh-2rem)]">
                            <DialogHeader>
                                <DialogTitle>{ride.ride_name}</DialogTitle>
                                <DialogDescription>
                                    {ride.ride_description}
                                </DialogDescription>
                                <Label>
                                    Operational Status: {ride.ride_status}
                                </Label>
                            </DialogHeader>
                            <DialogDescription>
                                <Label>
                                    Currently In Queue:{" "}
                                    {ride.ride_status === "Operational."
                                        ? ride.queue_count
                                        : 0}
                                </Label>
                                <Carousel
                                    className="w-full"
                                    plugins={[
                                        Autoplay({
                                            delay: 3000,
                                        }),
                                    ]}
                                    opts={{
                                        align: "start",
                                        loop: true,
                                    }}>
                                    <CarouselContent className="">
                                        {ride.ride_pictures.map((link) => (
                                            <CarouselItem key={link}>
                                                <img
                                                    className="w-full h-56 bg-cover bg-no-repeat rounded-lg object-cover"
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
                            </DialogDescription>
                            <DialogFooter>
                                {queuePosition === 0 && (
                                    <Button
                                        className="w-full"
                                        onClick={() => enqueue()}
                                        variant={"outline"}
                                        disabled={
                                            getUserRole() !== "customer" ||
                                            isInQueue ||
                                            ride.ride_status !== "Operational."
                                                ? true
                                                : false
                                        }>
                                        {ride.ride_status !== "Operational." &&
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
                                        {getUserRole() !== "customer" && (
                                            <i>
                                                Please login first to enqueue.
                                            </i>
                                        )}
                                        {getUserRole() === "customer" &&
                                            !isInQueue &&
                                            ride.ride_status ===
                                                "Operational." &&
                                            "Enqueue"}
                                    </Button>
                                )}
                                {queuePosition !== 0 && (
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
                                                    Are you sure you want to
                                                    leave the queue?
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be
                                                    undone. This will remove you
                                                    from this ride's queue. You
                                                    will NOT be refunded.
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
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardFooter>
            </MagicCard>
        </Card>
    );
}
