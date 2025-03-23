import {
    CustomerHeader,
    CustomerServiceHeader,
    ExecutiveHeader,
    MainHeader,
    MaintenanceHeader,
    RestaurantHeader,
    RideHeader,
    StaffHeader,
    StoreHeader,
} from "@/components/!misc/headers";
import { ThemeProvider } from "@/components/!misc/theme-provider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserLoggedIn } from "@/types";
import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";

export default function RootLayout() {
    const user = localStorage.getItem("user");
    const parsedUser: UserLoggedIn | null = user ? JSON.parse(user) : null;

    const location = useLocation();
    const navigate = useNavigate();

    let curr_app = location.pathname.split("/")[1];
    let curr_page_app = location.pathname.split("/")[2]
        ? location.pathname.split("/")[2]
        : "";

    useEffect(() => {
        if (parsedUser == null) {
            navigate("/home");
        }
    }, []);

    const getHeaderComponent = () => {
        if (curr_app === "main") return <MainHeader />;
        else if (curr_app === "staff") {
            if (curr_page_app === "maintenance") return <MaintenanceHeader />;
            else if (
                curr_page_app === "ceo" ||
                curr_page_app === "coo" ||
                curr_page_app === "cfo"
            )
                return <ExecutiveHeader />;
            else if (curr_page_app === "official") return <StaffHeader />;
            else if (curr_page_app === "customerservice")
                return <CustomerServiceHeader />;
            else if (curr_page_app === "ride") return <RideHeader />;
            else if (curr_page_app === "restaurant")
                return <RestaurantHeader />;
            else if (curr_page_app === "store") return <StoreHeader />;
            else if (curr_page_app === "login") return <StaffHeader />;
            else navigate("/main/home");
        } else return <CustomerHeader />;
    };

    return (
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <ScrollArea className="h-screen w-full overflow-auto [&>*::-webkit-scrollbar]:w-2 [&>*::-webkit-scrollbar-thumb]:bg-gray-300 [&>*::-webkit-scrollbar-thumb]:rounded-lg">
                {getHeaderComponent()}
                <div className="relative flex h-[100vh-3.5rem] flex-col bg-background overflow-hidden mt-14">
                    <Outlet />
                </div>
            </ScrollArea>
        </ThemeProvider>
    );
}

