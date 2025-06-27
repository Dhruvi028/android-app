import { ActivityIndicator, Alert, View } from "react-native";
import TextPrimary from "../../components/TextPrimary";
import { SafeAreaView } from "react-native-safe-area-context";
import OtpInput from "../../components/OtpInput";
import { useEffect, useRef, useState } from "react";
import PrimaryButton from "../../components/PrimaryButton";
import Back from "../../components/Back";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { envConfig } from "../../config/environment";

export default function LoginScreen({ navigation }: any) {
    const [password, setPassword] = useState<any>(['', '', '', '', '', '']);
    const [machineCode, setMachineCode] = useState<any>(['', '', '', '', '']);
    const inputRefs = useRef<any>([]);
    const inputRefsMachineCode = useRef<any>([]);
    const { setAuthAndData, toggleUserType } = useAuth();
    const [loading, setLoading] = useState<boolean>(false);

    async function handleAuthenticate() {
        setLoading(true);
        const passwordInput = password.join("").split(" ").join("");
        const machineCodeInput = machineCode.join("").split(" ").join("");

        await axios.post(`${envConfig.BACKEND_URL}/machine/machine-login`, {
            machineCode: Number(machineCodeInput),
            password: Number(passwordInput),
            tabUniqueId: envConfig.TAB_UNIQUE_ID
        })
            .then((res) => {
                setAuthAndData(res.data);
            })
            .catch((error) => {
                if (error.message == "Network Error") {
                    Alert.alert("Please connect to internet");
                    return;
                }
                if (error.status == 401) {
                    Alert.alert("Invalid credentials!");
                    return;
                }
                console.log(error);
                Alert.alert("Some error occurred while Login");
            });
        setLoading(false);
    }

    return (
        <SafeAreaView className="flex-1 ">
            {loading &&
                <View className="absolute top-0 left-0 bg-white/50 w-full h-full z-[100] flex justify-center">
                    <ActivityIndicator size={"large"} />
                </View>
            }
            {/* <Back navigation={navigation} onPressHandler={toggleUserType} /> */}
            <View className="flex-1 py-8 px-8 flex items-center pt-28">
                <View className="w-full  flex justify-center items-center">
                    <TextPrimary className="font-serif" style={{ fontSize: 30 }}>
                        Please Authenticate!
                    </TextPrimary>
                    {/* <AuthSVG height={300} width={500} /> */}
                </View>

                {/* <View className="w-full  flex flex-1 justify-between items-center pt-8 pb-4 px-4"> */}
                <View className="flex gap-14 mt-12 pt-8 pb-12 px-4">
                    <View className="flex  gap-8">
                        <TextPrimary className="font-serif" style={{ fontSize: 24 }}>
                            Enter machine code
                        </TextPrimary>
                        <OtpInput
                            onChangeOtp={(value: any) => { setMachineCode(value); }}
                            otp={machineCode}
                            inputRefs={inputRefsMachineCode}
                            length={5}
                        />
                    </View>
                    <View className="flex  gap-8">
                        <TextPrimary className="font-serif" style={{ fontSize: 24 }}>
                            Enter password
                        </TextPrimary>
                        <OtpInput
                            onChangeOtp={(value: any) => { setPassword(value); }}
                            otp={password}
                            inputRefs={inputRefs}
                            length={6}
                        />
                    </View>
                </View>
                <View className="w-full flex justify-end px-8 disabled:opacity-50">
                    <PrimaryButton title="Proceed"
                        onPress={handleAuthenticate}
                        size="large"
                        disabled={
                            password.join("").split(" ").join("").length != 6 ||
                            machineCode.join("").split(" ").join("").length != 5 ||
                            loading
                        }
                    />
                </View>
            </View>
        </SafeAreaView>

    )
}