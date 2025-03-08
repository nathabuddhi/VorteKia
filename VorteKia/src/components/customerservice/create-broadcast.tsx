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
import { Division } from "@/types";
import { useEffect, useState } from "react";
import { getDivisions } from "@/controllers/register-controller";
import {
    BroadcastFormSchema,
    broadcastPromise,
} from "@/controllers/cs-controller";
import { Checkbox } from "../!!ui/checkbox";
import { Label } from "../!!ui/label";

export default function CreateBroadcast() {
    const [divisions, setDivisions] = useState<Division[] | null>();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [recepients, setRecepients] = useState<string[]>([]);

    async function fetchDivisions() {
        const response = await getDivisions();

        if (response.success) setDivisions(response.data);
        else
            toast.error("Failed fetching divisions!", {
                description: "An error occured: " + response.message,
            });
    }

    useEffect(() => {
        fetchDivisions();
    }, []);

    const form = useForm<z.infer<typeof BroadcastFormSchema>>({
        resolver: zodResolver(BroadcastFormSchema),
    });

    async function sendBroadcast(data: z.infer<typeof BroadcastFormSchema>) {
        try {
            setIsDialogOpen(false);
            const response = broadcastPromise(data, recepients);
            toast.promise(response, {
                loading: "Sending Broadcast...",
                success: () => {
                    return "Successfully sent broadcast: ";
                },
                error: (error) => error,
            });
        } catch (error) {
            toast.error("Failed sending broadcast!", {
                description: "An error occured: " + error,
                action: {
                    label: "Close",
                    onClick: () => {},
                },
            });
        }
    }

    const handleCheckboxChange = (divisionId: string) => {
        setRecepients((prevRecepients) =>
            prevRecepients.includes(divisionId)
                ? prevRecepients.filter((id) => id !== divisionId)
                : [...prevRecepients, divisionId]
        );
    };

    return (
        <>
            <Dialog
                open={isDialogOpen}
                onOpenChange={() => setIsDialogOpen(!isDialogOpen)}>
                <Toaster position="bottom-right" richColors={true} />
                <DialogTrigger asChild>
                    <Button variant="ghost">Create Broadcast</Button>
                </DialogTrigger>
                <DialogContent className="">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(sendBroadcast)}
                            className="space-y-6">
                            <DialogHeader>
                                <DialogTitle>Create Broadcast</DialogTitle>
                                <DialogDescription>
                                    Send a message to whole divisions,
                                    customers, or everyone.
                                </DialogDescription>
                            </DialogHeader>
                            <FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Broadcast Message</FormLabel>
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
                            <div>
                                <FormLabel>Broadcast Recepients</FormLabel>
                                {divisions?.map((division) => (
                                    <div
                                        key={division.division_id}
                                        className="flex items-center">
                                        <Checkbox
                                            id={division.division_id}
                                            checked={recepients.includes(
                                                division.division_id
                                            )}
                                            onCheckedChange={() =>
                                                handleCheckboxChange(
                                                    division.division_id
                                                )
                                            }
                                        />
                                        <Label htmlFor={division.division_id}>
                                            {division.division_name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                            <DialogFooter>
                                <Button type="submit">Send Broadcast</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}
