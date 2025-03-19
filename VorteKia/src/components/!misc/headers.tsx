import { Button } from "@/components/!!ui/button";
import { Link, useLocation, useNavigate } from "react-router";
import { House } from "lucide-react";
import { useEffect, useState } from "react";
import HelloLabel from "@/components/!misc/hello-label";
import CreateStaff from "../generalstaff/create-staff";
import {
    getUserRole,
    getUserDivision,
    getUserSession,
} from "@/controllers/user-controller";
import { logout } from "@/controllers/app-controller";
import RequestUID from "../customer/request-uid";
import CreateCustomer from "../generalstaff/create-customer";
import TopUpBalance from "../customer/top-up-balance";
import CreateRide from "../ride/create-ride";
import NotificationList from "./notification-list";
import ChatBox from "./chat-box";
import CreateBroadcast from "../customerservice/create-broadcast";
import ViewProposals from "../executive/view-proposals";
import CreateProposal from "../generalstaff/create-proposal";
import CreateJob from "../maintenance/create-job";

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
                    variant={"ghost"}>
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
                <Button
                    onClick={() => navigate("/main/home")}
                    variant={"ghost"}>
                    Back To Main
                </Button>
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

    const isLoggedIn = () => {
        return getUserRole() !== "";
    };

    return (
        <header className="flex h-14 w-full shrink-0 justify-between items-center px-4 absolute top-0 left-0 z-10 bg-background overflow-hidden border-b-2 border-accent">
            <Link
                to="/customer/home"
                className="mr-6 flex hover:bg-gray-100 rounded-lg">
                <House className="h-10 w-10 p-2" />
            </Link>
            {getUserSession() && <ChatBox />}
            {getUserSession() && <NotificationList />}
            <HelloLabel />
            <nav className="ml-auto flex gap-6">
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
                    <Button
                        onClick={() => {
                            logout();
                            navigate("/customer/home");
                        }}
                        variant={"ghost"}>
                        Back to Customer Page{" "}
                    </Button>
                )}
                {getUserRole() === "customer" && <TopUpBalance />}
                {getCurrentApp()[1] === "ride" && isLoggedIn() && (
                    <Button variant={"ghost"}>My Queue</Button>
                )}
                {getCurrentApp()[1] === "store" && isLoggedIn() && (
                    <Button variant={"ghost"}>My Transactions</Button>
                )}
                {getCurrentApp()[1] === "restaurant" && isLoggedIn() && (
                    <Button variant={"ghost"}>My Orders</Button>
                )}
                {getCurrentApp()[1] === "restaurant" && (
                    <Button
                        variant={"ghost"}
                        onClick={() => navigate("/restaurant")}>
                        All Restaurants
                    </Button>
                )}
                {getCurrentApp()[1] === "ride" && (
                    <Button variant={"ghost"} onClick={() => navigate("/ride")}>
                        All Rides
                    </Button>
                )}
                {getCurrentApp()[1] === "store" && (
                    <Button
                        variant={"ghost"}
                        onClick={() => navigate("/store")}>
                        All Stores
                    </Button>
                )}
                {getCurrentApp()[1] === "customer" &&
                    (getCurrentApp()[2] === "home" ||
                        getCurrentApp()[2] === "login") && (
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
        if (division !== "operational") {
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
        if (division !== "consumption") {
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
                {role === "supervisor" && (
                    <Button
                        onClick={() => navigate("/restaurant")}
                        variant={"ghost"}>
                        Manage Restaurants
                    </Button>
                )}
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
        if (division !== "retail") {
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
                {role === "supervisor" && (
                    <Button
                        onClick={() => navigate("/store")}
                        variant={"ghost"}>
                        Manage Restaurants
                    </Button>
                )}
                {role === "customer" && (
                    <Button variant={"ghost"}>My Transactions</Button>
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
                {(role === "coo" || role === "ceo") && <CreateRide />}
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
        if (division !== "maintenance") {
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
                {role === "staff" && (
                    <Button variant={"ghost"}>View Lost Items</Button>
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
