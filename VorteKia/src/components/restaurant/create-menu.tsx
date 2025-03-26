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
    CreateMenuSchema,
    createMenuPromise,
} from "@/controllers/restaurant-controller";
import { Textarea } from "../ui/textarea";
import { ScrollArea } from "../ui/scroll-area";
import { getCurrentApp } from "../!misc/headers";

export default function CreateMenuDialog() {
    const form = useForm<z.infer<typeof CreateMenuSchema>>({
        resolver: zodResolver(CreateMenuSchema),
        defaultValues: {
            restaurant_id: getCurrentApp()[4],
        },
    });

    async function createMenu(data: z.infer<typeof CreateMenuSchema>) {
        try {
            const response = createMenuPromise(data);
            toast.promise(response, {
                loading: "Creating menu...",
                success: () => {
                    window.location.reload();
                    return "Successfully created menu!";
                },
                error: (error) => {
                    throw new Error(error ?? "Unknown error.");
                },
            });
        } catch (error) {
            toast.error("Failed creating menu!", {
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
                    <Button variant="default">Create Menu</Button>
                </DialogTrigger>
                <DialogContent className="w-[27.8rem]">
                    <ScrollArea className="max-h-96">
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(createMenu)}
                                className="space-y-6 p-2 pr-4">
                                <DialogHeader>
                                    <DialogTitle>Create Menu</DialogTitle>
                                    <DialogDescription>
                                        Create new menu.
                                    </DialogDescription>
                                </DialogHeader>
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Menu Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Menu Name"
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
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Price</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="$10"
                                                    type="number"
                                                    {...field}
                                                    value={
                                                        field.value
                                                            ? field.value.toString()
                                                            : ""
                                                    }
                                                    onChange={(e) => {
                                                        const parsedValue =
                                                            parseFloat(
                                                                e.target.value
                                                            );
                                                        field.onChange(
                                                            isNaN(parsedValue)
                                                                ? 0
                                                                : parsedValue
                                                        );
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter className="flex flex-col w-full">
                                    <Button type="submit">Create Menu</Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </>
    );
}
