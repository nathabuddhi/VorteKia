import { Ride } from "@/types";
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
import { Button } from "@/components/ui/button";
import Autoplay from "embla-carousel-autoplay";
import { useNavigate } from "react-router";
import { Label } from "@/components/ui/label";

export default function RideCard(ride: Ride) {
    const navigate = useNavigate();

    return (
        <Card>
            <MagicCard gradientColor={"#D9D9D955"}>
                <CardHeader className="pb-0">
                    <CardTitle className="text-2xl pl-1 text-center">
                        {ride.ride_name}
                    </CardTitle>
                    <CardDescription className="pl-1 text-justify w-80">
                        {ride.ride_description}
                    </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                    <Label>Currently Queued: {ride.ride_queue}</Label>
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
                            {ride.ride_pictures.map((link) => (
                                <CarouselItem key={link}>
                                    <img
                                        className="w-full h-48 object-cover"
                                        src={link}
                                        alt="ride-image"
                                    />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </Carousel>
                </CardContent>
                <CardFooter>
                    <Button
                        className="w-full"
                        onClick={() => navigate("/restaurant")}
                        variant={"default"}>
                        Enqueue
                    </Button>
                </CardFooter>
            </MagicCard>
        </Card>
    );
}
