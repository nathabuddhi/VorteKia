import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
            <div className="flex w-full max-w-xl flex-col gap-6"></div>
            <Button onClick={() => navigate("/login")}>Login Page</Button>
        </div>
    );
}

