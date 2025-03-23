import { Label } from "@/components/ui/label";
import { getCurrentApp } from "@/components/!misc/headers";

export default function CFOPage() {
    return (
        <div className="">
            {getCurrentApp()[2] === "cfo" && (
                <div className="flex items-center h-96 justify-center">
                    <Label className="text-5xl p-10 text-center font-extrabold">
                        As a CFO, you have access to all financial related
                        managerial functionality. Do not abuse this privilege.
                    </Label>
                </div>
            )}
        </div>
    );
}
