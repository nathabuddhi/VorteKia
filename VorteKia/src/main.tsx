import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import RootLayout from "./layouts/root-layout";
import "./App.css";
import HomePage from "./pages/home";
import StaffLogin from "./pages/staff-login";
import CustomerLogin from "./pages/cust-login";
import RegisterPage from "./pages/register";
import RideHomePage from "./pages/ride/ride-home";
import RideStaffPage from "./pages/ride/ride-staff";
import RideManagerPage from "./pages/ride/ride-manager";
import RestaurantHomePage from "./pages/restaurant/restaurant-home";
import RestaurantChefPage from "./pages/restaurant/restaurant-chef";
import RestaurantWaiterPage from "./pages/restaurant/restaurant-waiter";
import RestaurantSupervisorPage from "./pages/restaurant/restaurant-supervisor";
import StoreHomePage from "./pages/store/store-home";
import StoreStaffPage from "./pages/store/store-staff";
import StoreManagerPage from "./pages/store/store.manager";
import COOPage from "./pages/executive/coo";
import CEOPage from "./pages/executive/ceo";
import CFOPage from "./pages/executive/cfo";
import MaintenanceStaffPage from "./pages/maintenance/maintenance-staff";
import MaintenanceManagerPage from "./pages/maintenance/maintenance-manager";
import CSLostAndFoundPage from "./pages/customerservice/cs-lnf";
import CSManagerPage from "./pages/customerservice/cs-manager";
import CSStaffPage from "./pages/customerservice/cs-staff";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<RootLayout />}>
                <Route index element={<Navigate to="/home" />} />
                <Route path="home" element={<HomePage />} />
                <Route path="login" element={<CustomerLogin />} />
                <Route path="loginstaff" element={<StaffLogin />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="restaurant">
                    <Route index element={<RestaurantHomePage />} />
                    <Route path="chef" element={<RestaurantChefPage />} />
                    <Route path="waiter" element={<RestaurantWaiterPage />} />
                    <Route
                        path="supervisor"
                        element={<RestaurantSupervisorPage />}
                    />
                    {/* <Route
                        path="manage/:restaurantID"
                        element={<ManageRestaurantPage />}
                    /> */}
                    <Route path="*" element={<Navigate to="/restaurant" />} />
                </Route>
                <Route path="ride">
                    <Route index element={<RideHomePage />} />
                    <Route path="staff" element={<RideStaffPage />} />
                    <Route path="manager" element={<RideManagerPage />} />
                    {/* <Route path="manage/:rideID" element={<ManageRidePage />} /> */}
                    <Route path="*" element={<Navigate to="/ride" />} />
                </Route>
                <Route path="store">
                    <Route index element={<StoreHomePage />} />
                    <Route path="staff" element={<StoreStaffPage />} />
                    <Route path="manager" element={<StoreManagerPage />} />
                    {/* <Route path="manage/:rideID" element={<ManageStorePage />} /> */}
                    <Route path="*" element={<Navigate to="/store" />} />
                </Route>
                <Route path="ceo" element={<CEOPage />} />
                <Route path="coo" element={<COOPage />} />
                <Route path="cfo" element={<CFOPage />} />
                <Route path="maintenance">
                    <Route index element={<Navigate to="/home" />} />
                    <Route path="staff" element={<MaintenanceStaffPage />} />
                    <Route
                        path="manager"
                        element={<MaintenanceManagerPage />}
                    />
                    <Route path="*" element={<Navigate to="/maintenance" />} />
                </Route>
                <Route path="customerservice">
                    <Route index element={<Navigate to="/home" />} />
                    <Route path="staff" element={<CSStaffPage />} />
                    <Route path="manager" element={<CSManagerPage />} />
                    <Route
                        path="lostandfound"
                        element={<CSLostAndFoundPage />}
                    />
                    <Route
                        path="*"
                        element={<Navigate to="/customerservice" />}
                    />
                </Route>
                <Route path="*" element={<Navigate to="/home" />} />
            </Route>
        </Routes>
    </BrowserRouter>
);




