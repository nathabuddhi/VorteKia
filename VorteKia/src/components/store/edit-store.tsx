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
import { Textarea } from "../ui/textarea";
import { Store } from "@/types";
import { useNavigate } from "react-router";
import { ScrollArea } from "../ui/scroll-area";
import {
    editStorePromise,
    UpdateStoreSchema,
} from "@/controllers/store-controller";

export default function EditStore({ store }: { store: Store }) {
    const navigate = useNavigate();

    const form = useForm<z.infer<typeof UpdateStoreSchema>>({
        resolver: zodResolver(UpdateStoreSchema),
        defaultValues: {
            id: store.id,
            name: store.name,
            description: store.description,
            opening: store.opening,
            closing: store.closing,
        },
        mode: "onChange",
    });

    async function editStore(data: z.infer<typeof UpdateStoreSchema>) {
        try {
            const response = editStorePromise(data);
            toast.promise(response, {
                loading: "Editting store...",
                success: () => {
                    setTimeout(() => {
                        navigate("/staff/store/manager");
                    }, 150);
                    return "Successfully updated store!";
                },
                error: (error) => `${error.message || error}`,
            });
        } catch (error) {
            toast.error("Failed editting store!", {
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
                    <Button variant="outline">Edit Store Details</Button>
                </DialogTrigger>
                <DialogContent className="w-[27.8rem]">
                    <ScrollArea className="max-h-96">
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(editStore)}
                                className="space-y-6">
                                <DialogHeader>
                                    <DialogTitle>Edit Store</DialogTitle>
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
                                            <FormLabel>Store ID</FormLabel>
                                            <FormControl>
                                                <Input
                                                    disabled
                                                    {...field}
                                                    value={store.id}
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
                                            <FormLabel>Store Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Store Name"
                                                    defaultValue={store.name}
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
                                                    placeholder="Store Description"
                                                    defaultValue={
                                                        store.description
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
                                                    defaultValue={store.opening}
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
                                                    defaultValue={store.closing}
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
                                        Save Store Details
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
