import { Label } from "@/components/!!ui/label";
import { TypeAnimation } from "react-type-animation";

interface HelloLabelProps {
    username: string;
}

export default function HelloLabel({ username }: HelloLabelProps) {
    return (
        <Label>
            <TypeAnimation
                sequence={[
                    `Hello ${username}, Welcome to VorteKia!`,
                    1000,
                    `Hello ${username}, Willkommen bei VorteKia!`,
                    1000,
                    `Hello ${username}, Selamat datang di VorteKia!`,
                    1000,
                    `Hello ${username}, VorteKiaへようこそ!`,
                    1000,
                    `Hello ${username}, 欢迎来到VorteKia!`,
                    1000,
                    `Hello ${username}, Benvenuto a VorteKia!`,
                    1000,
                    `Hello ${username}, ¡Bienvenido a VorteKia!`,
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
