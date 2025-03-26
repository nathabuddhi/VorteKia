import { ScrollArea } from "@/components/ui/scroll-area";
import {
    getAllStoreTransactions,
    getCustomerTransactions,
} from "@/controllers/store-controller";
import { Transaction, Store } from "@/types";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TransactionCard } from "./transaction-card";

export default function ViewTransactionHistory(store: {
    store: Store;
}) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    async function fetchTransactions() {
        const response = await getCustomerTransactions(store.store.id);
        if (response === null) {
            return;
        }

        if (response.success && response?.data) {
            setTransactions(response.data);
        } else {
            toast.error("Failed to fetch transaction history!", {
                description: response.message,
            });
        }
    }

    useEffect(() => {
        fetchTransactions();
    }, []);

    return (
        <ScrollArea className="w-full max-h-96 p-2 pr-4 relative">
            <div className="grid grid-cols-2 gap-4">
                {transactions.map((transaction) => (
                    <TransactionCard key={transaction.transaction_id} transaction={transaction} />
                ))}
            </div>
        </ScrollArea>
    );
}

export function ViewAllTransactions(store: { store: Store }) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    async function fetchTransactions() {
        const response = await getAllStoreTransactions(store.store.id);
        console.log(response);
        if (response === null) {
            return;
        }

        if (response.success && response?.data) {
            setTransactions(response.data);
        } else {
            toast.error("Failed to fetch transaction history!", {
                description: response.message,
            });
        }
    }

    useEffect(() => {
        fetchTransactions();
    }, []);

    return (
        <ScrollArea className="w-full max-h-96 p-2 pr-4 relative">
            <div className="grid grid-cols-2 gap-4">
                {transactions.map((transaction) => (
                    <TransactionCard key={transaction.transaction_id} transaction={transaction} />
                ))}
            </div>
        </ScrollArea>
    );
}
