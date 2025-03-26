import { Label } from "@/components/ui/label";
import { getCurrentApp } from "@/components/!misc/headers";
import { ApiResponse, Income } from "@/types";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import StoreManagerPage from "../store/store-manager";
import RestaurantSupervisorPage from "../restaurant/restaurant-supervisor";

export default function CFOPage() {
    const [income, setIncome] = useState<Income | null>(null);
    const [type, setType] = useState("all");

    async function fetchCFOIncome() {
        const response = await invoke<ApiResponse<Income>>("get_cfo_income", {
            payload: type,
        });

        if (response) {
            setIncome(response.data);
        }
    }

    useEffect(() => {
        fetchCFOIncome();
    }, [type]);

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
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <div className="w-full flex flex-col justify-center items-center mb-10">
                <div className="flex w-full justify-center gap-5">
                    <h1 className="text-3xl font-bold text-center">
                        Financial Information
                    </h1>
                    <Select onValueChange={setType}>
                        <SelectTrigger
                            className="w-2/12 h-12"
                            defaultValue={"all"}>
                            <SelectValue placeholder="Filter by Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="day">Day</SelectItem>
                            <SelectItem value="week">Week</SelectItem>
                            <SelectItem value="month">Month</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-col">
                    <Label className="text-2xl font-semibold">
                        Restaurant Income: ${income?.consumption}
                    </Label>
                    <Label className="text-2xl font-semibold">
                        Ride Income: ${income?.operational}
                    </Label>
                    <Label className="text-2xl font-semibold">
                        Store Income: ${income?.marketing}
                    </Label>
                </div>
            </div>
            <br />
            <br />
            <br />
            <div className="flex flex-col gap-y-10">
                <RestaurantSupervisorPage />
                <br />
                <br />
                <br />
                <StoreManagerPage />
            </div>
        </div>
    );
}
