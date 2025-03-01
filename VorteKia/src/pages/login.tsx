import { Button } from "@/components/ui/button";
import { ApiResponse, UserLoggedIn } from "@/types";
import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";
import { Toaster, toast } from "sonner";

export default function LoginPage() {
    const [user, setUser] = useState<UserLoggedIn | null>(null);

    async function login(email: string, password: string) {
        try {
            const loginPromise = async () => {
                const response = await invoke<ApiResponse<UserLoggedIn>>(
                    "login",
                    {
                        payload: {
                            email: email,
                            password: password,
                        },
                    }
                );

                if (!response.success) {
                    throw new Error(response.message?.toString());
                }

                return response;
            };

            toast.promise(loginPromise(), {
                loading: "Logging in...",
                success: (data) => {
                    setUser(data.data);
                    console.log(data.data);
                    return "Successfully logged in!";
                },
                error: (error) =>
                    `Failed logging in: ${error.message || error}`,
            });
        } catch (error) {
            toast.error("Failed logging In!", {
                description: "An error occured: " + error,
                action: {
                    label: "Close",
                    onClick: () => {},
                },
            });
        }
    }

    return (
        <>
            <h1 className="text-9xl">test</h1>
            <Button onClick={() => login("nathabuddhi@gmail.com", "test")}>
                Test Login
            </Button>
            <Toaster position="bottom-right" richColors={true} />
        </>
    );
}
