import { Button } from "@/components/!!ui/button";
import { useEffect } from "react";
import { Toaster, toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/!!ui/card";
import { Input } from "@/components/!!ui/input";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/!!ui/form";
import { MagicCard } from "@/components/!magicui/magic-card";
import { Link, useNavigate } from "react-router";
import {
    getUserSession,
    loginUIDPromise,
    UIDLoginFormSchema,
} from "@/controllers/user-controller";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getRedirectOnLogin } from "@/controllers/app-controller";
import { ShimmerButton } from "@/components/!magicui/shimmer-button";

export default function CustomerLogin() {
    const navigate = useNavigate();

    useEffect(() => {
        const parsedUser = getUserSession();

        if (parsedUser != null) {
            const redirectPath = getRedirectOnLogin(parsedUser);
            navigate(redirectPath);
        }
    }, []);

    const UIDLoginForm = useForm<z.infer<typeof UIDLoginFormSchema>>({
        resolver: zodResolver(UIDLoginFormSchema),
    });

    async function loginUID(data: z.infer<typeof UIDLoginFormSchema>) {
        try {
            toast.promise(loginUIDPromise(data), {
                loading: "Logging in...",
                success: (response) => {
                    if (response.success) {
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
                style={{ backgroundImage: "url('/images/login.png')" }}>
                <Toaster position="bottom-right" richColors={true} />
                <Card className="w-96 opacity-95">
                    <MagicCard gradientColor={"#D9D9D955"}>
                        <CardHeader className="flex flex-col items-center">
                            <CardTitle className="text-2xl">Login</CardTitle>
                            <CardDescription className="text-center">
                                Get ready to start your journey with VorteKia!{" "}
                                <br />
                                You can find your UID at the top.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...UIDLoginForm}>
                                <form
                                    onSubmit={UIDLoginForm.handleSubmit(
                                        loginUID
                                    )}
                                    className="space-y-6">
                                    <FormField
                                        control={UIDLoginForm.control}
                                        name="uid"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Your Unique UID
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <ShimmerButton
                                        type="submit"
                                        className="w-full">
                                        Login
                                    </ShimmerButton>
                                </form>
                            </Form>
                        </CardContent>
                        <CardFooter className="flex justify-center flex-col">
                            <Button variant={"link"} className="italic mb-8">
                                Don't have an account? <br />
                                Head to the Customer Service <br />
                                Counter to create one now!
                            </Button>
                            <Button variant={"link"} size={"sm"}>
                                <Link
                                    to="/staff/login"
                                    className="text-xs italic">
                                    Or Login as a Staff instead? 😈
                                </Link>
                            </Button>
                        </CardFooter>
                    </MagicCard>
                </Card>
            </div>
        </>
    );
}
