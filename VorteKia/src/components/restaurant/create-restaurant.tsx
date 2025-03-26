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
    CreateRestaurantSchema,
    createRestaurantPromise,
} from "@/controllers/restaurant-controller";
import { Textarea } from "../ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { ScrollArea } from "../ui/scroll-area";

export default function CreateRestaurantDialog() {
    const form = useForm<z.infer<typeof CreateRestaurantSchema>>({
        resolver: zodResolver(CreateRestaurantSchema),
    });

    async function createRestaurant(
        data: z.infer<typeof CreateRestaurantSchema>
    ) {
        try {
            const response = createRestaurantPromise(data);
            toast.promise(response, {
                loading: "Creating restaurant...",
                success: () => {
                    window.location.reload();
                    return "Successfully created restaurant!";
                },
                error: (error) => {
                    throw new Error(error ?? "Unknown error.");
                },
            });
        } catch (error) {
            toast.error("Failed creating restaurant!", {
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
                    <Button variant="default">Create Restaurant</Button>
                </DialogTrigger>
                <DialogContent className="w-[27.8rem]">
                    <ScrollArea className="max-h-96">
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(createRestaurant)}
                                className="space-y-6 p-2 pr-4">
                                <DialogHeader>
                                    <DialogTitle>Create Restaurant</DialogTitle>
                                    <DialogDescription>
                                        Create restaurant upon approving manager
                                        proposals.
                                    </DialogDescription>
                                </DialogHeader>
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
                                                    placeholder=""
                                                    type="time"
                                                    {...field}
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
                                        Create Restaurant
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
