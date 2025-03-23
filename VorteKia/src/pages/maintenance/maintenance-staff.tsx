import { MagicCard } from "@/components/!magicui/magic-card";
import { NeonGradientCard } from "@/components/!magicui/neon-gradient-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { MaintenanceJob, Ride } from "@/types";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    getStaffAssignment,
    submitJobReport,
} from "@/controllers/maintenance-controller";
import { Textarea } from "@/components/ui/textarea";

export default function MaintenanceStaffPage() {
    const [job, setJob] = useState<MaintenanceJob | null>(null);
    const [refresh, setRefresh] = useState(false);

    const forceRefresh = () => setRefresh((prev) => !prev);

    const fetchAssignedJob = async () => {
        const response = await getStaffAssignment();
        if (response.success) {
            setJob(response.data ? response.data : null);
        }
    };

    useEffect(() => {
        fetchAssignedJob();
    }, [job]);

    const [report, setReport] = useState<string>("");

    async function handleSubmitReport() {
        if (!report.trim()) return;

        if (!job) return;

        toast.promise(submitJobReport(report, job), {
            loading: "Submitting report...",
            success: (response) => {
                if (response.success) {
                    setTimeout(() => {
                        forceRefresh();
                    }, 1500);
                    return "Successfully submitted report!";
                } else {
                    throw new Error(
                        typeof response.message === "string"
                            ? response.message
                            : "Unknown error."
                    );
                }
            },
            error: (error) => `${error.message || error}`,
        });
    }

    if (!job)
        return (
            <div className="flex items-center justify-center text-center h-[calc(100vh-3.5rem)] w-screen">
                <NeonGradientCard className="h-[calc(100vh-10rem)] w-[calc(100vh-10rem)]">
                    <Toaster position="bottom-right" richColors expand />
                    <MagicCard
                        className="max-w-3xl mx-auto h-full bg-white p-6 rounded-lg shadow-md flex items-center justify-center"
                        gradientColor={"#D9D9D955"}>
                        <h1 className="text-2xl font-bold">No Assigned Job</h1>
                        <Label className="italic">
                            Take rest while you can.
                        </Label>
                    </MagicCard>
                </NeonGradientCard>
            </div>
        );

    return (
        <div
            className="flex items-center justify-center text-center h-[calc(100vh-3.5rem)] w-screen"
            key={String(refresh)}>
            <NeonGradientCard className="h-[calc(100vh-10rem)] w-[calc(100vh-10rem)]">
                <Toaster position="bottom-right" richColors expand />
                <MagicCard
                    className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md"
                    gradientColor={"#D9D9D955"}>
                    <h1 className="text-2xl font-bold">{job.description}</h1>
                    <p className="text-gray-600">Location: {job.location}</p>

                    <div className="mt-4 flex flex-col gap-y-2">
                        <Label>Job Details: {job.notes}</Label>
                        <Label>Job Status: {job.status}</Label>
                        <Label>
                            Job Deadline: $
                            {job.deadline
                                ? job.deadline
                                : "This job has no deadline."}
                        </Label>
                    </div>
                    <div className="mt-6 flex justify-between">
                        <Dialog>
                            <DialogTrigger>
                                <Button variant={"outline"}>Fill Report</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <Card>
                                    <MagicCard gradientColor={"#D9D9D955"}>
                                        <CardHeader className="flex flex-col items-center">
                                            <CardTitle className="text-2xl">
                                                Job Report
                                            </CardTitle>
                                            <CardDescription className="text-center">
                                                Fill this out once you've
                                                completed the job. Your manager
                                                will review this before
                                                completion.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Textarea
                                                placeholder="Type Here"
                                                className="w-[90%]"
                                                value={report}
                                                onChange={(e) =>
                                                    setReport(e.target.value)
                                                }
                                            />
                                            <Button
                                                variant={"ghost"}
                                                onClick={handleSubmitReport}>
                                                Submit Report
                                            </Button>
                                        </CardContent>
                                    </MagicCard>
                                </Card>
                            </DialogContent>
                        </Dialog>
                    </div>
                </MagicCard>
            </NeonGradientCard>
        </div>
    );
}
