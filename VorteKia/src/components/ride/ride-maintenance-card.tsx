import { toast } from "sonner";
import { Button } from "@/components/!!ui/button";
import { ClipboardCheck } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/!!ui/card";
import { useEffect, useState } from "react";
import { MaintenanceJob } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    createMaintenanceRequest,
    getMaintenanceHistory,
    MaintenanceRequestSchema,
} from "@/controllers/maintenance-controller";
import { Label } from "../!!ui/label";
import { ScrollArea } from "../!!ui/scroll-area";
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
import { useNavigate } from "react-router";
import { Input } from "../!!ui/input";
import { Textarea } from "../!!ui/textarea";

export default function RideMaintenanceCard({ rideId }: { rideId: string }) {
    const [maintenanceHistory, setMaintenanceHistory] = useState<
        MaintenanceJob[] | null
    >(null);

    const navigate = useNavigate();

    const fetchMaintenanceHistory = async () => {
        const response = await getMaintenanceHistory(rideId);

        setMaintenanceHistory(response.data);
    };

    useEffect(() => {
        if (maintenanceHistory !== null) return;
        fetchMaintenanceHistory();
    }, []);

    const form = useForm<z.infer<typeof MaintenanceRequestSchema>>({
        resolver: zodResolver(MaintenanceRequestSchema),
    });

    async function requestMaintenance(
        data: z.infer<typeof MaintenanceRequestSchema>
    ) {
        try {
            const response = createMaintenanceRequest(data, rideId);
            toast.promise(response, {
                loading: "Submitting request...",
                success: () => {
                    setTimeout(() => {
                        navigate("/staff/ride/manager");
                    }, 2000);
                    return "Successfully submitted maintenance request!";
                },
                error: (error) => `${error.message || error}`,
            });
        } catch (error) {
            toast.error("Failed submitting maintenance request!", {
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
                <DialogTrigger asChild>
                    <Button variant="outline">Ride Maintenance</Button>
                </DialogTrigger>
                <DialogContent>
                    <Tabs defaultValue="history" className="w-[30rem]">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="history">History</TabsTrigger>
                            <TabsTrigger value="create">Create</TabsTrigger>
                        </TabsList>
                        <TabsContent value="history">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Maintenance history</CardTitle>
                                    <CardDescription>
                                        View all past and current maintenance
                                        job/requests related to this ride.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <ScrollArea className="max-h-96">
                                        {maintenanceHistory?.map((job) => (
                                            <Card key={job.job_id}>
                                                <CardHeader>
                                                    <Label>
                                                        <i>
                                                            Maintenance ID{" "}
                                                            {job.job_id}
                                                        </i>
                                                    </Label>
                                                    <CardTitle>
                                                        Description:{" "}
                                                        {job.description}
                                                    </CardTitle>
                                                    <CardDescription>
                                                        Status: {job.status}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <h1 className="font-bold text-lg">
                                                        Details:{" "}
                                                    </h1>
                                                    <Label>{job.notes}</Label>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </ScrollArea>
                                    {maintenanceHistory?.length === 0 && (
                                        <Label className="flex items-center space-x-2 justify-center">
                                            <ClipboardCheck />
                                            <p>
                                                No Maintenance History Found.
                                                Ride is safe and sound.
                                            </p>
                                        </Label>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="create">
                            <Card>
                                <CardHeader className="pt-0"></CardHeader>
                                <CardContent className="space-y-2">
                                    <Form {...form}>
                                        <form
                                            onSubmit={form.handleSubmit(
                                                requestMaintenance
                                            )}
                                            className="space-y-6">
                                            <DialogHeader>
                                                <DialogTitle>
                                                    Create Maintenance Request
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Ride safety not 100%? Submit
                                                    a maintenance request
                                                    immediately. This will
                                                    immediately make the ride
                                                    non-operational.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <FormField
                                                control={form.control}
                                                name="description"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Problem Description
                                                            (Short)
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
                                                        <FormLabel>
                                                            Problem Notes (Long)
                                                        </FormLabel>
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
                                                    Submit Maintenance Request
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </Form>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>
        </>
    );
}
