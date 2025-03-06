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
} from "@/controllers/register-controller";

export default function CreateCustomer() {
    const form = useForm<z.infer<typeof CreateCustomerFormSchema>>({
        resolver: zodResolver(CreateCustomerFormSchema),
    });

    async function createCustomerAccount(
        data: z.infer<typeof CreateCustomerFormSchema>
    ) {
        try {
            const response = createCustomerPromise(data);

            toast.promise(response, {
                loading: "Creating account...",
                success: () => {
                    return "Successfully created customer account!";
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
    }

    return (
        <>
            <Dialog>
                <Toaster position="bottom-right" richColors={true} />
                <DialogTrigger asChild>
                    <Button variant="ghost">Create Staff Account</Button>
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
