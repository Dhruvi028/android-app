import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import ProductsScreen from '../screens/main/ProductsScreen';
import CheckoutScreen from '../screens/payment/CheckoutScreen';
import AddProductScreen from '../screens/main/AddProductScreen';


const Stack = createNativeStackNavigator();

export default function MainNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            {/* <Stack.Screen name="Home" component={HomeScreen} /> */}
            <Stack.Screen name="Products" component={ProductsScreen} />
            <Stack.Screen name="AddProduct" component={AddProductScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
        </Stack.Navigator>
    );
}
