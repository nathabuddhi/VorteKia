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
    CreateSouvenirSchema,
    createSouvenirPromise,
} from "@/controllers/store-controller";
import { Textarea } from "../ui/textarea";
import { ScrollArea } from "../ui/scroll-area";
import { getCurrentApp } from "../!misc/headers";

export default function CreateSouvenirDialog() {
    const form = useForm<z.infer<typeof CreateSouvenirSchema>>({
        resolver: zodResolver(CreateSouvenirSchema),
        defaultValues: {
            store_id: getCurrentApp()[4],
        },
    });

    async function createSouvenir(data: z.infer<typeof CreateSouvenirSchema>) {
        try {
            const response = createSouvenirPromise(data);
            toast.promise(response, {
                loading: "Creating souvenir...",
                success: () => {
                    window.location.reload();
                    return "Successfully created souvenir!";
                },
                error: (error) => {
                    throw new Error(error ?? "Unknown error.");
                },
            });
        } catch (error) {
            toast.error("Failed creating souvenir!", {
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
                    <Button variant="default">Create Souvenir</Button>
                </DialogTrigger>
                <DialogContent className="w-[27.8rem]">
                    <ScrollArea className="max-h-96">
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(createSouvenir)}
                                className="space-y-6 p-2 pr-4">
                                <DialogHeader>
                                    <DialogTitle>Create Souvenir</DialogTitle>
                                    <DialogDescription>
                                        Create new souvenir.
                                    </DialogDescription>
                                </DialogHeader>
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Souvenir Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Souvenir Name"
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
                                    <Button type="submit">
                                        Create Souvenir
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
