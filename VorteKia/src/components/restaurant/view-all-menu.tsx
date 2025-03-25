import MenuCard, { ManageMenuCard } from "@/components/restaurant/menu-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getAllMenuByRestaurant } from "@/controllers/restaurant-controller";
import { getUserRole } from "@/controllers/user-controller";
import { Menu, Restaurant } from "@/types";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { Search } from "lucide-react";

export default function ViewAllMenu(restaurant: { restaurant: Restaurant }) {
    const [menus, setMenus] = useState<Menu[]>([]);
    const [filteredMenus, setFilteredMenus] = useState<Menu[]>([]);
    const [search, setSearch] = useState("");

    async function fetchMenus() {
        const response = await getAllMenuByRestaurant(restaurant.restaurant.id);
        if (response === null) {
            return;
        }

        if (response.success && response?.data) {
            setMenus(response.data);
            setFilteredMenus(response.data);
        } else {
            toast.error("Failed to fetch menus!", {
                description: response.message,
            });
        }
    }

    async function searchMenu() {
        const filtered = menus.filter((menu) =>
            menu.name.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredMenus(filtered);
    }

    useEffect(() => {
        fetchMenus();
    }, []);

    useEffect(() => {
        searchMenu();
    }, [search]);

    if (getUserRole() === "supervisor") {
        return (
            <>
                <ScrollArea className="w-full max-h-96 p-2 pr-4 relative">
                    <div className="grid grid-cols-2 gap-4">
                        {menus.map((menu) => (
                            <ManageMenuCard key={menu.menu_id} menu={menu} />
                        ))}
                    </div>
                </ScrollArea>
            </>
        );
    } else
        return (
            <>
                <div className="place-self-center w-11/12 justify-between items-center flex gap-3">
                    <Search className="w-6 h-6" />
                    <Input
                        placeholder="Search Menu"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <ScrollArea className="w-full max-h-96 p-2 pr-4 relative">
                    <div className="grid grid-cols-2 gap-4">
                        {filteredMenus.map((menu) => (
                            <MenuCard key={menu.menu_id} menu={menu} />
                        ))}
                    </div>
                </ScrollArea>
            </>
        );
}
