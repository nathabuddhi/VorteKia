import { MaintenanceJob } from "@/types";
import { useNavigate } from "react-router";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/!!ui/card";
import { ShineBorder } from "@/components/!magicui/shine-border";
import { Label } from "@/components/!!ui/label";
import { InteractiveHoverButton } from "@/components/!magicui/interactive-hover-button";

export function ManageJobCard({ job }: { job: MaintenanceJob }) {
    const navigate = useNavigate();

    return (
        <Card className="w-[29rem] relative">
            <ShineBorder
                shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
                className="max-w-[29rem]"
            />
            <CardHeader className="pb-0">
                <CardTitle className="text-2xl pl-1 text-center">
                    {job.description}
                </CardTitle>
                <CardDescription className="pl-1 text-justify line-clamp-3">
                    {job.location}
                </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
                <Label
                    className={`${
                        job.status !== "completed" && job.status !== "rejected"
                            ? "text-red-500"
                            : "text-green-500"
                    }`}>
                    Job Status: {job.status}
                </Label>
            </CardContent>
            <CardFooter>
                <InteractiveHoverButton
                    className="w-full"
                    onClick={() =>
                        navigate("/staff/maintenance/manage-job/" + job.job_id)
                    }>
                    Manage Job
                </InteractiveHoverButton>
            </CardFooter>
        </Card>
    );
}
