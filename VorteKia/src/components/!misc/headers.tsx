import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router";
import { House } from "lucide-react";
import { useEffect, useState } from "react";
import HelloLabel from "@/components/!misc/hello-label";
import CreateStaff from "../executive/create-staff";
import {
    getUserRole,
    getUserDivision,
    getUserSession,
} from "@/controllers/user-controller";
import {
    is_backend_routing,
    logout,
    useAutoLogout,
} from "@/controllers/app-controller";
import RequestUID from "../customer/request-uid";
import CreateCustomer from "../customerservice/create-customer";
import TopUpBalance from "../customer/top-up-balance";
import NotificationList from "./notification-list";
import ChatBox from "./chat-box";
import CreateBroadcast from "../customerservice/create-broadcast";
import ViewProposals from "../executive/view-proposals";
import CreateProposal from "../generalstaff/create-proposal";
import CreateJob from "../maintenance/create-job";
import CreateItemDialog from "../customerservice/create-item";
import DeleteRideDialog from "../executive/delete-ride";
import CreateRestaurantDialog from "../restaurant/create-restaurant";
import CreateRideDialog from "../ride/create-ride";

export function getCurrentApp() {
    const location = useLocation();
    return location.pathname.split("/");
}

export function MainHeader() {
    const navigate = useNavigate();

    return (
        <header className="flex h-14 w-full shrink-0 justify-between items-center px-4 absolute top-0 left-0 z-10 bg-background overflow-hidden border-b-2 border-accent">
            <Link
                to="/main/home"
                className="mr-6 flex hover:bg-gray-100 rounded-lg">
                <House className="h-10 w-10 p-2" />
            </Link>
            <HelloLabel />
            <nav className="ml-auto flex gap-6">
                <Button
                    onClick={() => navigate("/customer/home")}
                    variant={"ghost"}>
                    Customer Application
                </Button>
                <Button
                    onClick={() => navigate("/staff/login")}
                    variant={"ghost"}
                    disabled>
                    Staff Application
                </Button>
            </nav>
        </header>
    );
}

export function StaffHeader() {
    const navigate = useNavigate();

    return (
        <header className="flex h-14 w-full shrink-0 justify-between items-center px-4 absolute top-0 left-0 z-10 bg-background overflow-hidden border-b-2 border-accent">
            <Link to="/home" className="mr-6 flex hover:bg-gray-100 rounded-lg">
                <House className="h-10 w-10 p-2" />
            </Link>
            {getUserRole() === "official" && <ChatBox />}
            {getUserRole() === "official" && <NotificationList />}
            <HelloLabel />
            <nav className="ml-auto flex gap-6">
                {!is_backend_routing() && (
                    <Button
                        onClick={() => navigate("/main/home")}
                        variant={"ghost"}>
                        Back To Main
                    </Button>
                )}
                {getUserRole() !== "" && (
                    <Button
                        onClick={() => {
                            logout();
                            navigate("/main/home");
                        }}
                        variant={"ghost"}>
                        Logout
                    </Button>
                )}
            </nav>
        </header>
    );
}

export function CustomerHeader() {
    const navigate = useNavigate();

    const role = getUserRole();
    useAutoLogout(role !== "");

    return (
        <header className="flex h-14 w-full shrink-0 justify-between items-center px-4 absolute top-0 left-0 z-10 bg-background overflow-hidden border-b-2 border-accent">
            <Link
                to="/main/home"
                className="mr-6 flex hover:bg-gray-100 rounded-lg">
                <House className="h-10 w-10 p-2" />
            </Link>
            {getUserSession() && <ChatBox />}
            {getUserSession() && <NotificationList />}
            <HelloLabel key={role} />
            <nav className="ml-auto flex gap-3">
                {getCurrentApp()[2] === "login" && <RequestUID />}
                {getCurrentApp()[2] === "home" ? (
                    <Button
                        onClick={() => {
                            logout();
                            navigate("/main/home");
                        }}
                        variant={"ghost"}>
                        Back to Main Page
                    </Button>
                ) : (
                    !is_backend_routing() && (
                        <Button
                            onClick={() => {
                                logout();
                                navigate("/customer/home");
                            }}
                            variant={"ghost"}>
                            Back to Customer Page
                        </Button>
                    )
                )}
                {getUserRole() === "customer" && <TopUpBalance />}
                {!is_backend_routing() && (
                    <>
                        <Button
                            onClick={() => navigate("/ride")}
                            variant={"ghost"}>
                            Browse Rides
                        </Button>
                        <Button
                            onClick={() => navigate("/restaurant")}
                            variant={"ghost"}>
                            Browse Restaurants
                        </Button>
                        <Button
                            onClick={() => navigate("/store")}
                            variant={"ghost"}>
                            Browse Stores
                        </Button>
                    </>
                )}
                {getCurrentApp()[2] !== "login" &&
                    (getUserRole() === "" ? (
                        <Button
                            onClick={() => navigate("/customer/login")}
                            variant={"ghost"}>
                            Login
                        </Button>
                    ) : (
                        <Button
                            onClick={() => {
                                logout();
                                navigate("/main/home");
                            }}
                            variant={"ghost"}>
                            Logout
                        </Button>
                    ))}
            </nav>
        </header>
    );
}

