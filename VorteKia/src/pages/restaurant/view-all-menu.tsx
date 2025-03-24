import MenuCard from "@/components/restaurant/menu-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getAllMenuByRestaurant } from "@/controllers/restaurant-controller";
import { Menu, Restaurant } from "@/types";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ViewAllMenu(restaurant: { restaurant: Restaurant }) {
    const [menus, setMenus] = useState<Menu[]>([]);

    async function fetchMenus() {
        const response = await getAllMenuByRestaurant(restaurant.restaurant.id);
        if (response === null) {
            return;
        }

        if (response.success && response?.data) {
            setMenus(response.data);
        } else {
            toast.error("Failed to fetch menus!", {
                description: response.message,
            });
        }
    }

    useEffect(() => {
        fetchMenus();
    }, [menus]);

    return (
        <ScrollArea className="w-full max-h-96 p-2 pr-4 relative">
            <div className="grid grid-cols-2 gap-4">
                {menus.map((menu) => (
                    <MenuCard key={menu.menu_id} menu={menu} />
                ))}
            </div>
        </ScrollArea>
    );
}
