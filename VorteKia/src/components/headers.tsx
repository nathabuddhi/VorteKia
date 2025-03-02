/**
 * v0 by Vercel.
 * @see https://v0.dev/t/lJwnQlHSEBA
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router";
import { House } from "lucide-react";
import { UserLoggedIn } from "@/types";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

export function LoggedOutHeader() {
    // useEffect(() => {
    //     // checkMiddleware();
    // }, []);
    const navigate = useNavigate();
    return (
        <header className="flex h-14 w-full shrink-0 items-center px-4 absolute top-0 left-0 z-10 bg-background overflow-hidden border-b-2 border-accent">
            <Link to="/home" className="mr-6 flex hover:bg-gray-100 rounded-lg">
                <House className="h-10 w-10 p-2" />
            </Link>
            <nav className="ml-auto flex gap-6">
                <Button onClick={() => navigate("/home")} variant={"ghost"}>
                    Home
                </Button>
                <Button onClick={() => navigate("/login")} variant={"ghost"}>
                    Login
                </Button>
            </nav>
        </header>
    );
}

export function CustomerHeader() {
    const navigate = useNavigate();

    const [user, setUser] = useState<UserLoggedIn | null>(null);

    const logout = () => {
        localStorage.removeItem("user");
        setUser(null);
        navigate("/home");
    };

    useEffect(() => {
        // checkMiddleware();
    }, []);

    return (
        <header className="flex h-14 w-full shrink-0 items-center px-4 absolute top-0 left-0 z-10 bg-background overflow-hidden border-b-2 border-accent">
            <Link to="/home" className="mr-6 flex hover:bg-gray-100 rounded-lg">
                <House className="h-10 w-10 p-2" />
            </Link>
            <nav className="ml-auto flex gap-6">
                <Label>Welcome to VorteKia, {user?.name}</Label>
                <Button onClick={() => navigate("/home")} variant={"ghost"}>
                    Home
                </Button>
                <Button onClick={() => logout()} variant={"ghost"}>
                    Logout
                </Button>
            </nav>
        </header>
    );
}

