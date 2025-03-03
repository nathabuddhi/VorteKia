import { Label } from "@/components/ui/label";
import { TypeAnimation } from "react-type-animation";

interface HelloLabelProps {
    username: string;
}

export default function HelloLabel({ username }: HelloLabelProps) {
    return (
        <Label>
            Hello {username},
            <TypeAnimation
                sequence={[
                    " Welcome to VorteKia!",
                    1000,
                    " Willkommen bei VorteKia!",
                    1000,
                    " Selamat datang di VorteKia!",
                    1000,
                    " VorteKiaへようこそ!",
                    1000,
                    " 欢迎来到VorteKia!",
                    1000,
                    " Benvenuto a VorteKia!",
                    1000,
                    " ¡Bienvenido a VorteKia!",
                    1000,
                ]}
                wrapper="span"
                cursor={true}
                repeat={Infinity}
                speed={30}
                deletionSpeed={30}
            />
        </Label>
    );
}
