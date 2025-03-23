import { LostItem } from "@/types";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { MagicCard } from "@/components/!magicui/magic-card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Label } from "@/components/ui/label";
import EditItemDialog from "./edit-item";

export default function ItemCard({ item }: { item: LostItem }) {
    return (
        <Card className="max-w-[29rem]">
            <MagicCard gradientColor={"#D9D9D955"}>
                <CardHeader className="pb-0">
                    <CardTitle className="text-2xl pl-1 text-center">
                        {item.name}
                    </CardTitle>
                    <CardDescription className="pl-1 text-justify line-clamp-3">
                        {item.description}
                    </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                    <Label
                        className={
                            item.status === "Returned to Owner"
                                ? "text-green-500"
                                : item.status === "Found"
                                ? "text-yellow-500"
                                : "text-red-500"
                        }>
                        Item Status: {item.status}
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
                            <CarouselItem>
                                <img
                                    className="w-full h-56 bg-cover bg-no-repeat rounded-lg object-cover"
                                    src={item.image}
                                    onError={(e) => {
                                        e.currentTarget.src =
                                            "https://placehold.co/800x400/lightgray/gray?text=Image+Not+Found";
                                    }}
                                />
                            </CarouselItem>
                        </CarouselContent>
                    </Carousel>
                </CardContent>
                <CardFooter>
                    <EditItemDialog item={item} />
                </CardFooter>
            </MagicCard>
        </Card>
    );
}
