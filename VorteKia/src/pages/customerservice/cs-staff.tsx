import RestaurantHomePage from "../restaurant/restaurant-home";
import RideHomePage from "../ride/ride-home";

export default function CSStaffPage() {
    return (
        <div className="flex flex-col my-6">
            <RideHomePage />
            <RestaurantHomePage />
        </div>
    );
}
