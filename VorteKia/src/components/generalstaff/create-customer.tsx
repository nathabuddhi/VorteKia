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
import { useEffect, useState } from "react";
import {
    createCustomerPromise,
    CreateCustomerFormSchema,
    createCustomerChatPromise,
} from "@/controllers/register-controller";

export default function CreateCustomer() {
    const [isOpen, setIsOpen] = useState(false);

    const form = useForm<z.infer<typeof CreateCustomerFormSchema>>({
        resolver: zodResolver(CreateCustomerFormSchema),
    });

    async function createCustomerChat(user_id: string) {
        const response2 = createCustomerChatPromise(user_id);

        toast.promise(response2, {
            loading: "Creating chat...",
            success: async () => {
                return "Successfully created customer chat!";
            },
            error: (error) => `Failed creating chat: ${error.message || error}`,
        });
        return "Successfully created customer account and chat!";
    }

    async function createCustomerAccount(
        data: z.infer<typeof CreateCustomerFormSchema>
    ) {
        try {
            const response = createCustomerPromise(data);

            toast.promise(response, {
                loading: "Creating account...",
                success: () => {
                    response.then((res) =>
                        createCustomerChat(res.data ? res.data : "")
                    );
                    return "Successfully created account.";
                },
                error: (error) =>
                    `Failed creating account: ${error.message || error}`,
            });
        } catch (error) {
            toast.error("Failed creating account!", {
                description: "An error occured: " + error,
                action: {
                    label: "Close",
                    onClick: () => {},
                },
            });
        }

        setIsOpen(false);
        form.reset();
    }

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <Toaster position="bottom-right" richColors={true} />
                <DialogTrigger asChild>
                    <Button variant="ghost">Create Customer Account</Button>
                </DialogTrigger>
                <DialogContent className="">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(createCustomerAccount)}
                            className="space-y-6">
                            <DialogHeader>
                                <DialogTitle>
                                    Create Customer Account
                                </DialogTitle>
                                <DialogDescription>
                                    Make sure not to get customer's name's
                                    wrong!
                                </DialogDescription>
                            </DialogHeader>
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="email"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="password"
                                                type="password"
                                                {...field}
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
                                            <Input
                                                placeholder="name"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="submit">Create Account</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}
