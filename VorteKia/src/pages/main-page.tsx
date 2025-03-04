import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { MagicCard } from "@/components/magicui/magic-card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Lens } from "@/components/magicui/lens";
import { invoke } from "@tauri-apps/api/core";
import { ApiResponse, UserLoggedIn } from "@/types";

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

        invoke<ApiResponse<UserLoggedIn>>("login", {
            payload: {
                email: "",
                password: "",
            },
        });

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const fireworks = () => {
        const duration = 5 * 1000;
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
        <div className="flex flex-col items-center justify-center bg-muted p-0 h-[calc(100vh-3.5rem)] pt-20">
            <div className="m-0 w-screen flex flex-col items-center justify-center">
                <h1 className="text-6xl font-bold text-black bg-opacity-60 rounded-lg p-1 mb-2">
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
                <div className="flex gap-4 mb-32">
                    {/* Customer Card */}
                    <Card className="w-96 h-max">
                        <MagicCard gradientColor={"#D9D9D955"}>
                            <CardHeader className="pb-0">
                                <CardTitle className="text-2xl pl-1 text-center">
                                    Customer
                                </CardTitle>
                                <CardDescription className="pl-1 text-justify w-80">
                                    Lorem, ipsum dolor sit amet consectetur
                                    adipisicing elit. Totam minus aliquam
                                    repellat iste id cum! Culpa illum, debitis
                                    maiores aut dolor natus. Totam labore
                                    asperiores corporis dolor voluptates debitis
                                    voluptas?
                                    <br /> &nbsp;
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2">
                                <Card>
                                    <CardContent className="flex aspect-square items-center justify-center p-2">
                                        <img
                                            src="/images/store/svc3.png"
                                            className="object-cover rounded-lg"
                                        />
                                    </CardContent>
                                </Card>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full"
                                    onClick={() => navigate("/customer/home")}
                                    variant={"default"}>
                                    Customer Application
                                </Button>
                            </CardFooter>
                        </MagicCard>
                    </Card>
                    {/* Staff Card */}
                    <Card className="w-96 h-max">
                        <MagicCard gradientColor={"#D9D9D955"}>
                            <CardHeader className="pb-0">
                                <CardTitle className="text-2xl pl-1 text-center">
                                    Staff
                                </CardTitle>
                                <CardDescription className="pl-1 text-justify w-80">
                                    Lorem, ipsum dolor sit amet consectetur
                                    adipisicing elit. Totam minus aliquam
                                    repellat iste id cum! Culpa illum, debitis
                                    maiores aut dolor natus. Totam labore
                                    asperiores corporis dolor voluptates debitis
                                    voluptas?
                                    <br /> &nbsp;
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2">
                                <Card>
                                    <CardContent className="flex aspect-square items-center justify-center p-2">
                                        <img
                                            src="/images/store/svc3.png"
                                            className="object-cover rounded-lg"
                                        />
                                    </CardContent>
                                </Card>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full"
                                    onClick={() => navigate("/staff/login")}
                                    variant={"default"}>
                                    Staff Application
                                </Button>
                            </CardFooter>
                        </MagicCard>
                    </Card>
                </div>
            </div>
        </div>
    );
}
