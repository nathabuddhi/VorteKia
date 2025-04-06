import { Button } from "../ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getMessages, sendMessage } from "@/controllers/chat-controller";
import { Message } from "@/types";
import { useEffect, useState } from "react";
import { SendHorizonal } from "lucide-react";
import { Textarea } from "../ui/textarea";

export default function ChatComponent({
    room_id,
    room_name,
}: {
    room_id: string;
    room_name: string;
}) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageContent, setMessageContent] = useState<string>("");

    async function fetchMessages() {
        const response = await getMessages(room_id);

        if (response.success) {
            setMessages(response.data ? response.data : []);
        }
    }

    async function handleSendMessage() {
        if (!messageContent.trim()) return;

        const response = await sendMessage(messageContent, room_id);

        if (response.success) {
            setMessageContent("");
            fetchMessages();
        } else {
            console.error("Failed to send message");
        }
    }

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [room_id]);

    return (
        <>
            <Dialog>
                <DialogTrigger>
                    <Button
                        size={"sm"}
                        variant="default"
                        className="my-2 w-full">
                        Open Chat
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{room_name}</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="max-h-96">
                        {messages.length === 0 ? (
                            <p className="italic text-center self-center">
                                No messages yet.
                            </p>
                        ) : (
                            messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className="flex flex-col p-2 border-b w-full">
                                    <strong>{msg.sender_name}:</strong>
                                    {msg.content}
                                    <p className="text-xs text-gray-400 text-end">
                                        {msg.timestamp}
                                    </p>
                                </div>
                            ))
                        )}
                    </ScrollArea>
                    <div className="flex items-center justify-between">
                        <Textarea
                            placeholder="Type Here"
                            className="w-[90%]"
                            value={messageContent}
                            onChange={(e) => setMessageContent(e.target.value)}
                        />
                        <Button
                            variant={"ghost"}
                            size={"icon"}
                            onClick={handleSendMessage}>
                            <SendHorizonal className="h-14 w-14 mx-0.5" />
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
