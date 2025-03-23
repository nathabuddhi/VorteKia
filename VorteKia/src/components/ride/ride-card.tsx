import { Ride } from "@/types";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/!!ui/card";
import { MagicCard } from "@/components/!magicui/magic-card";
import { ShineBorder } from "@/components/!magicui/shine-border";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/!!ui/carousel";
import { InteractiveHoverButton } from "@/components/!magicui/interactive-hover-button";
import Autoplay from "embla-carousel-autoplay";
import { Label } from "@/components/!!ui/label";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function RideCard({ ride }: { ride: Ride }) {
    return (
        <Card className="max-w-[29rem]">
            <MagicCard gradientColor={"#D9D9D955"}>
                <CardHeader className="pb-0">
                    <CardTitle className="text-2xl pl-1 text-center">
                        {ride.ride_name}
                    </CardTitle>
                    <CardDescription className="pl-1 text-justify line-clamp-3">
                        {ride.ride_description}
                    </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                    <Label
                        className={
                            ride.ride_status !== "Operational."
                                ? "text-red-500"
                                : ""
                        }>
                        Current Status:{" "}
                        {ride.ride_status === "Operational." ? (
                            "Operational, " + ride.queue_count + " in queue."
                        ) : (
                            <i>Non Operational.</i>
                        )}
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
                            {ride.ride_pictures.map((link) => (
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
                                "Head to each ride to view full details!"
                            )
                        }>
                        View Ride
                    </InteractiveHoverButton>
                </CardFooter>
            </MagicCard>
        </Card>
    );
}

export function ManageRideCard({ ride }: { ride: Ride }) {
    const navigate = useNavigate();

    return (
        <Card className="max-w-[29rem] relative">
            <ShineBorder
                shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
                className="max-w-[29rem]"
            />
            <CardHeader className="pb-0">
                <CardTitle className="text-2xl pl-1 text-center">
                    {ride.ride_name}
                </CardTitle>
                <CardDescription className="pl-1 text-justify line-clamp-3">
                    {ride.ride_description}
                </CardDescription>
            </CardHeader>
            <CardContent className="pb-2 flex flex-col gap-y-2">
                <Label
                    className={`${
                        ride.ride_status !== "Operational."
                            ? "text-red-500"
                            : "text-green-500"
                    }`}>
                    Ride Status: {ride.ride_status}
                </Label>
                <Label>Ride Income: {ride.income}</Label>
            </CardContent>
            <CardFooter>
                <InteractiveHoverButton
                    className="w-full"
                    onClick={() =>
                        navigate("/staff/ride/manage-ride/" + ride.ride_id)
                    }>
                    Manage Ride
                </InteractiveHoverButton>
            </CardFooter>
        </Card>
    );
}
