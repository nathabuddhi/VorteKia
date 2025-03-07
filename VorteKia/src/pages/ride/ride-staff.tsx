import { MagicCard } from "@/components/!magicui/magic-card";
import { NeonGradientCard } from "@/components/!magicui/neon-gradient-card";
import { Button } from "@/components/!!ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/!!ui/carousel";
import { Dialog, DialogContent, DialogTrigger } from "@/components/!!ui/dialog";
import { Label } from "@/components/!!ui/label";
import { getAssignedRide } from "@/controllers/staff-controller";
import { Ride } from "@/types";
import Autoplay from "embla-carousel-autoplay";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/!!ui/card";
import { useForm } from "react-hook-form";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/!!ui/form";
import { Input } from "@/components/!!ui/input";
import { ShimmerButton } from "@/components/!magicui/shimmer-button";
import {
    enqueueCustomerPromise,
    forceDequeuePromise,
    processNextCustomerPromise,
} from "@/controllers/ride-controller";
import { UIDLoginFormSchema } from "@/controllers/user-controller";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ScrollArea } from "@/components/!!ui/scroll-area";
import { Separator } from "@/components/!!ui/separator";

export default function RideStaffPage() {
    const [ride, setRide] = useState<Ride | null>(null);
    const [refresh, setRefresh] = useState(false);

    const forceRefresh = () => setRefresh((prev) => !prev);

    const fetchAssignedRide = async () => {
        const response = await getAssignedRide();
        if (response.success) {
            setRide(response.data);
        }
    };

    useEffect(() => {
        fetchAssignedRide();
    }, [ride]);

    async function enqueueCustomer(data: z.infer<typeof UIDLoginFormSchema>) {
        try {
            if (ride === null) return;
            toast.promise(enqueueCustomerPromise(ride.ride_id, data.uid), {
                loading: "Enqueueing Customer...",
                success: (response) => {
                    if (response.success) {
                        return "Successfully enqueued customer!";
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
            toast.error("Failed to enqueue customer!", {
                description: "An Error Happened: " + error,
                action: {
                    label: "Close",
                    onClick: () => {},
                },
            });
        }
    }

    async function dequeueCustomer(user_id: string) {
        try {
            if (ride === null) return;
            toast.promise(forceDequeuePromise(ride.ride_id, user_id), {
                loading: "Dequeueing Customer...",
                success: (response) => {
                    if (response.success) {
                        return "Successfully dequeued customer!";
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
            toast.error("Failed to enqueue customer!", {
                description: "An Error Happened: " + error,
                action: {
                    label: "Close",
                    onClick: () => {},
                },
            });
        }
    }

    async function processNextCustomer() {
        try {
            if (ride === null) return;
            toast.promise(processNextCustomerPromise(ride.ride_id), {
                loading: "Processing Customer...",
                success: (response) => {
                    if (response.success) {
                        setTimeout(() => {
                            forceRefresh();
                        }, 1500);
                        return "Successfully processed customer!";
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
            toast.error("Failed to processed customer!", {
                description: "An Error Happened: " + error,
                action: {
                    label: "Close",
                    onClick: () => {},
                },
            });
        }
    }

    const enqueuCustomerForm = useForm<z.infer<typeof UIDLoginFormSchema>>({
        resolver: zodResolver(UIDLoginFormSchema),
    });

    if (!ride)
        return (
            <div className="flex items-center justify-center text-center h-[calc(100vh-3.5rem)] w-screen">
                <NeonGradientCard className="h-[calc(100vh-10rem)] w-[calc(100vh-10rem)]">
                    <Toaster position="bottom-right" richColors expand />
                    <MagicCard
                        className="max-w-3xl mx-auto h-full bg-white p-6 rounded-lg shadow-md flex items-center justify-center"
                        gradientColor={"#D9D9D955"}>
                        <h1 className="text-2xl font-bold">No Assigned Ride</h1>
                        <Label className="italic">
                            Take rest while you can.
                        </Label>
                    </MagicCard>
                </NeonGradientCard>
            </div>
        );

    return (
        <div
            className="flex items-center justify-center text-center h-[calc(100vh-3.5rem)] w-screen"
            key={String(refresh)}>
            <NeonGradientCard className="h-[calc(100vh-10rem)] w-[calc(100vh-10rem)]">
                <Toaster position="bottom-right" richColors expand />
                <MagicCard
                    className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md"
                    gradientColor={"#D9D9D955"}>
                    <h1 className="text-2xl font-bold">{ride.ride_name}</h1>
                    <p className="text-gray-600">{ride.ride_description}</p>

                    <div className="mt-4 flex flex-col gap-y-2">
                        <Label>Operational Status: {ride.ride_status}</Label>
                        <Label>Currently In Queue: {ride.queue_count}</Label>
                        <Label>Attraction Price: ${ride.ride_price}</Label>
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
                            <DialogTrigger>
                                <Button variant={"outline"}>
                                    Add Customer to Queue
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <Card>
                                    <MagicCard gradientColor={"#D9D9D955"}>
                                        <CardHeader className="flex flex-col items-center">
                                            <CardTitle className="text-2xl">
                                                Enqueue Customer
                                            </CardTitle>
                                            <CardDescription className="text-center">
                                                Manually add a customer to a
                                                queue. This will still deduct
                                                their balance.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Form {...enqueuCustomerForm}>
                                                <form
                                                    onSubmit={enqueuCustomerForm.handleSubmit(
                                                        enqueueCustomer
                                                    )}
                                                    className="space-y-6">
                                                    <FormField
                                                        control={
                                                            enqueuCustomerForm.control
                                                        }
                                                        name="uid"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>
                                                                    Customer UID
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <ShimmerButton
                                                        type="submit"
                                                        className="w-full">
                                                        Enqueue Customer
                                                    </ShimmerButton>
                                                </form>
                                            </Form>
                                        </CardContent>
                                    </MagicCard>
                                </Card>
                            </DialogContent>
                        </Dialog>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    disabled={ride.queue_count <= 0}>
                                    Edit Queue
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <ScrollArea>
                                    {ride.queue_list &&
                                        ride.queue_list.map((cust_id) => {
                                            return (
                                                <>
                                                    <div className="flex items-center justify-between p-3">
                                                        <Label>
                                                            Customer ID:{" "}
                                                            {cust_id}
                                                        </Label>
                                                        <Button
                                                            variant={
                                                                "destructive"
                                                            }
                                                            onClick={() => {
                                                                dequeueCustomer(
                                                                    cust_id
                                                                );
                                                            }}>
                                                            Remove
                                                        </Button>
                                                    </div>
                                                    <Separator />
                                                </>
                                            );
                                        })}
                                </ScrollArea>
                            </DialogContent>
                        </Dialog>
                        {ride.queue_count > 0 ? (
                            <Button
                                variant="default"
                                onClick={() => {
                                    processNextCustomer();
                                }}>
                                Process Next Customer In Queue
                            </Button>
                        ) : (
                            <Button variant="default" disabled>
                                <i>No Customer In Queue</i>
                            </Button>
                        )}
                    </div>
                </MagicCard>
            </NeonGradientCard>
        </div>
    );
}
