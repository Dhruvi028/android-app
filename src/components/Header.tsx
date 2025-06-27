import { useRef } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function Header() {
    const tapCount = useRef(0);
    const lastTap = useRef<number | null>(null);
    const { setIsLoggedIn, flushData, flushToken } = useAuth();

    const handleTripleTap = async () => {
        // await toggleUserType();
        await flushData();
        await flushToken();
        setIsLoggedIn(false);

        tapCount.current = 0;
        lastTap.current = null;
    };

    const handlePress = () => {
        const now = Date.now();

        if (lastTap.current && now - lastTap.current < 400) {
            tapCount.current += 1;
        } else {
            tapCount.current = 1;
        }

        lastTap.current = now;

        if (tapCount.current === 3) {
            handleTripleTap();
        }
    };

    return (
        <View >
            <View className="w-full bg-slate-200 px-8 py-4 flex flex-row relative">
                <TouchableOpacity onPress={handlePress} activeOpacity={1}>
                    <Text className="text-3xl font-bold text-slate-500">24Buy7</Text>
                </TouchableOpacity>
                {/* <Text className="text-3xl font-bold text-slate-500"> Header</Text> */}
                {/* {isLoggedIn ?
                    <View className="absolute top-4 right-6 bg-green-100 rounded-xl py-1 px-4">
                        <Text className="text-black text-lg">admin</Text>
                    </View> : <></>} */}
            </View>

        </View>
    )
}