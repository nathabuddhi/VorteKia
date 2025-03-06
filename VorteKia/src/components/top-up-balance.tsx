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
import { useEffect, useState } from "react";
import {
    getUserBalance,
    getUserSession,
    topUpBalancePromise,
    TopUpFormSchema,
} from "@/controllers/user-controller";
import { Label } from "./ui/label";

export default function TopUpBalance() {
    const [open, setOpen] = useState(false);

    const form = useForm<z.infer<typeof TopUpFormSchema>>({
        resolver: zodResolver(TopUpFormSchema),
    });

    async function topUpBalance(data: z.infer<typeof TopUpFormSchema>) {
        try {
            console.log("TOP UP CLICKED");
            const response = await topUpBalancePromise(data);
            console.log(response);

            toast.promise(Promise.resolve(response), {
                loading: "Topping up...",
                success: () => {
                    setOpen(false);
                    setBalance(balance + data.amount);
                    const user = getUserSession();
                    if (user === null) return;
                    user.balance += data.amount;
                    localStorage.removeItem("user");
                    localStorage.setItem("user", JSON.stringify(user));
                    return "Successfully topped up balance!";
                },
                error: (error) => `${error.message || error}`,
            });
        } catch (error) {
            toast.error("Failed topping up balance!", {
                description: "An error occurred: " + error,
                action: {
                    label: "Close",
                    onClick: () => {},
                },
            });
        }
    }

    const [balance, setBalance] = useState(-1);

    useEffect(() => {
        setBalance(getUserBalance());
    }, [balance]);

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <Toaster
                    position="bottom-right"
                    richColors={true}
                    className="z-index-5001"
                />
                <DialogTrigger asChild>
                    <Button variant="ghost" onClick={() => setOpen(true)}>
                        Your Balance: ${balance}
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(topUpBalance)}
                            className="space-y-6">
                            <DialogHeader>
                                <DialogTitle>Top Up Balance</DialogTitle>
                                <DialogDescription>
                                    Top up your balance to continue enjoying our
                                    premium services at VorteKia!
                                </DialogDescription>
                            </DialogHeader>
                            <Label>Current Balance: ${getUserBalance()}</Label>
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="$100.00"
                                                {...field}
                                                type="number"
                                                onChange={(e) =>
                                                    field.onChange(
                                                        Number(e.target.value)
                                                    )
                                                }
                                                value={field.value || ""}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="submit">Top Up Balance</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}