export function RideHeader() {
    const navigate = useNavigate();
    const [role, setRole] = useState("INITIAL");
    const [division, setDivision] = useState("INITIAL");

    useEffect(() => {
        const userRole = getUserRole();
        setRole(userRole);

        const userDivision = getUserDivision();
        setDivision(userDivision);
    }, []);

    useEffect(() => {
        if (role === "INITIAL" || division === "INITIAL") return;
        if (division !== "operational" && division !== "executive") {
            logout();
            navigate("/main/home");
        }
    }, [role, navigate]);

    return (
        <header className="flex h-14 w-full shrink-0 justify-between items-center px-4 absolute top-0 left-0 z-10 bg-background overflow-hidden border-b-2 border-accent">
            <Link
                to="/staff/login"
                className="mr-6 flex hover:bg-gray-100 rounded-lg">
                <House className="h-10 w-10 p-2" />
            </Link>
            {getUserSession() && <ChatBox />}
            {getUserSession() && <NotificationList />}
            <HelloLabel />
            <nav className="ml-auto flex gap-6">
                {division === "executive" && (
                    <Button
                        onClick={() => navigate("/staff/login")}
                        variant={"ghost"}>
                        Back to Executive Page
                    </Button>
                )}
                {role === "manager" && (
                    <Button
                        onClick={() => navigate("/staff/ride/manager")}
                        variant={"ghost"}>
                        Manage Rides
                    </Button>
                )}
                {role === "manager" && <CreateProposal />}
                <Button
                    onClick={() => {
                        logout();
                        navigate("/main/home");
                    }}
                    variant={"ghost"}>
                    Logout
                </Button>
            </nav>
        </header>
    );
}

export function RestaurantHeader() {
    const navigate = useNavigate();
    const [role, setRole] = useState("INITIAL");
    const [division, setDivision] = useState("INITIAL");

    useEffect(() => {
        const userRole = getUserRole();
        setRole(userRole);
        const userDivision = getUserDivision();
        setDivision(userDivision);
    }, []);

    useEffect(() => {
        if (role === "INITIAL" || division === "INITIAL") return;
        if (division !== "consumption" && division !== "executive") {
            logout();
            navigate("/main/home");
        }
    }, [role, navigate]);

    return (
        <header className="flex h-14 w-full shrink-0 justify-between items-center px-4 absolute top-0 left-0 z-10 bg-background overflow-hidden border-b-2 border-accent">
            <Link
                to="/staff/login"
                className="mr-6 flex hover:bg-gray-100 rounded-lg">
                <House className="h-10 w-10 p-2" />
            </Link>
            {getUserSession() && <ChatBox />}
            {getUserSession() && <NotificationList />}
            <HelloLabel />
            <nav className="ml-auto flex gap-6">
                {division === "executive" && (
                    <Button
                        onClick={() => navigate("/staff/login")}
                        variant={"ghost"}>
                        Back to Executive Page
                    </Button>
                )}
                {role === "supervisor" && (
                    <Button
                        onClick={() => navigate("/staff/restaurant/supervisor")}
                        variant={"ghost"}>
                        Manage Restaurants
                    </Button>
                )}
                {role === "supervisor" && <CreateProposal />}
                <Button
                    onClick={() => {
                        logout();
                        navigate("/main/home");
                    }}
                    variant={"ghost"}>
                    Logout
                </Button>
            </nav>
        </header>
    );
}

export function StoreHeader() {
    const navigate = useNavigate();
    const [role, setRole] = useState("INITIAL");
    const [division, setDivision] = useState("INITIAL");

    useEffect(() => {
        const userRole = getUserRole();
        setRole(userRole);
        const userDivision = getUserDivision();
        setDivision(userDivision);
    }, []);

    useEffect(() => {
        if (role === "INITIAL" || division === "INITIAL") return;
        if (division !== "retail" && division !== "executive") {
            logout();
            navigate("/main/home");
        }
    }, [role, navigate]);

    return (
        <header className="flex h-14 w-full shrink-0 justify-between items-center px-4 absolute top-0 left-0 z-10 bg-background overflow-hidden border-b-2 border-accent">
            <Link
                to="/staff/login"
                className="mr-6 flex hover:bg-gray-100 rounded-lg">
                <House className="h-10 w-10 p-2" />
            </Link>
            {getUserSession() && <ChatBox />}
            {getUserSession() && <NotificationList />}
            <HelloLabel />
            <nav className="ml-auto flex gap-6">
                {division === "executive" && (
                    <Button
                        onClick={() => navigate("/staff/login")}
                        variant={"ghost"}>
                        Back to Executive Page
                    </Button>
                )}
                {role === "supervisor" && (
                    <Button
                        onClick={() => navigate("/store")}
                        variant={"ghost"}>
                        Manage Stores
                    </Button>
                )}
                <Button
                    onClick={() => {
                        logout();
                        navigate("/home");
                    }}
                    variant={"ghost"}>
                    Logout
                </Button>
            </nav>
        </header>
    );
}

