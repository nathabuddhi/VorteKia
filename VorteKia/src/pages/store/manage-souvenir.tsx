import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import { Label } from "@/components/ui/label";
import Autoplay from "embla-carousel-autoplay";
import { useEffect, useState } from "react";
import { Souvenir } from "@/types";
import {
    deleteSouvenirPromise,
    getSouvenirById,
} from "@/controllers/store-controller";
import { useNavigate } from "react-router";
import { toast, Toaster } from "sonner";
import { NeonGradientCard } from "@/components/!magicui/neon-gradient-card";
import { MagicCard } from "@/components/!magicui/magic-card";
import { Button } from "@/components/ui/button";
import EditSouvenir from "@/components/store/edit-souvenir";
("@/components/store/edit-souvenir");
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ManageSouvenirPage() {
    const [souvenir, setSouvenir] = useState<Souvenir | null>(null);
    const navigate = useNavigate();

    async function deleteSouvenir() {
        if (!souvenir?.souvenir_id) {
            toast.error("Souvenir ID is missing.");
            return;
        }
        const response = deleteSouvenirPromise(souvenir.souvenir_id);
        toast.promise(response, {
            loading: "Deleting souvenir...",
            success: "Souvenir deleted successfully!",
            error: "Failed to delete souvenir: " + (await response).message,
        });
    }

    useEffect(() => {
        const url = new URL(window.location.href);
        const pathParts = url.pathname.split("/");
        const souvenirId = pathParts[pathParts.length - 1];

        const fetchSouvenirDetails = async () => {
            const response = await getSouvenirById(souvenirId);
            if (response.data === null) {
                toast.error("Souvenir Not Found!", {
                    description:
                        "This souvenir does not exist. Redirecting in half a second.",
                });
                console.log(response);
                setTimeout(() => {
                    navigate("/staff/store/manager");
                }, 500);
            }
            setSouvenir(response.data);
        };

        fetchSouvenirDetails();
    }, [souvenir]);

    return (
        <div className="flex items-center justify-center text-center h-[calc(100vh-3.5rem)] w-screen">
            <NeonGradientCard className="w-[calc(100vh-10rem)] h-[calc(100vh-13rem)] ">
                <Toaster position="bottom-right" richColors expand />
                <MagicCard
                    className="max-w-3xl bg-white p-6 rounded-lg shadow-md h-full"
                    gradientColor={"#D9D9D955"}>
                    <h1 className="text-2xl font-bold">{souvenir?.name}</h1>
                    <p className="text-gray-600">{souvenir?.description}</p>

                    <div className="mt-4 flex flex-col gap-y-2">
                        <Label>Souvenir Price: ${souvenir?.price}</Label>
                    </div>

                    <Carousel
                        className="w-full mt-4"
                        plugins={[Autoplay({ delay: 3000 })]}
                        opts={{ align: "start", loop: true }}>
                        <CarouselContent>
                            {souvenir?.pictures.map((link) => (
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
                    <div className="mt-6 flex justify-evenly">
                        {souvenir && <EditSouvenir souvenir={souvenir} />}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="ml-8">
                                    Delete Souvenir
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Are you absolutely sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will
                                        permanently delete this souvenir,
                                        souvenir, transactions, etc.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>
                                        Cancel
                                    </AlertDialogCancel>
                                    <Button
                                        type="button"
                                        variant={"destructive"}
                                        onClick={() => deleteSouvenir()}>
                                        Delete Souvenir
                                    </Button>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </MagicCard>
            </NeonGradientCard>
        </div>
    );
}
