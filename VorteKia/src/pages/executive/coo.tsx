import { getCurrentApp } from "@/components/!misc/headers";
import MaintenanceManagerPage from "../maintenance/maintenance-manager";
import RideManagerPage from "../ride/ride-manager";
import { Label } from "@/components/ui/label";

export default function COOPage() {
    return (
        <div className="flex flex-col">
            {getCurrentApp()[2] === "coo" && (
                <div className="flex items-center h-96 justify-center">
                    <Label className="text-5xl p-10 text-center font-extrabold">
                        As a COO, you have access to all operational related
                        managerial functionality. Do not abuse this privilege.
                    </Label>
                </div>
            )}
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <RideManagerPage />
            <br />
            <br />
            <br />
            <MaintenanceManagerPage />
        </div>
    );
}
