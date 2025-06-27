import { startTransition, useCallback, useEffect, useRef, useState } from "react"; // Removed useMemo, useFocusEffect
import { Text, TouchableOpacity, View, Pressable, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header";
// import { useFocusEffect } from "@react-navigation/native"; // Removed useRoute as it's not used
import { getProductsInRows } from "../../services/productService";
import { getStoredCart } from "../../services/cartStorageService";
import { OPTION_ALL, OPTION_DRINKS, OPTION_SNACKS } from "../../models/productModel";
// import ProductCard from "../../components/ProductCard"; // Not directly used here anymore
// import CartModal from "../../components/CartModal"; // Commented out in original
import { useAuth } from "../../context/AuthContext";
import CartSVG from "../../../assets/img/cart.svg";
import ArrowRightSVG from "../../../assets/img/arrow_right.svg";
import ProductGrid from "../../components/ProductGrid";
import { useQuery } from "@tanstack/react-query";

const tabButtons = [
    { label: 'All', value: OPTION_ALL },
    { label: 'Snacks', value: OPTION_SNACKS },
    { label: 'Drinks', value: OPTION_DRINKS },
];

// Define the fetch function for React Query
const fetchProducts = async (serviceMode: boolean) => {
    const result = await getProductsInRows(serviceMode);
    if (!result) {
        throw new Error("Failed to fetch products: No result from service");
    }
    if (result.isErrorButNotUnauthorized && result.productsInRows.length === 0) { // Treat empty data on specific error as an error for query
        throw new Error("Failed to fetch products: Service indicated an error.");
    }
    // The smart update logic previously in setProductsInRows is not needed here
    // because React Query handles caching and provides stable data references.
    // If the server data itself doesn't guarantee stable object references for unchanged items,
    // a select function in useQuery could be used for fine-grained optimization,
    // but for now, we rely on React Query's default behavior.
    return result.productsInRows;
};


export default function ProductsScreen({ navigation }: any) {
    const [option, setOption] = useState(OPTION_ALL);
    const [visible, setVisible] = useState(false); // For CartModal, can be kept if modal is re-enabled
    const { serviceMode, flushData, setIsLoggedIn, flushToken } = useAuth(); // Keep flushData if handleDoubleTap needs it

    const tapCount = useRef(0);
    const lastTap = useRef<number | null>(null);
    const [tabChangeLoading, setTabChangeLoading] = useState<boolean>(false);


    const {
        data: productsData, // This will be productsInRows
        isLoading: productsLoading,
        isError: productsIsError,
        error: productsError,
        refetch: refetchProducts,
        isFetching: productsIsFetching,
    } = useQuery({
        queryKey: ['products', serviceMode],
        queryFn: () => fetchProducts(serviceMode),
        refetchOnWindowFocus: true, // Refetch on app focus
        refetchInterval: 60000, // Polls every 60 seconds, like the original default
        // staleTime: 5 * 60 * 1000, // Optional: Data is considered fresh for 5 mins
        onError: async (err: any) => {
            // Handle specific error side effects if needed, e.g., logging out user
            console.error("Error fetching products:", err);
            // Example: if a specific error type means user should be logged out
            // This logic was previously in getProducts based on `result.isErrorButNotUnauthorized`
            // and no data. Now we check the error from useQuery.
            // The original logic was:
            // } else { // This implies !result (major failure) or result.isError and no data
            //     setErrorLoadingProduct(false); // This state is gone
            //     await flushData();
            //     await flushToken();
            //     setIsLoggedIn(false);
            // }
            // This needs careful translation. If any fetch error should log out:
            // await flushData(); // Be careful with this, might clear things prematurely
            // await flushToken();
            // setIsLoggedIn(false);
        },
    });

    const handleRefresh = useCallback(async () => {
        await refetchProducts();
    }, [refetchProducts]);

    const toggleModal = () => {
        setVisible(!visible);
        // handleRefresh(); // Refreshing on modal toggle might be excessive, depends on UX
    };

    function goToCheckout() {
        getStoredCart().then((savedCart) => {
            if (!savedCart || Object.keys(savedCart).length === 0) {
                Alert.alert("Please add products in cart!");
                return;
            }
            else {
                navigation.navigate("Checkout");
            }
        });
    }

    const handleDoubleTap = async () => {
        await flushData(); // Assuming flushData still has a purpose (e.g., clearing local non-product cache)
        handleRefresh();
        tapCount.current = 0;
        lastTap.current = null;
        console.log("Refreshed via double tap");
    };

    const handleAddToCartClick = () => {
        const now = Date.now();
        if (lastTap.current && now - lastTap.current < 400) {
            tapCount.current += 1;
        } else {
            tapCount.current = 1;
        }
        lastTap.current = now;
        if (tapCount.current === 2) {
            handleDoubleTap();
        }
        // setVisible(!visible); // Original logic, if modal is used for cart
    };

    const handleTabChange = (value: number) => {
        setTabChangeLoading(true);
        startTransition(() => {
            setOption(value);
        });
        setTabChangeLoading(false); // This might run before transition completes, consider useEffect
    };

    // Extracted error display logic
    const ErrorDisplay = () => (
        <View className="absolute top-0 left-0 w-full h-full bg-white/80 flex justify-center items-center">
            <Text className="text-red-900 text-5xl font-bold">Error Loading Products!</Text>
            {productsError && <Text className="text-red-700 text-lg mt-2">{productsError.message}</Text>}
        </View>
    );

    return (
        <SafeAreaView className="flex-1 relative">
            <Header />
            <View className="flex flex-1 py-4 px-8 relative">
                <View className="flex-row justify-center gap-3 mb-4">
                    {tabButtons.map(({ label, value }) => {
                        const isSelected = option === value;
                        return (
                            <View
                                key={value}
                                className={`overflow-hidden rounded-xl ${isSelected ? 'bg-slate-600' : 'bg-slate-200'}`}>
                                <Pressable
                                    onPress={() => handleTabChange(value)}
                                    android_ripple={{ color: 'rgba(255,255,255,1)', borderless: false }}
                                    className={`px-5 py-2 transition-all duration-150`}
                                >
                                    <Text
                                        className={`
                                        text-xl 
                                        ${isSelected ? 'font-semibold text-white' : 'text-slate-800'}
                                        `}
                                    >
                                        {label}
                                    </Text>
                                </Pressable>
                            </View>
                        );
                    })}
                </View>

                {productsLoading && !productsIsFetching ? // Show initial loading indicator
                    <ActivityIndicator size={"large"} /> :
                    productsIsError && !productsData ? // Show error only if there's no cached data to display
                    <ErrorDisplay /> : // This will show error on initial load failure
                    <ProductGrid
                        productsInRows={productsData || []} // Use productsData from useQuery, fallback to empty array
                        option={option}
                        navigation={navigation}
                        serviceMode={serviceMode}
                        // refreshVersion={refreshVersion} // No longer needed
                        refreshing={productsIsFetching} // Use isFetching for the pull-to-refresh indicator
                        handleRefresh={handleRefresh}
                    />
                }
            </View>
            {serviceMode ?
                <></>
                :
                <View className="absolute border border-t-1 border-black bg-white bottom-0 py-3 left-0 flex flex-row justify-between items-center w-full bg-transparent px-8">
                    <TouchableOpacity className="rounded-full p-3 flex justify-center items-center bg-slate-200 opacity-0"
                        onPress={handleAddToCartClick} // Assuming this is for service mode toggle or similar based on previous context
                    >
                        <CartSVG width={30} />
                    </TouchableOpacity>
                    <TouchableOpacity className="rounded-xl px-4 py-3 bg-slate-800 flex justify-center items-center gap-3 flex-row disabled:opacity-70"
                        onPress={goToCheckout}
                    >
                        <Text className="text-white text-lg">Checkout</Text>
                        <ArrowRightSVG width={14} />
                    </TouchableOpacity>
                </View>
            }
            {/* TEMPORARILY DISABLING CART MODAL */}
            {/* <CartModal
                visible={visible}
                toggleModal={toggleModal}
                goToCheckout={goToCheckout}
            /> */}
            {productsIsError && productsData && // Show overlay error if there's an error during refetch but we have stale data
                <ErrorDisplay />
            }
        </SafeAreaView >
    )
}