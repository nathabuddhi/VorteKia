import { getAssignedRide } from "@/controllers/staff-controller";
import { Ride } from "@/types";
import { useEffect, useState } from "react";

export default function RideStaffPage() {
    const [ride, setRide] = useState<Ride | null>(null);

    const fetchAssignedRide = async () => {
        const response = await getAssignedRide();
        console.log("Staff: " + response.message);

        if (response.success) {
            setRide(response.data);
        }
    };

    useEffect(() => {
        fetchAssignedRide();
    }, [ride]);

    return (
        <div className="">
            <h1>Ride Staff Page</h1>
        </div>
    );
}
