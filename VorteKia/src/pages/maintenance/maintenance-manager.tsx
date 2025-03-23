import { ManageJobCard } from "@/components/maintenance/manage-job-card";
import { getAllJobs } from "@/controllers/maintenance-controller";
import { MaintenanceJob } from "@/types";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";

export default function MaintenanceManagerPage() {
    const [jobs, setJobs] = useState<MaintenanceJob[] | null>(null);
    const [remainingJobs, setRemainingJobs] = useState<MaintenanceJob[] | null>(
        null
    );

    const fetchRides = async () => {
        const response = await getAllJobs();

        if (response.success) {
            if (response.data && response.data.length % 3 !== 0) {
                const nearestMultipleOfThree =
                    Math.floor(response.data.length / 3) * 3;
                const slicedData = response.data.slice(
                    0,
                    nearestMultipleOfThree
                );
                const remainingData = response.data.slice(
                    nearestMultipleOfThree
                );

                setJobs(slicedData);
                setRemainingJobs(remainingData);
            } else {
                setJobs(response.data);
                setRemainingJobs([]);
            }
        } else {
            toast.error("Failed fetching rides!", {
                description: "An error occurred: " + response.message,
            });
        }
    };

    useEffect(() => {
        fetchRides();
    }, []);

    return (
        <div className="p-4">
            <Toaster position="bottom-right" richColors />
            <h1 className="text-4xl font-bold mb-4 text-center">
                Maintenance Manager Page
            </h1>
            <div
                className={`justify-between grid gap-6 ${
                    jobs && jobs.length <= 2 ? "grid-cols-1" : "grid-cols-3"
                }`}>
                {jobs?.map((j) => (
                    <ManageJobCard key={j.job_id} job={j} />
                ))}
            </div>
            <div
                className={
                    "flex justify-center items-center mt-5 flex-wrap gap-x-6"
                }>
                {remainingJobs?.map((j) => (
                    <ManageJobCard key={j.job_id} job={j} />
                ))}
            </div>
        </div>
    );
}
