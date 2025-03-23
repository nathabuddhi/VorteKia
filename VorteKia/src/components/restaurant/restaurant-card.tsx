import { Restaurant } from "@/types";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { MagicCard } from "@/components/!magicui/magic-card";
import { ShineBorder } from "@/components/!magicui/shine-border";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import { InteractiveHoverButton } from "@/components/!magicui/interactive-hover-button";
import Autoplay from "embla-carousel-autoplay";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function RestaurantCard({
    restaurant,
}: {
    restaurant: Restaurant;
}) {
    return (
        <Card className="max-w-[29rem]">
            <MagicCard gradientColor={"#D9D9D955"}>
                <CardHeader className="pb-0">
                    <CardTitle className="text-2xl pl-1 text-center">
                        {restaurant.name}
                    </CardTitle>
                    <CardDescription className="pl-1 text-justify line-clamp-3">
                        {restaurant.description}
                    </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                    <Label className="font-semibold">
                        Restaurant Cuisine: {restaurant.cuisine}
                    </Label>
                    <br />
                    <Label
                        className={
                            restaurant.status !== "Operational."
                                ? "text-red-500"
                                : ""
                        }>
                        Current Status: {restaurant.status}
                    </Label>
                    <Carousel
                        className="w-full"
                        plugins={[
                            Autoplay({
                                delay: 3000,
                            }),
                        ]}
                        opts={{
                            align: "start",
                            loop: true,
                        }}>
                        <CarouselContent className="">
                            {restaurant.pictures?.map((link) => (
                                <CarouselItem key={link}>
                                    <img
                                        className="w-full h-56 bg-cover bg-no-repeat rounded-lg object-cover"
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
                </CardContent>
                <CardFooter>
                    <InteractiveHoverButton
                        className="w-full"
                        onClick={() =>
                            toast.info(
                                "Head to each restaurant to view full details, menu, order, etc!"
                            )
                        }>
                        View Restaurant
                    </InteractiveHoverButton>
                </CardFooter>
            </MagicCard>
        </Card>
    );
}

export function ManageRestaurantCard({
    restaurant,
}: {
    restaurant: Restaurant;
}) {
    const navigate = useNavigate();

    return (
        <Card className="max-w-[29rem] relative">
            <ShineBorder
                shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
                className="max-w-[29rem]"
            />
            <CardHeader className="pb-0">
                <CardTitle className="text-2xl pl-1 text-center">
                    {restaurant.name}
                </CardTitle>
                <CardDescription className="pl-1 text-justify line-clamp-3">
                    {restaurant.description}
                </CardDescription>
            </CardHeader>
            <CardContent className="pb-2 flex flex-col gap-y-2">
                <Label
                    className={`${
                        restaurant.status !== "Operational."
                            ? "text-red-500"
                            : "text-green-500"
                    }`}>
                    Restaurant Status: {restaurant.status}
                </Label>
                <Label>Restaurant Income: {restaurant.income}</Label>
            </CardContent>
            <CardFooter>
                <InteractiveHoverButton
                    className="w-full"
                    onClick={() =>
                        navigate(
                            "/staff/restaurant/manage-restaurant/" +
                                restaurant.id
                        )
                    }>
                    Manage Restaurant
                </InteractiveHoverButton>
            </CardFooter>
        </Card>
    );
}
