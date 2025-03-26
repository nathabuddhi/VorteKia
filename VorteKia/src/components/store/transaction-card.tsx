import { Transaction } from "@/types";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { MagicCard } from "@/components/!magicui/magic-card";
import { Label } from "@/components/ui/label";

export function TransactionCard({ transaction }: { transaction: Transaction }) {
    return (
        <Card className="max-w-[20rem] h-full flex flex-col justify-between">
            <MagicCard
                gradientColor={"#D9D9D955"}
                className="h-full flex flex-col justify-between">
                <CardHeader className="pb-0 text-center">
                    <CardTitle className="text-xs">
                        Transaction #{transaction.transaction_id}
                    </CardTitle>
                    <CardDescription className="min-h-[48px] text-sm text-gray-600">
                        Payment: VorteKia Balance
                    </CardDescription>
                </CardHeader>
                <CardContent className="pb-2 flex flex-col gap-y-2">
                    <Label className="font-semibold">
                        Souvenir: {transaction.souvenir_name}
                    </Label>
                    <Label className="">Quantity: {transaction.quantity}</Label>
                    <Label className="text-xs italic">
                        Bought at {transaction.time}
                    </Label>
                </CardContent>
            </MagicCard>
        </Card>
    );
}

export function StaffTransactionCard({
    transaction,
}: {
    transaction: Transaction;
}) {
    return (
        <Card className="max-w-[20rem] h-full flex flex-col justify-between">
            <MagicCard
                gradientColor={"#D9D9D955"}
                className="h-full flex flex-col justify-between">
                <CardHeader className="pb-0 text-center">
                    <CardTitle className="text-xs">
                        Transaction #{transaction.transaction_id}
                        <br />
                        Cst. {transaction.customer_id}
                        <br />
                        Transactioned at: {transaction.time}
                    </CardTitle>
                    <CardDescription className="min-h-[48px] text-sm text-gray-600">
                        Payment: VorteKia Balance
                    </CardDescription>
                </CardHeader>
                <CardContent className="pb-2 flex flex-col gap-y-2">
                    <Label className="font-semibold">
                        Souvenir: {transaction.souvenir_name}
                    </Label>
                    <Label className="">Quantity: {transaction.quantity}</Label>
                </CardContent>
            </MagicCard>
        </Card>
    );
}
