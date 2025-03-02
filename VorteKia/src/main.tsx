import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import RootLayout from "./layouts/root-layout";
import "./App.css";
import HomePage from "./pages/home";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<RootLayout />}>
                <Route path="home" element={<HomePage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                {/* <Route path="restaurant">
                    <Route index element={<RestaurantHomePage />} />
                    <Route path="chef" element={<RestaurantChefPage />} />
                    <Route path="waiter" element={<RestaurantWaiterPage />} />
                    <Route
                        path="supervisor"
                        element={<RestaurantSupervisorPage />}
                    />
                    <Route
                        path="manage/:restaurantID"
                        element={<ManageRestaurantPage />}
                    />{" "}
                    ini nanti pake const {restaurantID} = useParams();
                </Route> */}
                <Route path="*" element={<Navigate to="/home" />} />
            </Route>
        </Routes>
    </BrowserRouter>
);

