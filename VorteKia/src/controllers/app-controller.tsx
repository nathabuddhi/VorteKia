import { ApiResponse, UserLoggedIn } from "@/types";
import { invoke } from "@tauri-apps/api/core";
import { useState, useEffect, useRef } from "react";

export function getRedirectOnLogin(parsedUser: UserLoggedIn | null): string {
    if (is_backend_routing()) {
        if (localStorage.getItem("app") === "staff/login" && !parsedUser)
            return "/staff/login";
        else if (localStorage.getItem("app") !== "staff/login")
            return localStorage.getItem("app")
                ? `/${localStorage.getItem("app")}`
                : "/main/home";
    }

    if (parsedUser != null) {
        if (
            parsedUser.role === "customer" ||
            parsedUser.division === "customer"
        )
            return "/customer/home";
        else if (parsedUser.role === "official") return "/staff/official";
        else if (parsedUser.division === "consumption") {
            if (parsedUser.role === "chef") return "/staff/restaurant/chef";
            else if (parsedUser.role === "waiter")
                return "/staff/restaurant/waiter";
            else if (parsedUser.role === "supervisor")
                return "/staff/restaurant/supervisor";
        } else if (parsedUser.division === "operational") {
            if (parsedUser.role === "staff") return "/staff/ride/staff";
            else if (parsedUser.role === "manager")
                return "/staff/ride/manager";
        } else if (parsedUser.division === "retail") {
            if (parsedUser.role === "staff") return "/staff/store/staff";
            else if (parsedUser.role === "manager")
                return "/staff/store/manager";
        } else if (parsedUser.division === "maintenance") {
            if (parsedUser.role === "staff") return "/staff/maintenance/staff";
            else if (parsedUser.role === "manager")
                return "/staff/maintenance/manager";
        } else if (parsedUser.division === "executive") {
            if (parsedUser.role === "ceo") return "/staff/ceo";
            else if (parsedUser.role === "coo") return "/staff/coo";
            else if (parsedUser.role === "cfo") return "/staff/cfo";
        } else if (parsedUser.division === "customerservice") {
            if (parsedUser.role === "manager")
                return "/staff/customerservice/manager";
            else if (parsedUser.role === "staff")
                return "/staff/customerservice/staff";
            else if (parsedUser.role === "lostandfound")
                return "/staff/customerservice/lostandfound";
        } else return "/staff/login";
    }
    return "/main/home";
}

export function logout() {
    localStorage.removeItem("user");
}

export const useAutoLogout = (shouldActivate: boolean) => {
    const logoutTime = 60;

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [countdown, setCountdown] = useState<number>(logoutTime);

    const startLogoutTimer = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(logout, logoutTime * 1000);
    };

    const startCountdownTimer = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setCountdown(logoutTime);

        intervalRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current!);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const resetTimers = () => {
        startLogoutTimer();
        startCountdownTimer();
    };

    useEffect(() => {
        if (!shouldActivate) return;

        const events = ["mousemove", "keydown", "scroll", "click"];
        events.forEach((event) => window.addEventListener(event, resetTimers));
        resetTimers();

        return () => {
            events.forEach((event) =>
                window.removeEventListener(event, resetTimers)
            );
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [shouldActivate]);

    useEffect(() => {
        if (shouldActivate) {
            console.log("AUTO LOGOUT: " + countdown);
        }
    }, [countdown, shouldActivate]);

    return null;
};

export async function get_curr_app() {
    return await invoke<ApiResponse<string>>("get_curr_app");
}

export function is_backend_routing() {
    return localStorage.getItem("app") !== null;
}
