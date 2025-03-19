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
import {
    createProposalPromise,
    CreateProposalSchema,
} from "@/controllers/proposal-controller";
import { Textarea } from "../!!ui/textarea";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/!!ui/select";

export default function CreateProposal() {
    const form = useForm<z.infer<typeof CreateProposalSchema>>({
        resolver: zodResolver(CreateProposalSchema),
    });

    async function createProposal(data: z.infer<typeof CreateProposalSchema>) {
        try {
            const response = createProposalPromise(data);
            toast.promise(response, {
                loading: "Submitting proposal...",
                success: () => {
                    return "Successfully submitted proposal!";
                },
                error: (error) => `${error.message || error}`,
            });
        } catch (error) {
            toast.error("Failed creating proposal!", {
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
                    <Button variant="ghost">Create Proposal</Button>
                </DialogTrigger>
                <DialogContent className="w-[27.8rem]">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(createProposal)}
                            className="space-y-6">
                            <DialogHeader>
                                <DialogTitle>Create Proposal</DialogTitle>
                                <DialogDescription>
                                    Submit proposals according to your new idea.
                                </DialogDescription>
                            </DialogHeader>
                            <FormField
                                control={form.control}
                                name="subject"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Proposal Subject</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Subject"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Proposal Content</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Content"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="recepient"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Who is this proposal for?
                                        </FormLabel>
                                        <FormControl>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectItem value="ceo">
                                                            Chief Executive
                                                            Officer
                                                        </SelectItem>
                                                        <SelectItem value="coo">
                                                            Chief Operational
                                                            Officer
                                                        </SelectItem>
                                                        <SelectItem value="cfo">
                                                            Chief Financial
                                                            Officer
                                                        </SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter className="flex flex-col w-full">
                                <Button type="submit">Submit Proposal</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}
