import { Souvenir } from "@/types";
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
import { createTransactionPromise } from "@/controllers/store-controller";
import { getUserRole, getUserSession } from "@/controllers/user-controller";
import { ShineBorder } from "@/components/!magicui/shine-border";
import { useNavigate } from "react-router";

export default function SouvenirCard({
    souvenir,
    status,
}: {
    souvenir: Souvenir;
    status: string;
}) {
    async function buySouvenir() {
        const user = getUserSession();
        if (!user) {
            toast.error("You are not logged in!", {
                description: "Please login to buy a souvenir.",
            });
            return;
        }

        if (status !== "Open.") {
            toast.error("Store is not open!", {
                description: "Please wait for the store to open.",
            });
            return;
        }

        const response = createTransactionPromise(souvenir.souvenir_id);
        toast.promise(response, {
            loading: "Buying souvenir...",
            success:
                "Souvenir bought! Your balance has been deducted accordingly.",
            error: "Failed to Order Souvenir: " + (await response).message,
        });
    }

    return (
        <Card className="max-w-[20rem] h-full flex flex-col justify-between">
            <Toaster richColors />
            <MagicCard
                gradientColor={"#D9D9D955"}
                className="h-full flex flex-col justify-between">
                <CardHeader className="pb-0 text-center">
                    <CardTitle className="text-2xl">{souvenir.name}</CardTitle>
                    <CardDescription className="min-h-[48px] text-sm text-gray-600">
                        {souvenir.description}
                    </CardDescription>
                </CardHeader>

                <CardContent className="pb-2 flex flex-col gap-y-2">
                    <Label className="font-semibold">
                        Souvenir Price: ${souvenir.price}
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
                            {souvenir.pictures?.map((link) => (
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
                        onClick={() => buySouvenir()}>
                        Buy
                    </InteractiveHoverButton>
                </CardFooter>
            </MagicCard>
        </Card>
    );
}

export function ManageSouvenirCard({ souvenir }: { souvenir: Souvenir }) {
    const navigate = useNavigate();

    return (
        <Card className="max-w-[29rem] relative">
            <ShineBorder
                shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
                className="max-w-[29rem]"
            />
            <CardHeader className="pb-0">
                <CardTitle className="text-2xl pl-1 text-center">
                    {souvenir.name}
                </CardTitle>
                <CardDescription className="min-h-[48px] text-sm text-gray-600">
                    {souvenir.description}
                </CardDescription>
            </CardHeader>
            <CardContent className="pb-2 flex flex-col gap-y-2">
                <Label>Souvenir Price: ${souvenir.price}</Label>
            </CardContent>
            <CardFooter>
                <InteractiveHoverButton
                    className="w-full"
                    disabled={getUserRole() === "staff"}
                    onClick={() =>
                        navigate(
                            "/staff/store/manage-souvenir/" +
                                souvenir.souvenir_id
                        )
                    }>
                    Manage Souvenir
                </InteractiveHoverButton>
            </CardFooter>
        </Card>
    );
}
