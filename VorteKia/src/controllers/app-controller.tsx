import { UserLoggedIn } from "@/types";

export function getRedirectOnLogin(parsedUser: UserLoggedIn | null): string {
    if (parsedUser != null) {
        if (
            parsedUser.role === "customer" ||
            parsedUser.division === "customer"
        )
            return "/home";
        else if (parsedUser.division === "consumption") {
            if (parsedUser.role === "chef") return "/restaurant/chef";
            else if (parsedUser.role === "waiter") return "/restaurant/waiter";
            else if (parsedUser.role === "supervisor")
                return "/restaurant/supervisor";
        } else if (parsedUser.division === "operational") {
            if (parsedUser.role === "staff") return "/ride/staff";
            else if (parsedUser.role === "manager") return "/ride/manager";
        } else if (parsedUser.division === "retail") {
            if (parsedUser.role === "staff") return "/store/staff";
            else if (parsedUser.role === "manager") return "/store/manager";
        } else if (parsedUser.division === "maintenance") {
            if (parsedUser.role === "staff") return "/maintenance/staff";
            else if (parsedUser.role === "manager")
                return "/maintenance/manager";
        } else if (parsedUser.division === "executive") {
            if (parsedUser.role === "ceo") return "/ceo";
            else if (parsedUser.role === "coo") return "/coo";
            else if (parsedUser.role === "cfo") return "/cfo";
        } else if (parsedUser.division === "customerservice") {
            if (parsedUser.role === "manager")
                return "/customerservice/manager";
            else if (parsedUser.role === "staff")
                return "/customerservice/staff";
            else if (parsedUser.role === "lostandfound")
                return "/customerservice/lostandfound";
        } else return "/home";
    }
    return "/login";
}

export function logout() {
    localStorage.removeItem("user");
}