export function ExecutiveHeader() {
    const navigate = useNavigate();
    const [role, setRole] = useState("INITIAL");

    useEffect(() => {
        const userRole = getUserRole();
        setRole(userRole);
    }, []);

    useEffect(() => {
        if (role === "INITIAL") return;
        if (role !== "coo" && role !== "ceo" && role !== "cfo") {
            logout();
            navigate("/main/home");
        }
    }, [role, navigate]);

    return (
        <header className="flex h-14 w-full shrink-0 justify-between items-center px-4 absolute top-0 left-0 z-10 bg-background overflow-hidden border-b-2 border-accent">
            <Link
                to="/staff/login"
                className="mr-6 flex hover:bg-gray-100 rounded-lg">
                <House className="h-10 w-10 p-2" />
            </Link>
            {getUserSession() && <ChatBox />}
            {getUserSession() && <NotificationList />}
            <HelloLabel />
            <nav className="ml-auto flex gap-3">
                <ViewProposals />
                {(role === "coo" || role === "ceo") && <CreateRideDialog />}
                {(role === "cfo" || role === "ceo") && (
                    <CreateRestaurantDialog />
                )}
                {(role === "coo" || role === "ceo") && <DeleteRideDialog />}
                {/* {(role === "coo" || role === "ceo") && <DeleteRestaurantDialog />} */}
                {(role === "coo" || role === "ceo") && <CreateStaff />}
                <Button
                    onClick={() => {
                        logout();
                        navigate("/home");
                    }}
                    variant={"ghost"}>
                    Logout
                </Button>
            </nav>
        </header>
    );
}

export function MaintenanceHeader() {
    const navigate = useNavigate();
    const [role, setRole] = useState("INITIAL");
    const [division, setDivision] = useState("INITIAL");

    useEffect(() => {
        const userRole = getUserRole();
        setRole(userRole);
        const userDivision = getUserDivision();
        setDivision(userDivision);
    }, []);

    useEffect(() => {
        if (role === "INITIAL") return;
        if (division !== "maintenance" && division !== "executive") {
            logout();
            navigate("/home");
        }
    }, [role, navigate]);

    return (
        <header className="flex h-14 w-full shrink-0 justify-between items-center px-4 absolute top-0 left-0 z-10 bg-background overflow-hidden border-b-2 border-accent">
            <Link
                to="/staff/login"
                className="mr-6 flex hover:bg-gray-100 rounded-lg">
                <House className="h-10 w-10 p-2" />
            </Link>
            {getUserSession() && <ChatBox />}
            {getUserSession() && <NotificationList />}
            <HelloLabel />
            <nav className="ml-auto flex gap-6">
                {division === "executive" && (
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/staff/login")}>
                        Back to Executive Page
                    </Button>
                )}
                {role === "manager" && (
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/staff/maintenance/manager")}>
                        View Jobs
                    </Button>
                )}
                {role === "manager" && <CreateJob />}
                <Button
                    onClick={() => {
                        logout();
                        navigate("/home");
                    }}
                    variant={"ghost"}>
                    Logout
                </Button>
            </nav>
        </header>
    );
}

export function CustomerServiceHeader() {
    const navigate = useNavigate();
    const [role, setRole] = useState("INITIAL");
    const [division, setDivision] = useState("INITIAL");

    useEffect(() => {
        const userRole = getUserRole();
        setRole(userRole);
        const userDivision = getUserDivision();
        setDivision(userDivision);
    }, []);

    useEffect(() => {
        if (role === "INITIAL") return;
        if (division !== "customerservice") {
            logout();
            navigate("/main/home");
        }
    }, [role, navigate]);

    return (
        <header className="flex h-14 w-full shrink-0 justify-between items-center px-4 absolute top-0 left-0 z-10 bg-background overflow-hidden border-b-2 border-accent">
            <Link
                to="/staff/login"
                className="mr-6 flex hover:bg-gray-100 rounded-lg">
                <House className="h-10 w-10 p-2" />
            </Link>
            {getUserSession() && <ChatBox />}
            {getUserSession() && <NotificationList />}
            <HelloLabel />
            <nav className="ml-auto flex gap-6">
                {(role === "staff" || role === "manager") && <CreateCustomer />}
                {(role === "lostandfound" || role === "manager") && (
                    <CreateItemDialog />
                )}
                {role === "manager" && <CreateBroadcast />}
                <Button
                    onClick={() => {
                        logout();
                        navigate("/home");
                    }}
                    variant={"ghost"}>
                    Logout
                </Button>
            </nav>
        </header>
    );
}
