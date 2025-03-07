import { useEffect } from "react";
import { Button } from "@/components/!!ui/button";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/!!ui/card";
import { MagicCard } from "@/components/!magicui/magic-card";
import { invoke } from "@tauri-apps/api/core";
import { ApiResponse, UserLoggedIn } from "@/types";
import { Meteors } from "@/components/!magicui/meteors";
import { User, UserPen } from "lucide-react";

export default function MainPage() {
    const navigate = useNavigate();

    useEffect(() => {
        fireworks();
        const handleScroll = () => {
            if (window.scrollY === 0) {
                fireworks();
            }
        };

        window.addEventListener("scroll", handleScroll);

        // this is a simple fix to "initialize" the connection to the backend database
        invoke<ApiResponse<UserLoggedIn>>("login", {
            payload: {
                email: "",
                password: "",
            },
        });

        const user = localStorage.getItem("user");
        const parsedUser = user ? JSON.parse(user) : null;
        if (parsedUser) {
            if (parsedUser.role === "customer") {
                navigate("/customer/home");
            } else if (
                parsedUser.role !== "customer" &&
                parsedUser.role !== ""
            ) {
                navigate("/staff/login");
            }
        }

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const fireworks = () => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = {
            startVelocity: 30,
            spread: 360,
            ticks: 120,
            zIndex: 500,
        };

        const randomInRange = (min: number, max: number) =>
            Math.random() * (max - min) + min;

        const interval = window.setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 30 * (timeLeft / duration);
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            });
        }, 250);
    };

    return (
        <div className="flex flex-col items-center justify-center bg-muted p-0 pt-20 h-[calc(100vh-3.5rem)]">
            <div className="m-0 w-screen flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold text-black bg-opacity-60 rounded-lg p-1 my-2">
                    Welcome to VorteKia!
                </h1>
                <p className="text-xl text-center text-black bg-opacity-60 rounded-lg p-1">
                    Please confirm your role below.
                </p>
            </div>
            <div className="flex flex-col items-center justify-center gap-2">
                <h3 className="text-2xl font-bold mb-4">
                    Are you a Customer or a Staff?
                </h3>
                <Meteors
                    number={15}
                    minDuration={7.5}
                    maxDuration={10}
                    angle={215}
                />
                <div className="flex gap-4 mb-32">
                    <Card className="w-96 h-max">
                        <MagicCard gradientColor={"#D9D9D955"}>
                            <CardHeader className="pb-0">
                                <CardTitle className="text-2xl pl-1 text-center flex items-center justify-center gap-x-1.5">
                                    Customer
                                    <User size={32} />
                                </CardTitle>
                                <CardDescription className="pl-1 text-justify w-80">
                                    Explore the futuristic world of VorteKia,
                                    enjoy thrilling rides, dine at immersive
                                    restaurants, and shop for exclusive
                                    souvenirs. Plan ahead with real-time ride
                                    queues. Need help? Our Customer Service team
                                    is just a chat away, ensuring you have the
                                    best experience in this next-generation
                                    amusement park!
                                    <br /> &nbsp;
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2 scale-90">
                                <img
                                    src="/images/customer.png"
                                    className="object-cover rounded-lg"
                                />
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full"
                                    onClick={() => navigate("/customer/home")}
                                    variant={"default"}>
                                    I'm a Customer!
                                </Button>
                            </CardFooter>
                        </MagicCard>
                    </Card>
                    <Card className="w-96 h-max">
                        <MagicCard gradientColor={"#D9D9D955"}>
                            <CardHeader className="pb-0">
                                <CardTitle className="text-2xl pl-1 text-center flex items-center justify-center gap-x-2">
                                    Staff
                                    <UserPen size={32} />
                                </CardTitle>
                                <CardDescription className="pl-1 text-justify w-80">
                                    Step into the heart of VorteKia as a staff
                                    member and be part of the team that brings
                                    this high-tech amusement park to life!
                                    Operate cutting-edge rides, serve delicious
                                    meals, manage park maintenance, assist
                                    customers, and keep the park running
                                    smoothly. Join us and shape the future of
                                    entertainment at VorteKia!
                                    <br /> &nbsp;
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2 scale-90">
                                <img
                                    src="/images/staff.png"
                                    className="object-cover rounded-lg"
                                />
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full"
                                    onClick={() => navigate("/staff/login")}
                                    variant={"default"}>
                                    I work here!
                                </Button>
                            </CardFooter>
                        </MagicCard>
                    </Card>
                </div>
            </div>
        </div>
    );
}
