import { Button } from "@/components/ui/button";
import { ApiResponse, UserLoggedIn } from "@/types";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { MagicCard } from "@/components/magicui/magic-card";
import { Link, useNavigate } from "react-router";

export default function LoginPage() {
    const [user, setUser] = useState<UserLoggedIn | null>(null);
    const navigate = useNavigate();

    const redirectLogin = (parsedUser: UserLoggedIn | null) => {
        if (parsedUser != null) {
            setUser(parsedUser);
            if (
                parsedUser.role === "customer" ||
                parsedUser.division === "customer"
            )
                navigate("/home");
            else if (parsedUser.division === "consumption") {
                if (parsedUser.role === "chef") navigate("/restaurant/chef");
                else if (parsedUser.role === "waiter")
                    navigate("/restaurant/waiter");
                else if (parsedUser.role === "supervisor")
                    navigate("/restaurant/supervisor");
            } else if (parsedUser.division === "operational") {
                if (parsedUser.role === "staff") navigate("/ride/staff");
                else if (parsedUser.role === "manager")
                    navigate("/ride/manager");
            } else if (parsedUser.division === "retail") {
                if (parsedUser.role === "staff") navigate("/store/staff");
                else if (parsedUser.role === "manager")
                    navigate("/store/manager");
            } else if (parsedUser.division === "maintenance") {
                if (parsedUser.role === "staff") navigate("/maintenance/staff");
                else if (parsedUser.role === "manager")
                    navigate("/maintenance/manager");
            } else if (parsedUser.division === "executive") {
                if (parsedUser.role === "ceo") navigate("/executive/ceo");
                else if (parsedUser.role === "coo") navigate("/executive/coo");
                else if (parsedUser.role === "cfo") navigate("/executive/cfo");
            } else if (parsedUser.division === "customerservice") {
                if (parsedUser.role === "manager")
                    navigate("/customerservice/manager");
                else if (parsedUser.role === "staff")
                    navigate("/customerservice/staff");
                else if (parsedUser.role === "lostandfound")
                    navigate("/customerservice/lostandfound");
            }
        } else {
            navigate("/login");
        }
    };

    useEffect(() => {
        const userStorage = localStorage.getItem("user");
        const parsedUser: UserLoggedIn | null = userStorage
            ? JSON.parse(userStorage)
            : null;

        if (parsedUser != null) {
            setUser(parsedUser);
            redirectLogin(parsedUser);
        }
    }, []);

    const LoginFormSchema = z.object({
        email: z
            .string()
            .min(1, {
                message: "Required",
            })
            .email({
                message: "Email must be a valid email address.",
            }),
        password: z.string().min(1, {
            message: "Required",
        }),
    });

    const form = useForm<z.infer<typeof LoginFormSchema>>({
        resolver: zodResolver(LoginFormSchema),
    });

    async function login(data: z.infer<typeof LoginFormSchema>) {
        const email = data.email;
        const password = data.password;

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
                } else {
                    setUser(response.data);
                    await localStorage.setItem(
                        "user",
                        JSON.stringify(response.data)
                    );

                    redirectLogin(response?.data);
                }

                return response;
            };

            toast.promise(loginPromise(), {
                loading: "Logging in...",
                success: (data) => {
                    setUser(data.data);
                    localStorage.setItem("user", JSON.stringify(data.data));
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
            <div
                className="pt-14 h-screen w-screen flex flex-col justify-center items-center bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/images/login.png')" }}>
                <Toaster position="bottom-right" richColors={true} />
                <Card className="w-96 opacity-95">
                    <MagicCard gradientColor={"#D9D9D955"}>
                        <CardHeader className="flex flex-col items-center">
                            <CardTitle className="text-2xl">Login</CardTitle>
                            <CardDescription>
                                Get Ready to Start Your Journey with VorteKia!
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit(login)}
                                    className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="email"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="password"
                                                        type="password"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        variant="default">
                                        Login
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                        <CardFooter className="flex justify-center">
                            <Button variant={"link"}>
                                <Link to="/register">
                                    Don't have an account? Apply here!
                                </Link>
                            </Button>
                        </CardFooter>
                    </MagicCard>
                </Card>
            </div>
        </>
    );
}
