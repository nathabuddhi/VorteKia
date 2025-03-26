import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Autoplay from "embla-carousel-autoplay";
import { useEffect, useState } from "react";
import { Store } from "@/types";
import { getStoreById } from "@/controllers/store-controller";
import { useNavigate } from "react-router";
import { toast, Toaster } from "sonner";
import { getUserRole } from "@/controllers/user-controller";
import { NeonGradientCard } from "@/components/!magicui/neon-gradient-card";
import { MagicCard } from "@/components/!magicui/magic-card";
import ViewAllSouvenir from "@/components/store/view-all-souvenir";
import ViewTransactionHistory from "@/components/store/view-transaction-history";

export default function StoreDetailPage() {
    const [store, setStore] = useState<Store | null>(null);
    const [isLoggedIn, setLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const url = new URL(window.location.href);
        const pathParts = url.pathname.split("/");
        const storeId = pathParts[pathParts.length - 1];

        const fetchStoreDetails = async () => {
            const response = await getStoreById(storeId);
            if (response.data === null) {
                toast.error("Store Not Found!", {
                    description:
                        "This store does not exist. Redirecting in half a second.",
                });
                console.log(response);
                setTimeout(() => {
                    navigate("/store");
                }, 500);
            }
            setLoggedIn(getUserRole() !== "");
            setStore(response.data);
        };

        fetchStoreDetails();
    }, [store]);

    return (
        <div className="flex items-center justify-center text-center h-[calc(100vh-3.5rem)] w-screen">
            <NeonGradientCard className="w-[calc(100vh-10rem)] h-[calc(100vh-13rem)] ">
                <Tabs defaultValue="information">
                    <TabsList className={"grid w-full grid-cols-3"}>
                        <TabsTrigger value="information">
                            Information
                        </TabsTrigger>
                        <TabsTrigger value="souvenir">Souvenir</TabsTrigger>
                        <TabsTrigger value="history" disabled={!isLoggedIn}>
                            Transaction History
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="information">
                        <Toaster position="bottom-right" richColors />
                        <MagicCard
                            className="max-w-3xl bg-white p-6 rounded-lg shadow-md"
                            gradientColor={"#D9D9D955"}>
                            <h1 className="text-2xl font-bold">
                                {store?.name}
                            </h1>
                            <p className="text-gray-600">
                                {store?.description}
                            </p>

                            <div className="mt-4 flex flex-col gap-y-2">
                                <Label>
                                    Operational Status: {store?.status}
                                </Label>
                            </div>

                            <Carousel
                                className="w-full mt-4"
                                plugins={[Autoplay({ delay: 3000 })]}
                                opts={{ align: "start", loop: true }}>
                                <CarouselContent>
                                    {store?.pictures.map((link) => (
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
                    </TabsContent>
                    <TabsContent value="souvenir">
                        {store && <ViewAllSouvenir store={store} />}
                    </TabsContent>
                    <TabsContent value="history">
                        {store && (
                            <ViewTransactionHistory store={store} />
                        )}
                    </TabsContent>
                </Tabs>
            </NeonGradientCard>
        </div>
    );
}
