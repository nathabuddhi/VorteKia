import { toast } from "sonner";
import { Button } from "@/components/!!ui/button";
import {
    CreateJobSchema,
    createMaintenanceJob,
} from "@/controllers/maintenance-controller";
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
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/!!ui/form";
import { Input } from "../!!ui/input";
import { Textarea } from "../!!ui/textarea";

export default function CreateJob() {
    const form = useForm<z.infer<typeof CreateJobSchema>>({
        resolver: zodResolver(CreateJobSchema),
    });

    async function requestMaintenance(data: z.infer<typeof CreateJobSchema>) {
        try {
            const response = createMaintenanceJob(data);
            toast.promise(response, {
                loading: "Creating job...",
                success: () => {
                    setTimeout(() => {
                        window.location.reload();
                    }, 2500);
                    return "Successfully created job!";
                },
                error: (error) => `${error.message || error}`,
            });
        } catch (error) {
            toast.error("Failed creating job!", {
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
                <DialogTrigger>
                    <Button variant="ghost">Create Job</Button>
                </DialogTrigger>
                <DialogContent>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(requestMaintenance)}
                            className="space-y-6">
                            <DialogHeader>
                                <DialogTitle>
                                    Create Maintenance Job
                                </DialogTitle>
                                <DialogDescription>
                                    Create Maintenance Job based on reports or
                                    schedules maintenances.
                                </DialogDescription>
                            </DialogHeader>
                            <FormField
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Job Location </FormLabel>
                                        <FormDescription>
                                            Location ID or text.
                                        </FormDescription>
                                        <FormControl>
                                            <Input
                                                placeholder="Behind the Executive Building"
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
                                        <FormLabel>
                                            Job Description (Short)
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Short Description"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Job Notes (Long)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Details"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter className="flex flex-col w-full">
                                <Button type="submit">
                                    Create Maintenance Job
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}
