import { Toaster, toast } from "sonner";
import { Button } from "@/components/!!ui/button";
import { Input } from "@/components/!!ui/input";
import { format } from "date-fns";
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
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";

export default function EditJob(job: { job: MaintenanceJob }) {
    const form = useForm<z.infer<typeof EditJobSchema>>({
        resolver: zodResolver(EditJobSchema),
        defaultValues: {
            job_id: job.job.job_id,
            location: job.job.location,
            description: job.job.description,
            status: job.job.status,
            deadline: new Date(job.job.deadline),
            notes: job.job.notes,
            report: job.job.report,
        },
    });

    async function editJob(data: z.infer<typeof EditJobSchema>) {
        const response = editJobPromise(data);
        toast.promise(response, {
            loading: "Updating job...",
            success: () => {
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
                return "Successfully update job!";
            },
            error: (error) =>
                `Failed updating job! An error occurred: ${error}`,
        });
    }

    return (
        <>
            <Dialog>
                <Toaster position="bottom-right" richColors={true} />
                <DialogTrigger asChild>
                    <Button variant="outline">Update Job Details</Button>
                </DialogTrigger>
                <DialogContent className="w-[30rem]">
                    <ScrollArea className="max-h-96 p-2">
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(editJob)}
                                className="space-y-6 p-1">
                                <DialogHeader>
                                    <DialogTitle>Edit Job</DialogTitle>
                                    <DialogDescription>
                                        Make sure to update the Job Details
                                        accordingly.
                                    </DialogDescription>
                                </DialogHeader>
                                <FormField
                                    control={form.control}
                                    name="job_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Job ID</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Job Location"
                                                    defaultValue={
                                                        job.job.job_id
                                                    }
                                                    disabled
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
                                            <FormLabel>Job Location</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Job Location"
                                                    defaultValue={
                                                        job.job.location
                                                    }
                                                    disabled
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
                                                    placeholder="Job Description"
                                                    defaultValue={
                                                        job.job.description
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
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Job Status</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={job.job.status}
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
                                                            key="rejected"
                                                            value="rejected">
                                                            Rejected
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
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Job Deadline</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-[240px] pl-3 text-left font-normal",
                                                                !field.value &&
                                                                    "text-muted-foreground"
                                                            )}>
                                                            {field.value ? (
                                                                format(
                                                                    field.value,
                                                                    "PPP"
                                                                )
                                                            ) : (
                                                                <span>
                                                                    Pick a date
                                                                </span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent
                                                    className="w-auto p-0"
                                                    align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={
                                                            field.onChange
                                                        }
                                                        disabled={(date) =>
                                                            date < new Date()
                                                        }
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
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
                                                    defaultValue={job.job.notes}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="report"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Report</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Report"
                                                    // defaultValue={
                                                    //     job.job.report
                                                    // }
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter className="flex flex-col w-full">
                                    <Button type="submit">Save Changes</Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </>
    );
}
