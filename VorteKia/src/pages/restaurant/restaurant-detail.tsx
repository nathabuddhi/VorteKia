import { Button } from "@/components/ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import { Label } from "@/components/ui/label";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import Autoplay from "embla-carousel-autoplay";
import { useEffect, useState } from "react";
import { Restaurant } from "@/types";
import { getRestaurantById } from "@/controllers/restaurant-controller";
import { useNavigate } from "react-router";
import { toast, Toaster } from "sonner";
import { getUserRole, refreshUserSession } from "@/controllers/user-controller";
import { NeonGradientCard } from "@/components/!magicui/neon-gradient-card";
import { MagicCard } from "@/components/!magicui/magic-card";

export default function RideDetailPage() {
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const url = new URL(window.location.href);
        const pathParts = url.pathname.split("/");
        const restaurantId = pathParts[pathParts.length - 1];

        const fetchRestaurantDetails = async () => {
            const response = await getRestaurantById(restaurantId);
            if (response.data === null) {
                toast.error("Restaurant Not Found!", {
                    description:
                        "This restaurant does not exist. Redirecting in half a second.",
                });
                console.log(response);
                setTimeout(() => {
                    navigate("/restaurant");
                }, 500);
            }
            setRestaurant(response.data);
        };

        fetchRestaurantDetails();
    }, [restaurant]);

    return (
        <div className="flex items-center justify-center text-center h-[calc(100vh-3.5rem)] w-screen">
            <NeonGradientCard className="h-[calc(100vh-10rem)] w-[calc(100vh-10rem)]">
                <Toaster position="bottom-right" richColors />
                <MagicCard
                    className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md"
                    gradientColor={"#D9D9D955"}>
                    <h1 className="text-2xl font-bold">{restaurant?.name}</h1>
                    <p className="text-gray-600">{restaurant?.description}</p>

                    <div className="mt-4 flex flex-col gap-y-2">
                        <Label>Operational Status: {restaurant?.status}</Label>
                        <Label>Restaurant Cuisine: {restaurant?.cuisine}</Label>
                    </div>

                    <Carousel
                        className="w-full mt-4"
                        plugins={[Autoplay({ delay: 3000 })]}
                        opts={{ align: "start", loop: true }}>
                        <CarouselContent>
                            {restaurant?.pictures.map((link) => (
                                <CarouselItem key={link}>
                                    <img
                                        className="w-full h-96 bg-cover bg-no-repeat rounded-lg object-cover"
                                        src={link}
                                        onError={(e) => {
                                            e.currentTarget.src =
                                                "https://placehold.co/800x400/lightgray/gray?text=Image+Not+Found";
                                        }}
                                    />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </Carousel>
                </MagicCard>
            </NeonGradientCard>
        </div>
    );
}
