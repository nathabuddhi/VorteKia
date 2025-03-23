import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import {
    deleteNotification,
    getNotificationByUser,
} from "@/controllers/notification-controller";
import { Notification } from "@/types";
import { ScrollArea } from "../ui/scroll-area";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";

export default function NotificationList() {
    const [notifications, setNotifications] = useState<Notification[]>();

    async function fetchNotifications() {
        const response = await getNotificationByUser();

        setNotifications(response.data ? response.data : []);
    }

    useEffect(() => {
        fetchNotifications();
    });

    return (
        <>
            <Dialog>
                <DialogTrigger>
                    <Button size={"icon"} variant={"ghost"} asChild>
                        <Bell className="h-10 w-10 p-2 mr-5" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <Label className="text-xl font-bold">Notifications</Label>
                    <ScrollArea className="max-h-96">
                        {notifications?.map((n) => {
                            return (
                                <>
                                    <div className="flex gap-y-2 flex-col">
                                        <Label className=" font-bold">
                                            <i>
                                                Notification ID:{" "}
                                                {n.notification_id}
                                            </i>
                                        </Label>
                                        <Label>{n.content}</Label>
                                        <Label className="text-xs text-gray-400">
                                            {n.time}
                                        </Label>
                                    </div>
                                    <Button
                                        size={"sm"}
                                        variant="destructive"
                                        className="my-2 w-full"
                                        onClick={() =>
                                            deleteNotification(
                                                n.notification_id
                                            )
                                        }>
                                        Delete Notification
                                    </Button>
                                    <Separator />
                                </>
                            );
                        })}
                        {notifications?.length === 0 && (
                            <div>No notifications yet.</div>
                        )}
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </>
    );
}
