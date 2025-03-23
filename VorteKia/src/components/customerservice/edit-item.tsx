import { Button } from "@/components/ui/button";
import { useState } from "react";
import { LostItem } from "@/types";
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
    EditLostItemSchema,
    EditLostItemPromise,
    DeleteLostItemPromise,
} from "@/controllers/cs-controller";
import { InteractiveHoverButton } from "@/components/!magicui/interactive-hover-button";
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
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ScrollArea } from "../ui/scroll-area";

export default function EditItemDialog({ item }: { item: LostItem }) {
    const [isOpen, setIsOpen] = useState(false);

    const form = useForm<z.infer<typeof EditLostItemSchema>>({
        resolver: zodResolver(EditLostItemSchema),
        defaultValues: {
            item_id: item.item_id,
            image: "",
            name: item.name,
            last_seen: item.last_seen,
            description: item.description,
            color: item.color,
            status: item.status,
            found_at: item.found_at,
            finder_id: item.finder_id,
            owner_id: item.owner_id,
        },
    });

    async function editItem() {
        toast.promise(EditLostItemPromise(form.getValues()), {
            loading: "Updating item...",
            success: () => {
                setIsOpen(false);
                window.location.reload();
                return "Successfully updated item!";
            },
            error: (error) => `${error.message || error}`,
        });
    }

    async function deleteItem() {
        toast.promise(DeleteLostItemPromise(item.item_id), {
            loading: "Deleting item...",
            success: () => {
                setIsOpen(false);
                window.location.reload();
                return "Successfully deleted item!";
            },
            error: (error) => `${error.message || error}`,
        });
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger>
                <InteractiveHoverButton className="w-full">
                    Edit Item
                </InteractiveHoverButton>
            </DialogTrigger>
            <DialogContent>
                <ScrollArea className="max-h-96">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(editItem)}
                            className="space-y-6">
                            <DialogHeader>
                                <DialogTitle>Update Item</DialogTitle>
                                <DialogDescription>
                                    Make sure not to get any details wrong!
                                </DialogDescription>
                            </DialogHeader>
                            <FormField
                                control={form.control}
                                name="item_id"
                                render={({}) => (
                                    <FormItem>
                                        <FormLabel>Item ID</FormLabel>
                                        <FormControl>
                                            <Input
                                                value={item.item_id}
                                                disabled
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
                                name="image"
                                render={({}) => (
                                    <FormItem>
                                        <FormLabel>Image</FormLabel>
                                        <FormControl>
                                            <Input value={""} disabled />
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
                                            <Textarea {...field} />
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
                                            <Input
                                                placeholder={item.finder_id}
                                                {...field}
                                            />
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
                                            <Input
                                                placeholder={item.owner_id}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter className="flex flex-row justify-between">
                                <Button type="submit" className="w-64">
                                    Save Changes
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger>
                                        <Button
                                            variant="destructive"
                                            type="button">
                                            Delete Item
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                Are you absolutely sure?
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone.
                                                This will permanently delete
                                                this item.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>
                                                Cancel
                                            </AlertDialogCancel>
                                            <Button
                                                variant={"destructive"}
                                                onClick={() => deleteItem()}>
                                                Delete Item
                                            </Button>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DialogFooter>
                        </form>
                    </Form>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
