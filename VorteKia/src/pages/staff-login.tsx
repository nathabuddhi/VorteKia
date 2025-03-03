import { Button } from "@/components/ui/button";
import { useEffect } from "react";
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
import {
    getUserSession,
    LoginFormSchema,
    loginPromise,
} from "@/controllers/user-controller";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getRedirectOnLogin } from "@/controllers/app-controller";

export default function StaffLogin() {
    const navigate = useNavigate();

    useEffect(() => {
        const parsedUser = getUserSession();

        if (parsedUser != null) {
            const redirectPath = getRedirectOnLogin(parsedUser);
            navigate(redirectPath);
        }
    }, []);

    const loginForm = useForm<z.infer<typeof LoginFormSchema>>({
        resolver: zodResolver(LoginFormSchema),
    });

    async function login(data: z.infer<typeof LoginFormSchema>) {
        try {
            toast.promise(loginPromise(data), {
                loading: "Logging in...",
                success: (response) => {
                    if (response.success) {
                        console.log("Staff Login: " + response.message);
                        localStorage.setItem(
                            "user",
                            JSON.stringify(response.data)
                        );
                        setTimeout(() => {
                            const redirectPath = getRedirectOnLogin(
                                response.data
                            );
                            navigate(redirectPath);
                        }, 1000);
                        return "Successfully logged in!";
                    } else {
                        throw new Error(
                            response.message || "Unknown error during login"
                        );
                    }
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
                className="h-[calc(100vh-3.5rem)] w-screen flex flex-col justify-center items-center bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/images/loginstaff.png')" }}>
                <Toaster position="bottom-right" richColors={true} />
                <Card className="w-96 opacity-75">
                    <MagicCard gradientColor={"#D9D9D955"}>
                        <CardHeader className="flex flex-col items-center">
                            <CardTitle className="text-2xl">
                                Staff Login
                            </CardTitle>
                            <CardDescription className="text-center">
                                Welcome back to work, <b>slave.</b>
                                <br />
                                <i className="text-xs">
                                    (if you're a customer this is a joke... duh)
                                </i>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...loginForm}>
                                <form
                                    onSubmit={loginForm.handleSubmit(login)}
                                    className="space-y-6">
                                    <FormField
                                        control={loginForm.control}
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
                                        control={loginForm.control}
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
                                <Link to="/login">
                                    Not a staff? That's awkward...
                                    <br />
                                    Click here I guess..?
                                </Link>
                            </Button>
                        </CardFooter>
                    </MagicCard>
                </Card>
            </div>
        </>
    );
}
