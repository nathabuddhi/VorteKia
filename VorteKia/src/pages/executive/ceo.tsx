import { Label } from "@/components/ui/label";
import CFOPage from "./cfo";
import COOPage from "./coo";

export default function CEOPage() {
    return (
        <div className="flex flex-col">
            <div className="flex items-center h-96 justify-center">
                <Label className="text-5xl p-10 text-center font-extrabold">
                    As a CEO, you have access to all managerial functionality.
                    Do not abuse this privilege.
                </Label>
            </div>
            <COOPage />
            <CFOPage />
        </div>
    );
}
