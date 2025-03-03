import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
import {
    requestUIDPromise,
    LoginFormSchema,
} from "@/controllers/user-controller";
import { useState } from "react";
import { ScriptCopyBtn } from "./magicui/script-copy-btn";

export default function RequestUID() {
    const [uid, setUID] = useState<string | null>(null);

    const form = useForm<z.infer<typeof LoginFormSchema>>({
        resolver: zodResolver(LoginFormSchema),
    });

    async function requestUID(data: z.infer<typeof LoginFormSchema>) {
        try {
            const response = requestUIDPromise(data);

            toast.promise(response, {
                loading: "Getting user UID...",
                success: (response) => {
                    const data = response.data;
                    setUID(data?.user_id ?? null);
                    return "Successfully retrieved user UID!";
                },
                error: (error) =>
                    `Failed retreiving user UID: ${error.message || error}`,
            });
        } catch (error) {
            toast.error("Failed creating account!", {
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
            <Dialog>
                <Toaster position="bottom-right" richColors={true} />
                <DialogTrigger asChild>
                    <Button variant="outline">Get My UID</Button>
                </DialogTrigger>
                <DialogContent className="w-[27.8rem]">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(requestUID)}
                            className="space-y-6">
                            <DialogHeader>
                                <DialogTitle>Request UID</DialogTitle>
                                <DialogDescription>
                                    Don't ask why you need to "get" your UID...
                                    <br />
                                    We didn't make that rule.
                                </DialogDescription>
                            </DialogHeader>
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
                            <DialogFooter className="flex flex-col w-full">
                                <div className="flex flex-col items-center gap-y-3 justify-center">
                                    <Button type="submit" className="w-full">
                                        Get My UID
                                    </Button>
                                    {uid && (
                                        <div className="w-full flex justify-center">
                                            <ScriptCopyBtn
                                                codeLanguage="yaml"
                                                lightTheme="laserwave"
                                                darkTheme="laserwave"
                                                commandMap={{
                                                    "": uid,
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}
