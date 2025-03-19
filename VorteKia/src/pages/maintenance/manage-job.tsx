import { Label } from "@/components/!!ui/label";
import { useEffect, useState } from "react";
import { MaintenanceJob } from "@/types";
import { useNavigate } from "react-router";
import { toast, Toaster } from "sonner";

import { NeonGradientCard } from "@/components/!magicui/neon-gradient-card";
import { MagicCard } from "@/components/!magicui/magic-card";

import { getJobById } from "@/controllers/maintenance-controller";
import AllocateMaintenanceStaff from "@/components/maintenance/allocate-maintenance-job";
import EditJob from "@/components/maintenance/edit-job";

export default function ManageJobPage() {
    const [job, setJob] = useState<MaintenanceJob | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const url = new URL(window.location.href);
        const pathParts = url.pathname.split("/");
        const jobId = pathParts[pathParts.length - 1];

        const fetchRideDetails = async () => {
            const response = await getJobById(jobId);
            if (response.data === null) {
                toast.error("Job Not Found!", {
                    description:
                        "This job does not exist. Redirecting in half a second.",
                });
                setTimeout(() => {
                    navigate("/staff/maintenance/manager");
                }, 500);
            }
            setJob(response.data);
        };

        fetchRideDetails();
    }, [navigate]);

    if (!job) return null;

    return (
        <div className="flex items-center justify-center text-center h-[calc(100vh-3.5rem)] w-screen">
            <NeonGradientCard className="h-[calc(100vh-10rem)] w-[calc(100vh-10rem)]">
                <Toaster position="bottom-right" richColors expand />
                <MagicCard
                    className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md h-full flex items-center justify-evenly"
                    gradientColor={"#D9D9D955"}>
                    <h1 className="text-2xl font-bold">{job.description}</h1>
                    <p className="text-gray-600">Location: {job.location}</p>

                    <div className="mt-4 flex flex-col gap-y-2">
                        <Label>
                            Job Details:
                            <br />
                            {job.notes}
                        </Label>
                        <br />
                        <Label>Job Status: {job.status}</Label>
                        <br />
                        <Label>
                            Job Deadline: <br />
                            {job.deadline ? (
                                job.deadline
                            ) : (
                                <i>This job has no deadline.</i>
                            )}
                        </Label>
                        <br />
                        <Label>Staff Report: {job.report}</Label>
                        <br />
                    </div>
                    <div className="mt-6 flex justify-evenly">
                        {job && <AllocateMaintenanceStaff jobId={job.job_id} />}
                        {job && <EditJob job={job} />}
                    </div>
                </MagicCard>
            </NeonGradientCard>
        </div>
    );
}
