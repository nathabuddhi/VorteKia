import { ApiResponse, Menu, Order, Restaurant } from "@/types";
import { invoke } from "@tauri-apps/api/core";
import { z } from "zod";
import { getUserSession } from "./user-controller";

export const getRestaurantById = async (restaurant_id: string) => {
    try {
        return await invoke<ApiResponse<Restaurant>>("get_restaurant_by_id", {
            payload: {
                id: restaurant_id,
            },
        });
    } catch (error) {
        return { success: false, data: null, message: error };
    }
};

export const getAllRestaurants = async () => {
    try {
        return await invoke<ApiResponse<Restaurant[]>>("get_all_restaurants");
    } catch (error) {
        return { success: false, data: null, message: error };
    }
};

export const UpdateRestaurantSchema = z.object({
    id: z.string().length(36, {
        message: "Invalid restaurant ID",
    }),
    name: z.string().min(3, {
        message: "At least 3 characters.",
    }),
    description: z.string().min(10, {
        message: "At least 10 characters.",
    }),
    cuisine: z.string().min(3, {
        message: "At least 3 characters.",
    }),
    // pictures: z.array(z.string()).min(1, {
    //     message: "At least 1 picture.",
    // }),
    opening: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/, {
        message: "Time format must be HH:MM:SS",
    }),
    closing: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/, {
        message: "Time format must be HH:MM:SS",
    }),
});

export const CreateRestaurantSchema = z.object({
    name: z.string().min(3, {
        message: "At least 3 characters.",
    }),
    description: z.string().min(10, {
        message: "At least 10 characters.",
    }),
    cuisine: z.string().min(3, {
        message: "At least 3 characters.",
    }),
    // pictures: z.array(z.string()).min(1, {
    //     message: "At least 1 picture.",
    // }),
    opening: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/, {
        message: "Time format must be HH:MM:SS",
    }),
    closing: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/, {
        message: "Time format must be HH:MM:SS",
    }),
});

export async function createRestaurantPromise(
    data: z.infer<typeof CreateRestaurantSchema>
) {
    try {
        return await invoke<ApiResponse<String>>("create_restaurant", {
            payload: {
                name: data.name,
                description: data.description,
                opening: data.opening,
                closing: data.closing,
                pictures: [""],
                cuisine: data.cuisine,
            },
        });
    } catch (error) {
        return { success: false, data: null, message: String(error) };
    }
}

export async function orderMenuPromise(menu_id: string) {
    return await invoke<ApiResponse<String>>("order_menu", {
        payload: {
            user_id: getUserSession()?.user_id,
            menu_id: menu_id,
            quantity: 1,
        },
    });
}

export async function getAllMenuByRestaurant(restaurant_id: string) {
    return await invoke<ApiResponse<Menu[]>>("get_restaurant_menu", {
        payload: {
            id: restaurant_id,
        },
    });
}

export async function getCustomerOrders(restaurant_id: string) {
    return await invoke<ApiResponse<Order[]>>("get_orders_customer", {
        payload: {
            user_id: getUserSession()?.user_id,
            restaurant_id: restaurant_id,
        },
    });
}

export async function getAssignedRestaurant() {
    return await invoke<ApiResponse<Restaurant>>("get_assigned_restaurant", {
        payload: {
            id: getUserSession()?.user_id,
        },
    });
}

export async function getChefOrders(restaurant_id: string) {
    return await invoke<ApiResponse<Order[]>>("get_orders_chef", {
        payload: {
            id: restaurant_id,
        },
    });
}

export async function getWaiterOrders(restaurant_id: string) {
    return await invoke<ApiResponse<Order[]>>("get_orders_waiter", {
        payload: {
            id: restaurant_id,
        },
    });
}

export async function processOrder(order_id: string) {
    return await invoke<ApiResponse<String>>("take_order", {
        payload: {
            id: order_id,
        },
    });
}

export async function cookOrder(order_id: string) {
    return await invoke<ApiResponse<String>>("cook_order", {
        payload: {
            id: order_id,
        },
    });
}

export async function deliverOrder(order_id: string) {
    return await invoke<ApiResponse<String>>("deliver_order", {
        payload: {
            id: order_id,
        },
    });
}
