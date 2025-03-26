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
    CreateStoreSchema,
    createStorePromise,
} from "@/controllers/store-controller";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function CreateStoreDialog() {
    const form = useForm<z.infer<typeof CreateStoreSchema>>({
        resolver: zodResolver(CreateStoreSchema),
    });

    async function createStore(data: z.infer<typeof CreateStoreSchema>) {
        try {
            const response = createStorePromise(data);
            toast.promise(response, {
                loading: "Creating store...",
                success: () => {
                    window.location.reload();
                    return "Successfully created store!";
                },
                error: (error) => {
                    throw new Error(error ?? "Unknown error.");
                },
            });
        } catch (error) {
            toast.error("Failed creating store!", {
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
                    <Button variant="default">Create Store</Button>
                </DialogTrigger>
                <DialogContent className="w-[27.8rem]">
                    <ScrollArea className="max-h-96">
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(createStore)}
                                className="space-y-6 p-2 pr-4">
                                <DialogHeader>
                                    <DialogTitle>Create Store</DialogTitle>
                                    <DialogDescription>
                                        Create a store upon approving manager
                                        proposals.
                                    </DialogDescription>
                                </DialogHeader>
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Store Name</FormLabel>
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
                                    <Button type="submit">Create Store</Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </>
    );
}
