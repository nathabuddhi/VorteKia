import { getUserRole, getUserSession } from "@/controllers/user-controller";
import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/!!ui/dialog";
import { Button } from "@/components/!!ui/button";
import { ScrollArea } from "@/components/!!ui/scroll-area";
import { Label } from "@radix-ui/react-label";
import { Separator } from "@/components/!!ui/separator";
import { Proposal } from "@/types";
import { toast } from "sonner";
import { getProposals } from "@/controllers/proposal-controller";

export default function ViewProposals() {
    const [proposals, setProposals] = useState<Proposal[] | null>(null);

    async function fetchProposals() {
        const user = getUserSession();
        if (!user) {
            setProposals([]);
            return;
        }
        const response = await getProposals(getUserRole());

        if (response.success) {
            setProposals(response.data);
        } else {
            toast.error("Failed fetching proposals!", {
                description: "An error occurred: " + response.message,
            });
        }
    }

    useEffect(() => {
        fetchProposals();
    }, [proposals]);

    return (
        <>
            <Dialog>
                <DialogTrigger>
                    <Button variant={"ghost"}>View Proposals</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Your Proposals</DialogTitle>
                    </DialogHeader>
                    <ScrollArea>
                        {proposals?.map((proposal) => {
                            return (
                                <>
                                    <div className="flex gap-y-2 flex-col">
                                        <Label className=" font-bold">
                                            <i>{proposal.subject}</i>
                                        </Label>
                                    </div>

                                    <Separator />
                                </>
                            );
                        })}
                        {proposals?.length === 0 && (
                            <p className="text-center self-center">
                                No proposals yet.
                            </p>
                        )}
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </>
    );
}
