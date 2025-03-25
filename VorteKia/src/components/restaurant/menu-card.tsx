import { Menu } from "@/types";
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
import { InteractiveHoverButton } from "@/components/!magicui/interactive-hover-button";
import Autoplay from "embla-carousel-autoplay";
import { Label } from "@/components/ui/label";
import { toast, Toaster } from "sonner";
import { orderMenuPromise } from "@/controllers/restaurant-controller";
import { getUserSession } from "@/controllers/user-controller";
import { ShineBorder } from "@/components/!magicui/shine-border";
import { useNavigate } from "react-router";

export default function MenuCard({ menu }: { menu: Menu }) {
    async function orderMenu() {
        const user = getUserSession();
        if (!user) {
            toast.error("You are not logged in!", {
                description: "Please login to order a menu.",
            });
            return;
        }

        const response = orderMenuPromise(menu.menu_id);
        toast.promise(response, {
            loading: "Ordering Menu...",
            success:
                "Menu Ordered! Your order will be processed by a waiter soon.",
            error: "Failed to Order Menu: " + (await response).message,
        });
    }

    return (
        <Card className="max-w-[20rem] h-full flex flex-col justify-between">
            <Toaster richColors />
            <MagicCard
                gradientColor={"#D9D9D955"}
                className="h-full flex flex-col justify-between">
                <CardHeader className="pb-0 text-center">
                    <CardTitle className="text-2xl">{menu.name}</CardTitle>
                    <CardDescription className="min-h-[48px] text-sm text-gray-600">
                        {menu.description}
                    </CardDescription>
                </CardHeader>

                <CardContent className="pb-2 flex flex-col gap-y-2">
                    <Label className="font-semibold">
                        Menu Price: ${menu.price}
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
                        <CarouselContent>
                            {menu.pictures?.map((link) => (
                                <CarouselItem key={link}>
                                    <img
                                        className="w-full h-36 bg-cover bg-no-repeat rounded-lg object-cover"
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

                <CardFooter className="mt-auto">
                    <InteractiveHoverButton
                        className="w-full"
                        onClick={() => orderMenu()}>
                        Order
                    </InteractiveHoverButton>
                </CardFooter>
            </MagicCard>
        </Card>
    );
}

export function ManageMenuCard({ menu }: { menu: Menu }) {
    const navigate = useNavigate();

    return (
        <Card className="max-w-[29rem] relative">
            <ShineBorder
                shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
                className="max-w-[29rem]"
            />
            <CardHeader className="pb-0">
                <CardTitle className="text-2xl pl-1 text-center">
                    {menu.name}
                </CardTitle>
                <CardDescription className="min-h-[48px] text-sm text-gray-600">
                    {menu.description}
                </CardDescription>
            </CardHeader>
            <CardContent className="pb-2 flex flex-col gap-y-2">
                <Label>Menu Price: ${menu.price}</Label>
            </CardContent>
            <CardFooter>
                <InteractiveHoverButton
                    className="w-full"
                    onClick={() =>
                        navigate(
                            "/staff/restaurant/manage-menu/" + menu.menu_id
                        )
                    }>
                    Manage Menu
                </InteractiveHoverButton>
            </CardFooter>
        </Card>
    );
}
