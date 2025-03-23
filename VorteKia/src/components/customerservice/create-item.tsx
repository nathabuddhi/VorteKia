import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogFooter,
    DialogDescription,
    DialogTitle,
    DialogHeader,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
    CreateLostItemSchema,
    CreateLostItemPromise,
} from "@/controllers/cs-controller";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "../ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ScrollArea } from "../ui/scroll-area";

export default function CreateItemDialog() {
    const [isOpen, setIsOpen] = useState(false);

    const form = useForm<z.infer<typeof CreateLostItemSchema>>({
        resolver: zodResolver(CreateLostItemSchema),
    });

    async function editItem() {
        toast.promise(CreateLostItemPromise(form.getValues()), {
            loading: "Creating item...",
            success: () => {
                setIsOpen(false);
                window.location.reload();
                return "Successfully created item!";
            },
            error: (error) => `${error.message || error}`,
        });
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger>
                <Button variant={"ghost"}>Create Item</Button>
            </DialogTrigger>
            <DialogContent>
                <ScrollArea className="max-h-96">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(editItem)}
                            className="space-y-6 p-2 pr-4">
                            <DialogHeader>
                                <DialogTitle>Create Item</DialogTitle>
                                <DialogDescription>
                                    Make sure not to get any details wrong!
                                </DialogDescription>
                            </DialogHeader>
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
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
                                            <Textarea {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="last_seen"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Seen</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="color"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Color</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <FormControl>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Found">
                                                        Found
                                                    </SelectItem>
                                                    <SelectItem value="Returned to Owner">
                                                        Returned to Owner
                                                    </SelectItem>
                                                    <SelectItem value="Missing">
                                                        Missing
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="found_at"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Found At?</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="finder_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Finder ID</FormLabel>
                                        <FormDescription>
                                            Insert the user ID of the finder,
                                            not the name.
                                        </FormDescription>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="owner_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Owner ID</FormLabel>
                                        <FormDescription>
                                            Insert the user ID of the owner, not
                                            the name.
                                        </FormDescription>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="submit">Create Item</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
