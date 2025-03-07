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
import { Textarea } from "../!!ui/textarea";
import {
    editJobPromise,
    EditJobSchema,
} from "@/controllers/maintenance-controller";
import {
    Select,
    SelectContent,
    SelectTrigger,
    SelectItem,
    SelectGroup,
    SelectValue,
    SelectLabel,
} from "@/components/!!ui/select";
import { MaintenanceJob } from "@/types";
import { Calendar } from "../ui/calendar";
import { ScrollArea } from "../!!ui/scroll-area";

export default function EditJob(job: { job: MaintenanceJob }) {
    const form = useForm<z.infer<typeof EditJobSchema>>({
        resolver: zodResolver(EditJobSchema),
    });

    async function editJob(data: z.infer<typeof EditJobSchema>) {
        try {
            const response = editJobPromise(data);
            toast.promise(response, {
                loading: "Updating job...",
                success: () => {
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                    return "Successfully update job!";
                },
                error: (error) => `${error.message || error}`,
            });
        } catch (error) {
            toast.error("Failed updating job!", {
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
                    <Button variant="ghost">Update Job Details</Button>
                </DialogTrigger>
                <DialogContent className="w-[27.8rem]">
                    <ScrollArea className="max-h-96">
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(editJob)}
                                className="space-y-6">
                                <DialogHeader>
                                    <DialogTitle>Update Ride</DialogTitle>
                                    <DialogDescription>
                                        Make sure to update the ride details
                                        correctly.
                                    </DialogDescription>
                                </DialogHeader>
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Job Description
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Job Description"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Location</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Location"
                                                    {...field}
                                                />
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
                                            <FormLabel>Job Status</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                required>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Job Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectLabel>
                                                            Status
                                                        </SelectLabel>
                                                        <SelectItem
                                                            key="pending"
                                                            value="pending">
                                                            Pending
                                                        </SelectItem>
                                                        <SelectItem
                                                            key="progress"
                                                            value="progress">
                                                            In Progress
                                                        </SelectItem>
                                                        <SelectItem
                                                            key="completed"
                                                            value="completed">
                                                            Completed
                                                        </SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="deadline"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Deadline</FormLabel>
                                            <FormControl>
                                                <Calendar
                                                    mode="single"
                                                    className="rounded-md border"
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
                                            <FormLabel>Notes</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Notes"
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
                                            <FormLabel>Report</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Report"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter className="flex flex-col w-full">
                                    <Button type="submit">Update</Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </>
    );
}
