import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/!!ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export default function OfficialAccountPage() {
    return (
        <div className="flex flex-col justify-center items-center h-[calc(100vh-3.5rem)] w-screen text-center">
            <h1 className="text-xl font-bold">
                Well unfortunately you can't do anything but open the chatbox
                here... That's your only purpose.
                <br />
                <i>Here's some VorteKia propaganda instead!</i>
            </h1>
            <Carousel
                className="w-[80vw] mt-4"
                plugins={[Autoplay({ delay: 3000 })]}
                opts={{ align: "start", loop: true }}>
                <CarouselContent>
                    <CarouselItem key={"/images/staff1.webp"}>
                        <img
                            className="w-full bg-cover bg-no-repeat rounded-lg object-cover"
                            src={"/images/staff1.webp"}
                            onError={(e) => {
                                e.currentTarget.src =
                                    "https://placehold.co/800x400/lightgray/gray?text=Image+Not+Found";
                            }}
                        />
                    </CarouselItem>
                    <CarouselItem key={"/images/staff2.webp"}>
                        <img
                            className="w-full bg-cover bg-no-repeat rounded-lg object-cover"
                            src={"/images/staff2.webp"}
                            onError={(e) => {
                                e.currentTarget.src =
                                    "https://placehold.co/800x400/lightgray/gray?text=Image+Not+Found";
                            }}
                        />
                    </CarouselItem>
                    <CarouselItem key={"/images/staff3.webp"}>
                        <img
                            className="w-full bg-cover bg-no-repeat rounded-lg object-cover"
                            src={"/images/staff3.webp"}
                            onError={(e) => {
                                e.currentTarget.src =
                                    "https://placehold.co/800x400/lightgray/gray?text=Image+Not+Found";
                            }}
                        />
                    </CarouselItem>
                </CarouselContent>
            </Carousel>
        </div>
    );
}
