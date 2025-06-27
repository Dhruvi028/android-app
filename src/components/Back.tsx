import { TouchableOpacity, View } from "react-native"
import BackSVG from "../../assets/img/back.svg"

export default function Back({ navigation, onPressHandler }: any) {
    return (
        <View className='w-full flex justify-center items-start my-4 px-6'>
            <TouchableOpacity className='px-4 py-2 bg-slate-200 rounded-xl'
                onPress={() => { onPressHandler ? onPressHandler() : navigation.goBack() }}
            >
                <BackSVG />
            </TouchableOpacity>
        </View>
    )
}