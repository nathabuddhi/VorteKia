import { getChats, getCSChats } from "@/controllers/chat-controller";
import {
    getUserDivision,
    getUserRole,
    getUserSession,
} from "@/controllers/user-controller";
import { ChatRoom } from "@/types";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/!!ui/dialog";
import { Button } from "../!!ui/button";
import { MessageSquare } from "lucide-react";
import { ScrollArea } from "../!!ui/scroll-area";
import { Label } from "@radix-ui/react-label";
import { Separator } from "../!!ui/separator";
import ChatComponent from "./chat-component";

export default function ChatBox() {
    const [chats, setChats] = useState<ChatRoom[] | null>(null);

    async function fetchChats() {
        const user = getUserSession();
        if (!user) {
            setChats([]);
            return;
        }
        const response = await getChats(user.user_id);

        if (response.success) {
            setChats(response.data);
            console.log(response.data);
            if (
                getUserRole() === "staff" &&
                getUserDivision() === "customerservice"
            ) {
                const response2 = await getCSChats();
                if (response2.success) {
                    setChats((prevChats) => [
                        ...(prevChats || []),
                        ...(response2.data || []),
                    ]);
                } else {
                    toast.error("Failed fetching chats!", {
                        description: "An error occurred: " + response2.message,
                    });
                }
            }
        } else {
            toast.error("Failed fetching chats!", {
                description: "An error occurred: " + response.message,
            });
        }
    }

    useEffect(() => {
        fetchChats();
    }, []);

    return (
        <>
            <Dialog>
                <DialogTrigger>
                    <Button size={"icon"} variant={"ghost"} asChild>
                        <MessageSquare className="h-10 w-10 p-2 mr-5" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Your Chats</DialogTitle>
                    </DialogHeader>
                    <ScrollArea>
                        {chats?.map((chat) => {
                            return (
                                <>
                                    <div className="flex gap-y-2 flex-col">
                                        <Label className=" font-bold">
                                            <i>{chat.name}</i>
                                        </Label>
                                    </div>
                                    <ChatComponent
                                        room_id={chat.room_id}
                                        room_name={chat.name}
                                    />
                                    <Separator />
                                </>
                            );
                        })}
                        {chats?.length === 0 && (
                            <p className="text-center self-center">
                                You have no chats yet.
                            </p>
                        )}
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </>
    );
}
