import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    editRidePromise,
    UpdateRideSchema,
} from "@/controllers/ride-controller";
import { Textarea } from "../ui/textarea";
import { Ride } from "@/types";
import { useNavigate } from "react-router";
import { ScrollArea } from "../ui/scroll-area";

export default function EditRide({ ride }: { ride: Ride }) {
    const navigate = useNavigate();

    const form = useForm<z.infer<typeof UpdateRideSchema>>({
        resolver: zodResolver(UpdateRideSchema),
        defaultValues: {
            id: ride.ride_id,
            name: ride.ride_name,
            description: ride.ride_description,
            type: ride.ride_type,
            opening: ride.opening,
            closing: ride.closing,
            price: ride.ride_price,
        },
        mode: "onChange",
    });

    async function editRide(data: z.infer<typeof UpdateRideSchema>) {
        try {
            const response = editRidePromise(data);
            toast.promise(response, {
                loading: "Editting ride...",
                success: () => {
                    setTimeout(() => {
                        navigate("/staff/ride/manager");
                    }, 2000);
                    return "Successfully updated ride!";
                },
                error: (error) => `${error.message || error}`,
            });
        } catch (error) {
            toast.error("Failed editting ride!", {
                description: "An error occured: " + error,
                action: {
                    label: "Close",
                    onClick: () => {},
                },
            });
        }
    }

    return (
        <>
            <Dialog>
                <Toaster position="bottom-right" richColors={true} />
                <DialogTrigger asChild>
                    <Button variant="outline">Edit Ride Details</Button>
                </DialogTrigger>
                <DialogContent className="w-[27.8rem]">
                    <ScrollArea className="max-h-96">
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(editRide)}
                                className="space-y-6">
                                <DialogHeader>
                                    <DialogTitle>Edit Ride</DialogTitle>
                                    <DialogDescription>
                                        Make sure you don't scuff out the
                                        details.
                                    </DialogDescription>
                                </DialogHeader>
                                <FormField
                                    control={form.control}
                                    name="id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Ride id</FormLabel>
                                            <FormControl>
                                                <Input
                                                    disabled
                                                    {...field}
                                                    value={ride.ride_id}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Ride Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ride Name"
                                                    defaultValue={
                                                        ride.ride_name
                                                    }
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Description"
                                                    defaultValue={
                                                        ride.ride_description
                                                    }
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Ride Type</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Roller Coaster"
                                                    defaultValue={
                                                        ride.ride_type
                                                    }
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="opening"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Opening Time</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="time"
                                                    {...field}
                                                    defaultValue={ride.opening}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.value +
                                                                ":00"
                                                        )
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="closing"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Closing Time</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="time"
                                                    {...field}
                                                    defaultValue={ride.closing}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.value +
                                                                ":00"
                                                        )
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Ride Price</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="$5.00"
                                                    {...field}
                                                    defaultValue={
                                                        ride.ride_price
                                                    }
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            Number(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                    type="number"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter className="flex flex-col w-full">
                                    <Button type="submit">
                                        Save Ride Details
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </>
    );
}
