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
import { Souvenir } from "@/types";
import { useNavigate } from "react-router";
import { ScrollArea } from "../ui/scroll-area";
import {
    editSouvenirPromise,
    UpdateSouvenirSchema,
} from "@/controllers/store-controller";

export default function EditSouvenir({ souvenir }: { souvenir: Souvenir }) {
    const navigate = useNavigate();

    const form = useForm<z.infer<typeof UpdateSouvenirSchema>>({
        resolver: zodResolver(UpdateSouvenirSchema),
        defaultValues: {
            id: souvenir.souvenir_id,
            name: souvenir.name,
            description: souvenir.description,
            price: souvenir.price,
        },
        mode: "onChange",
    });

    async function editSouvenir(data: z.infer<typeof UpdateSouvenirSchema>) {
        try {
            const response = editSouvenirPromise(data);
            toast.promise(response, {
                loading: "Editting souvenir...",
                success: () => {
                    setTimeout(() => {
                        window.location.reload();
                    }, 150);
                    return "Successfully updated souvenir!";
                },
                error: (error) => `${error.message || error}`,
            });
        } catch (error) {
            toast.error("Failed editting souvenir!", {
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
                    <Button variant="outline">Edit Souvenir Details</Button>
                </DialogTrigger>
                <DialogContent className="w-[27.8rem]">
                    <ScrollArea className="max-h-96">
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(editSouvenir)}
                                className="space-y-6">
                                <DialogHeader>
                                    <DialogTitle>Edit Souvenir</DialogTitle>
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
                                            <FormLabel>Souvenir ID</FormLabel>
                                            <FormControl>
                                                <Input
                                                    disabled
                                                    {...field}
                                                    value={souvenir.souvenir_id}
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
                                            <FormLabel>Souvenir Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Souvenir Name"
                                                    defaultValue={souvenir.name}
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
                                                    placeholder="Souvenir Description"
                                                    defaultValue={
                                                        souvenir.description
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
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Price</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="$10"
                                                    type="number"
                                                    defaultValue={
                                                        souvenir.price
                                                    }
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
                                        Save Souvenir Details
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
