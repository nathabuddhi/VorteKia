import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export default function HomePage() {
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
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted p-0 overflow-hidden">
            <Lens>
                <div
                    className="m-0 h-screen py-56 w-screen flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat overflow-y-hidden"
                    style={{ backgroundImage: "url('/images/home.png')" }}>
                    <h1 className="text-6xl font-bold text-white bg-neutral-700 bg-opacity-60 rounded-lg p-1 mb-2">
                        Welcome to VorteKia!
                    </h1>
                    <p className="text-xl text-center text-white bg-neutral-800 bg-opacity-60 rounded-lg p-1">
                        A Futuristic Wonderland for All Ages.
                    </p>
                </div>
            </Lens>
            <div className="pt-10 flex flex-col items-center justify-center gap-2">
                <h3 className="text-2xl font-bold mb-4">Our Services</h3>
                <div className="flex gap-4 mb-32">
                    <Card>
                        <MagicCard gradientColor={"#D9D9D955"}>
                            <CardHeader className="pb-0">
                                <CardTitle className="text-2xl pl-1 text-center">
                                    Restaurants
                                </CardTitle>
                                <CardDescription className="pl-1 text-justify w-80">
                                    Enjoy a world of flavors with diverse
                                    cuisines, from local delicacies to
                                    international dishes in a vibrant
                                    atmosphere.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2">
                                <Carousel
                                    className="w-full max-w-xs"
                                    plugins={[
                                        Autoplay({
                                            delay: 3000,
                                        }),
                                    ]}
                                    opts={{
                                        align: "start",
                                        loop: true,
                                    }}>
                                    <CarouselContent>
                                        <CarouselItem key={1}>
                                            <div className="p-1">
                                                <Card>
                                                    <CardContent className="flex aspect-square items-center justify-center p-2">
                                                        <img
                                                            src="/images/restaurant/svc1.png"
                                                            className="object-cover rounded-lg h-full w-full"
                                                        />
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </CarouselItem>
                                        <CarouselItem key={2}>
                                            <div className="p-1">
                                                <Card>
                                                    <CardContent className="flex aspect-square items-center justify-center p-2">
                                                        <img
                                                            src="/images/restaurant/svc2.png"
                                                            className="object-cover rounded-lg h-full w-full"
                                                        />
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </CarouselItem>
                                        <CarouselItem key={3}>
                                            <div className="p-1">
                                                <Card>
                                                    <CardContent className="flex aspect-square items-center justify-center p-2">
                                                        <img
                                                            src="/images/restaurant/svc3.png"
                                                            className="object-cover rounded-lg h-full w-full"
                                                        />
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </CarouselItem>
                                        <CarouselItem key={4}>
                                            <div className="p-1">
                                                <Card>
                                                    <CardContent className="flex aspect-square items-center justify-center p-2">
                                                        <img
                                                            src="/images/restaurant/svc4.png"
                                                            className="object-cover rounded-lg h-full w-full"
                                                        />
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </CarouselItem>
                                    </CarouselContent>
                                </Carousel>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full"
                                    onClick={() => navigate("/restaurant")}
                                    variant={"default"}>
                                    Explore Restaurants
                                </Button>
                            </CardFooter>
                        </MagicCard>
                    </Card>
                    <Card>
                        <MagicCard gradientColor={"#D9D9D955"}>
                            <CardHeader className="pb-0">
                                <CardTitle className="text-2xl pl-1 text-center">
                                    Rides
                                </CardTitle>
                                <CardDescription className="pl-1 text-justify w-80">
                                    Experience over 20 cutting-edge attractions,
                                    from thrilling coasters to immersive VR
                                    adventures for all ages.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2">
                                <Carousel
                                    className="w-full max-w-xs"
                                    plugins={[
                                        Autoplay({
                                            delay: 3000,
                                        }),
                                    ]}
                                    opts={{
                                        align: "start",
                                        loop: true,
                                    }}>
                                    <CarouselContent>
                                        <CarouselItem key={1}>
                                            <div className="p-1">
                                                <Card>
                                                    <CardContent className="flex aspect-square items-center justify-center p-2">
                                                        <img
                                                            src="/images/ride/svc1.png"
                                                            className="object-cover rounded-lg h-full w-full"
                                                        />
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </CarouselItem>
                                        <CarouselItem key={2}>
                                            <div className="p-1">
                                                <Card>
                                                    <CardContent className="flex aspect-square items-center justify-center p-2">
                                                        <img
                                                            src="/images/ride/svc2.png"
                                                            className="object-cover rounded-lg h-full w-full"
                                                        />
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </CarouselItem>
                                        <CarouselItem key={3}>
                                            <div className="p-1">
                                                <Card>
                                                    <CardContent className="flex aspect-square items-center justify-center p-2">
                                                        <img
                                                            src="/images/ride/svc3.png"
                                                            className="object-cover rounded-lg h-full w-full"
                                                        />
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </CarouselItem>
                                        <CarouselItem key={4}>
                                            <div className="p-1">
                                                <Card>
                                                    <CardContent className="flex aspect-square items-center justify-center p-2">
                                                        <img
                                                            src="/images/ride/svc4.png"
                                                            className="object-cover rounded-lg h-full w-full"
                                                        />
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </CarouselItem>
                                        <CarouselItem key={5}>
                                            <div className="p-1">
                                                <Card>
                                                    <CardContent className="flex aspect-square items-center justify-center p-2">
                                                        <img
                                                            src="/images/ride/svc5.png"
                                                            className="object-cover rounded-lg h-full w-full"
                                                        />
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </CarouselItem>
                                    </CarouselContent>
                                </Carousel>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full"
                                    onClick={() => navigate("/ride")}
                                    variant={"default"}>
                                    Explore Rides
                                </Button>
                            </CardFooter>
                        </MagicCard>
                    </Card>
                    <Card>
                        <MagicCard gradientColor={"#D9D9D955"}>
                            <CardHeader className="pb-0">
                                <CardTitle className="text-2xl pl-1 text-center">
                                    Stores
                                </CardTitle>
                                <CardDescription className="pl-1 text-justify w-80">
                                    Bring home exclusive souvenirs, apparel, and
                                    collectibles to keep your VorteKia memories
                                    alive.
                                    <br /> &nbsp;
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2">
                                <Carousel
                                    className="w-full max-w-xs"
                                    plugins={[
                                        Autoplay({
                                            delay: 3000,
                                        }),
                                    ]}
                                    opts={{
                                        align: "start",
                                        loop: true,
                                    }}>
                                    <CarouselContent>
                                        <CarouselItem key={1}>
                                            <div className="p-1">
                                                <Card>
                                                    <CardContent className="flex aspect-square items-center justify-center p-2">
                                                        <img
                                                            src="/images/store/svc1.png"
                                                            className="object-cover rounded-lg h-full w-full"
                                                        />
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </CarouselItem>
                                        <CarouselItem key={2}>
                                            <div className="p-1">
                                                <Card>
                                                    <CardContent className="flex aspect-square items-center justify-center p-2">
                                                        <img
                                                            src="/images/store/svc2.png"
                                                            className="object-cover rounded-lg h-full w-full"
                                                        />
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </CarouselItem>
                                        <CarouselItem key={3}>
                                            <div className="p-1">
                                                <Card>
                                                    <CardContent className="flex aspect-square items-center justify-center p-2">
                                                        <img
                                                            src="/images/store/svc3.png"
                                                            className="object-cover rounded-lg h-full w-full"
                                                        />
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </CarouselItem>
                                    </CarouselContent>
                                </Carousel>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full"
                                    onClick={() => navigate("/restaurant")}
                                    variant={"default"}>
                                    Explore Stores
                                </Button>
                            </CardFooter>
                        </MagicCard>
                    </Card>
                </div>
            </div>
        </div>
    );
}

