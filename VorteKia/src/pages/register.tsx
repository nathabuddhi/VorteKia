import { Button } from "@/components/ui/button";
import { ApiResponse, User } from "@/types";
import { invoke } from "@tauri-apps/api/core";

export default function RegisterPage() {
    return (
        <>
            <div className="">
                <Button
                    onClick={() =>
                        invoke<ApiResponse<String>>("create_customer_account", {
                            payload: {
                                email: "nathabuddhi@gmail.com",
                                password: "12345678",
                                name: "Natha Buddhi",
                                balance: 100.0,
                            },
                        })
                    }>
                    Create Temp Customer
                </Button>
                <Button
                    onClick={() => {
                        invoke<ApiResponse<String>>("create_staff_account", {
                            payload: {
                                email: "nathabuddhi@vortekia.com",
                                password: "12345678",
                                name: "Natha Buddhi",
                                division_id:
                                    "58ab1082-f205-402a-8ac1-4a33ea603faa",
                                role: "ceo",
                            },
                        });
                    }}>
                    Create Temp Staff
                </Button>
            </div>
        </>
    );
}
