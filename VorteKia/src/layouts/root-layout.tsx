import { LoggedOutHeader } from "@/components/headers";
import { ThemeProvider } from "@/components/theme-provider";
import { UserLoggedIn } from "@/types";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";

function RootLayout() {
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

    // const getHeaderComponent = () => {
    //     if (parsedUser == null) return <LoggedOutHeader />;
    //     else if (
    //         parsedUser != null &&
    //         parsedUser.role == "customer" &&
    //         parsedUser.division == "customer"
    //     )
    //         return <CustomerHeader />;
    //     else if (curr_app === "restaurant") return <RestaurantHeader />;
    //     else if (curr_app === "ride") return <RideHeader />;
    //     else if (curr_app === "store") return <StoreHeader />;
    //     else if (curr_app === "maintenance") return <MaintenanceHeader />;
    //     else if (curr_app === "executive") return <ExecutiveHeader />;
    //     else if (curr_app === "customerservice")
    //         return <CustomerServiceHeader />;
    // };

    return (
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            {/* {getHeaderComponent()} */}
            <LoggedOutHeader />
            <div className="relative flex min-h-svh flex-col bg-background overflow-hidden">
                <Outlet />
            </div>
        </ThemeProvider>
    );
}

export default RootLayout;

