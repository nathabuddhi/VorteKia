import { Toaster, toast } from "sonner";
import { Button } from "@/components/!!ui/button";
import { Input } from "@/components/!!ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/!!ui/dialog";
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
} from "@/components/!!ui/form";
import {
    createRidePromise,
    CreateRideSchema,
} from "@/controllers/ride-controller";
import { Textarea } from "../!!ui/textarea";

export default function CreateRide() {
    const form = useForm<z.infer<typeof CreateRideSchema>>({
        resolver: zodResolver(CreateRideSchema),
    });

    async function createRide(data: z.infer<typeof CreateRideSchema>) {
        try {
            const response = createRidePromise(data);
            toast.promise(response, {
                loading: "Creating ride...",
                success: () => {
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                    return "Successfully created ride!";
                },
                error: (error) => `${error.message || error}`,
            });
        } catch (error) {
            toast.error("Failed creating ride!", {
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
                    <Button variant="ghost">Create Ride</Button>
                </DialogTrigger>
                <DialogContent className="w-[27.8rem]">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(createRide)}
                            className="space-y-6">
                            <DialogHeader>
                                <DialogTitle>Create Ride</DialogTitle>
                                <DialogDescription>
                                    Create rides upon approving manager
                                    proposals.
                                </DialogDescription>
                            </DialogHeader>
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ride Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ride Name"
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
                                                placeholder="Ride Name"
                                                type="time"
                                                {...field}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.value + ":00"
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
                                                placeholder="Ride Name"
                                                type="time"
                                                {...field}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.value + ":00"
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
                                                onChange={(e) =>
                                                    field.onChange(
                                                        Number(e.target.value)
                                                    )
                                                }
                                                value={field.value || ""}
                                                type="number"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter className="flex flex-col w-full">
                                <Button type="submit">Create Ride</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}
