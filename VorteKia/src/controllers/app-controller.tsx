import { UserLoggedIn } from "@/types";

export function getRedirectOnLogin(parsedUser: UserLoggedIn | null): string {
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
