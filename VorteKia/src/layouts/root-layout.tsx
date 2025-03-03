import {
    CustomerHeader,
    CustomerServiceHeader,
    ExecutiveHeader,
    MaintenanceHeader,
    RestaurantHeader,
    RideHeader,
    StoreHeader,
} from "@/components/headers";
import { ThemeProvider } from "@/components/theme-provider";
import { UserLoggedIn } from "@/types";
import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";

export default function RootLayout() {
    const user = localStorage.getItem("user");
    const parsedUser: UserLoggedIn | null = user ? JSON.parse(user) : null;

    const location = useLocation();
    const navigate = useNavigate();

    let curr_app = location.pathname.split("/")[1];

    useEffect(() => {
        if (parsedUser == null) {
            navigate("/home");
        }
    }, []);

    const getHeaderComponent = () => {
        if (
            (parsedUser != null &&
                parsedUser.role == "customer" &&
                parsedUser.division == "customer") ||
            parsedUser == null ||
            curr_app === "home" ||
            curr_app === "register" ||
            curr_app === "login" ||
            curr_app === ""
        )
            return <CustomerHeader />;
        else if (curr_app === "ride") return <RideHeader />;
        else if (curr_app === "restaurant") return <RestaurantHeader />;
        else if (curr_app === "store") return <StoreHeader />;
        else if (curr_app === "maintenance") return <MaintenanceHeader />;
        else if (curr_app === "ceo" || curr_app === "coo" || curr_app === "cfo")
            return <ExecutiveHeader />;
        else if (curr_app === "customerservice")
            return <CustomerServiceHeader />;
    };

    return (
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            {getHeaderComponent()}
            <div className="relative flex h-[100vh-3.5rem] flex-col bg-background overflow-hidden mt-14">
                <Outlet />
            </div>
        </ThemeProvider>
    );
}

