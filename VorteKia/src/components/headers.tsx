import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router";
import { House } from "lucide-react";
import { useEffect, useState } from "react";
import HelloLabel from "@/components/hello-label";
import CreateStaff from "./create-staff";
import {
    getUserRole,
    getUserDivision,
    getUserName,
} from "@/controllers/user-controller";
import { logout } from "@/controllers/app-controller";
import RequestUID from "./request-uid";

export function getCurrentApp() {
    const location = useLocation();
    return location.pathname.split("/");
}

export function CustomerHeader() {
    const navigate = useNavigate();
    const [division, setDivision] = useState("INITIAL");

    useEffect(() => {
        const userDivision = getUserRole();
        setDivision(userDivision);
    }, []);

    return (
        <header className="flex h-14 w-full shrink-0 justify-between items-center px-4 absolute top-0 left-0 z-10 bg-background overflow-hidden border-b-2 border-accent">
            <Link to="/home" className="mr-6 flex hover:bg-gray-100 rounded-lg">
                <House className="h-10 w-10 p-2" />
            </Link>
            <HelloLabel username={getUserName()} />
            <nav className="ml-auto flex gap-6">
                {getCurrentApp()[1] === "login" && getUserRole() === "" && (
                    <RequestUID />
                )}
                <Button onClick={() => navigate("/home")} variant={"ghost"}>
                    Home
                </Button>
                {getCurrentApp()[1] === "ride" &&
                    getUserRole() === "customer" && (
                        <Button variant={"ghost"}>My Queue</Button>
                    )}
                {getCurrentApp()[1] === "restaurant" &&
                    getUserRole() === "customer" && (
                        <Button variant={"ghost"}>My Orders</Button>
                    )}
                {getCurrentApp()[1] === "store" &&
                    getUserRole() === "customer" && (
                        <Button variant={"ghost"}>My Transactions</Button>
                    )}
                {division === "executive" && (
                    <Button variant={"ghost"}>Executive</Button>
                )}
                <Button onClick={() => navigate("/ride")} variant={"ghost"}>
                    Browse Rides
                </Button>
                <Button
                    onClick={() => navigate("/restaurant")}
                    variant={"ghost"}>
                    Browse Restaurants
                </Button>
                <Button onClick={() => navigate("/store")} variant={"ghost"}>
                    Browse Stores
                </Button>
                {getUserRole() === "" ? (
                    <Button
                        onClick={() => navigate("/login")}
                        variant={"ghost"}>
                        Login
                    </Button>
                ) : (
                    <Button
                        onClick={() => {
                            logout();
                            navigate("/home");
                        }}
                        variant={"ghost"}>
                        Logout
                    </Button>
                )}
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
        if (
            (role !== "staff" && role !== "manager") ||
            division !== "operational"
        ) {
            navigate("/home");
        }
    }, [role, navigate]);

    return (
        <header className="flex h-14 w-full shrink-0 justify-between items-center px-4 absolute top-0 left-0 z-10 bg-background overflow-hidden border-b-2 border-accent">
            <Link to="/home" className="mr-6 flex hover:bg-gray-100 rounded-lg">
                <House className="h-10 w-10 p-2" />
            </Link>
            <HelloLabel username={getUserName()} />
            <nav className="ml-auto flex gap-6">
                <Button onClick={() => navigate("/home")} variant={"ghost"}>
                    Home
                </Button>
                {role === "manager" && (
                    <Button onClick={() => navigate("/ride")} variant={"ghost"}>
                        Manage Rides
                    </Button>
                )}
                {role === "customer" && (
                    <Button variant={"ghost"}>My Queue</Button>
                )}
                {role === "staff" && (
                    <Button variant={"ghost"}>My Assignment</Button>
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
        if (
            (role !== "chef" && role !== "supervisor" && role !== "waiter") ||
            division !== "consumption"
        ) {
            navigate("/home");
        }
    }, [role, navigate]);

    return (
        <header className="flex h-14 w-full shrink-0 justify-between items-center px-4 absolute top-0 left-0 z-10 bg-background overflow-hidden border-b-2 border-accent">
            <Link to="/home" className="mr-6 flex hover:bg-gray-100 rounded-lg">
                <House className="h-10 w-10 p-2" />
            </Link>
            <HelloLabel username={getUserName()} />
            <nav className="ml-auto flex gap-6">
                <Button onClick={() => navigate("/home")} variant={"ghost"}>
                    Home
                </Button>
                {role === "supervisor" && (
                    <Button
                        onClick={() => navigate("/restaurant")}
                        variant={"ghost"}>
                        Manage Restaurants
                    </Button>
                )}
                {role === "customer" && (
                    <Button variant={"ghost"}>My Orders</Button>
                )}
                {(role === "chef" || role === "waiter") && (
                    <Button variant={"ghost"}>My Assignment</Button>
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
        if ((role !== "staff" && role !== "manager") || division !== "retail") {
            navigate("/home");
        }
    }, [role, navigate]);

    return (
        <header className="flex h-14 w-full shrink-0 justify-between items-center px-4 absolute top-0 left-0 z-10 bg-background overflow-hidden border-b-2 border-accent">
            <Link to="/home" className="mr-6 flex hover:bg-gray-100 rounded-lg">
                <House className="h-10 w-10 p-2" />
            </Link>
            <HelloLabel username={getUserName()} />
            <nav className="ml-auto flex gap-6">
                <Button onClick={() => navigate("/home")} variant={"ghost"}>
                    Home
                </Button>
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
                {role === "staff" && (
                    <Button variant={"ghost"}>My Assignment</Button>
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
            navigate("/home");
        }
    }, [role, navigate]);

    return (
        <header className="flex h-14 w-full shrink-0 justify-between items-center px-4 absolute top-0 left-0 z-10 bg-background overflow-hidden border-b-2 border-accent">
            <Link to="/home" className="mr-6 flex hover:bg-gray-100 rounded-lg">
                <House className="h-10 w-10 p-2" />
            </Link>
            <HelloLabel username={getUserName()} />
            <nav className="ml-auto flex gap-6">
                <Button onClick={() => navigate("/home")} variant={"ghost"}>
                    Home
                </Button>
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
        if (
            (role !== "staff" && role !== "manager") ||
            division !== "maintenance"
        ) {
            navigate("/home");
        }
    }, [role, navigate]);

    return (
        <header className="flex h-14 w-full shrink-0 justify-between items-center px-4 absolute top-0 left-0 z-10 bg-background overflow-hidden border-b-2 border-accent">
            <Link to="/home" className="mr-6 flex hover:bg-gray-100 rounded-lg">
                <House className="h-10 w-10 p-2" />
            </Link>
            <HelloLabel username={getUserName()} />
            <nav className="ml-auto flex gap-6">
                <Button onClick={() => navigate("/home")} variant={"ghost"}>
                    Home
                </Button>
                {role === "staff" && (
                    <Button variant={"ghost"}>My Tasks</Button>
                )}
                {role === "manager" && (
                    <Button variant={"ghost"}>Manage Tasks</Button>
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
        if (
            (role !== "staff" &&
                role !== "manager" &&
                role !== "lostandfound") ||
            division !== "customerservice"
        ) {
            navigate("/home");
        }
    }, [role, navigate]);

    return (
        <header className="flex h-14 w-full shrink-0 justify-between items-center px-4 absolute top-0 left-0 z-10 bg-background overflow-hidden border-b-2 border-accent">
            <Link to="/home" className="mr-6 flex hover:bg-gray-100 rounded-lg">
                <House className="h-10 w-10 p-2" />
            </Link>
            <HelloLabel username={getUserName()} />
            <nav className="ml-auto flex gap-6">
                <Button onClick={() => navigate("/home")} variant={"ghost"}>
                    Home
                </Button>
                {role === "staff" && (
                    <Button variant={"ghost"}>View Lost Items</Button>
                )}
                {role === "manager" && (
                    <Button variant={"ghost"}>Create Broadcast</Button>
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

