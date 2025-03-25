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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "../ui/textarea";
import { Restaurant } from "@/types";
import { useNavigate } from "react-router";
import { ScrollArea } from "../ui/scroll-area";
import {
    editRestaurantPromise,
    UpdateRestaurantSchema,
} from "@/controllers/restaurant-controller";

export default function EditRestaurant({
    restaurant,
}: {
    restaurant: Restaurant;
}) {
    const navigate = useNavigate();

    const form = useForm<z.infer<typeof UpdateRestaurantSchema>>({
        resolver: zodResolver(UpdateRestaurantSchema),
        defaultValues: {
            id: restaurant.id,
            name: restaurant.name,
            description: restaurant.description,
            cuisine: restaurant.cuisine,
            opening: restaurant.opening,
            closing: restaurant.closing,
        },
        mode: "onChange",
    });

    async function editRide(data: z.infer<typeof UpdateRestaurantSchema>) {
        try {
            const response = editRestaurantPromise(data);
            toast.promise(response, {
                loading: "Editting restaurant...",
                success: () => {
                    setTimeout(() => {
                        navigate("/staff/restaurant/supervisor");
                    }, 150);
                    return "Successfully updated restaurant!";
                },
                error: (error) => `${error.message || error}`,
            });
        } catch (error) {
            toast.error("Failed editting restaurant!", {
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
                    <Button variant="outline">Edit Restaurant Details</Button>
                </DialogTrigger>
                <DialogContent className="w-[27.8rem]">
                    <ScrollArea className="max-h-96">
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(editRide)}
                                className="space-y-6">
                                <DialogHeader>
                                    <DialogTitle>Edit Restaurant</DialogTitle>
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
                                            <FormLabel>Restaurant ID</FormLabel>
                                            <FormControl>
                                                <Input
                                                    disabled
                                                    {...field}
                                                    value={restaurant.id}
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
                                            <FormLabel>
                                                Restaurant Name
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Restaurant Name"
                                                    defaultValue={
                                                        restaurant.name
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
                                                    placeholder="Restaurant Description"
                                                    defaultValue={
                                                        restaurant.description
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
                                    name="cuisine"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Restaurant Cuisine
                                            </FormLabel>
                                            <FormControl>
                                                <FormControl>
                                                    <Select
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                        defaultValue={
                                                            field.value
                                                        }>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Cuisine" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="asian">
                                                                Asian
                                                            </SelectItem>
                                                            <SelectItem value="italian">
                                                                Italian
                                                            </SelectItem>
                                                            <SelectItem value="western">
                                                                Western
                                                            </SelectItem>
                                                            <SelectItem value="fusion">
                                                                Fusion
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
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
                                                    defaultValue={
                                                        restaurant.opening
                                                    }
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
                                                    defaultValue={
                                                        restaurant.closing
                                                    }
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
                                <DialogFooter className="flex flex-col w-full">
                                    <Button type="submit">
                                        Save Restaurant Details
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
