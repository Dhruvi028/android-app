import { useRoute } from "@react-navigation/native"
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Back from "../../components/Back";

export default function AddProductScreen({ navigation }: any) {
    const route = useRoute<any>();
    console.log(route.params);
    if (!route.params?.row || !route.params?.column) {
        navigation.navigate("Products");
        return;
    }

    return (
        <SafeAreaView className="flex-1">
            <Back navigation={navigation} />
            <View className="flex flex-1 py-4 px-8 relative">
                <Text className="font-bold text-3xl">Add Product</Text>
                <View className="flex mt-8 justify-start flex-row">
                    <Text className=" text-xl bg-slate-200 px-3 py-1">Row: {route.params.row}, Column: {route.params.column}</Text>
                </View>


                <View className="mt-12 flex gap-6">
                    <View className="flex gap-1">
                        <Text className="text-xl font-semibold">Name</Text>
                        <TextInput className="border border-2 border-slate-400 rounded-xl px-6 py-3 text-lg" />
                    </View>

                    <View className="flex gap-1">
                        <Text className="text-xl font-semibold">Price</Text>
                        <TextInput className="border border-2 border-slate-400 rounded-xl px-6 py-3 text-lg" keyboardType="numeric" />
                    </View>

                </View>
                <View className="mt-12">
                    <TouchableOpacity className="w-full bg-slate-800 flex justify-center items-center rounded-xl py-3 px-6"
                        onPress={() => { navigation.goBack() }}
                    >
                        <Text className="text-2xl text-white">Save</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
}