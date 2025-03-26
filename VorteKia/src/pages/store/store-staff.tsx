import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Autoplay from "embla-carousel-autoplay";
import { useEffect, useState } from "react";
import { ApiResponse, Income, Store } from "@/types";
import { getAssignedStore } from "@/controllers/store-controller";
import { Toaster } from "sonner";
import { NeonGradientCard } from "@/components/!magicui/neon-gradient-card";
import { MagicCard } from "@/components/!magicui/magic-card";
import ViewAllSouvenir from "@/components/store/view-all-souvenir";
import { ViewAllTransactions } from "@/components/store/view-transaction-history";
import { invoke } from "@tauri-apps/api/core";

export default function StoreStaffPage() {
    const [store, setStore] = useState<Store | null>(null);
    const [dailyIncome, setDailyIncome] = useState(0);

    async function fetchDailyIncome() {
        const response = await invoke<ApiResponse<Income>>(
            "get_store_income_day",
            {
                payload: {
                    id: store?.id,
                },
            }
        );

        if (response) {
            if (response?.data) {
                setDailyIncome(response.data.marketing);
            }
        }
    }

    const fetchAssignedStore = async () => {
        const response = await getAssignedStore();
        if (response.success) {
            setStore(response.data);

            fetchDailyIncome();
        }
    };

    useEffect(() => {
        fetchAssignedStore();
    }, [store]);

    return (
        <div className="flex items-center justify-center text-center h-[calc(100vh-3.5rem)] w-screen">
            <NeonGradientCard className="w-[calc(100vh-10rem)] h-[calc(100vh-17rem)] ">
                <Tabs defaultValue="information">
                    <TabsList className={"grid w-full grid-cols-3"}>
                        <TabsTrigger value="information">
                            Information
                        </TabsTrigger>
                        <TabsTrigger value="souvenir">Souvenir</TabsTrigger>
                        <TabsTrigger value="history">
                            Transaction History
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="information">
                        <Toaster position="bottom-right" richColors expand />
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
                                <Label>
                                    Daily Store Income: ${dailyIncome}
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
                                                className="w-full h-80 bg-cover bg-no-repeat rounded-lg object-cover"
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
                        {store && <ViewAllTransactions store={store} />}
                    </TabsContent>
                </Tabs>
            </NeonGradientCard>
        </div>
    );
}
