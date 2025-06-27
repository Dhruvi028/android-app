import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Text, TouchableOpacity, View, ScrollView, Pressable, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { getProductsInRows } from "../../services/productService";
import { getStoredCart } from "../../services/cartStorageService";
import { OPTION_ALL, OPTION_DRINKS, OPTION_SNACKS } from "../../models/productModel";
import ProductCard from "../../components/ProductCard";
import CartModal from "../../components/CartModal";
import { useAuth } from "../../context/AuthContext";
import CartSVG from "../../../assets/img/cart.svg"
import ArrowRightSVG from "../../../assets/img/arrow_right.svg"
import ProductGrid from "../../components/ProductGrid";

const tabButtons = [
    { label: 'All', value: OPTION_ALL },
    { label: 'Snacks', value: OPTION_SNACKS },
    { label: 'Drinks', value: OPTION_DRINKS },
];

export default function ProductsScreen({ navigation }: any) {
    const [option, setOption] = useState(OPTION_ALL);
    const [visible, setVisible] = useState(false);
    const { serviceMode, flushData, setIsLoggedIn, flushToken } = useAuth();
    const [productsInRows, setProductsInRows] = useState<(any | null)[][]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [refreshVersion, setRefreshVersion] = useState(0);
    const tapCount = useRef(0);
    const lastTap = useRef<number | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [errorLoadingProduct, setErrorLoadingProduct] = useState<boolean>(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const errorModeRef = useRef(false);

    async function getProducts() {
        setLoading(true);
        const result = await getProductsInRows(serviceMode);

        if (result && !result.isErrorButNotUnauthorized) {
            setErrorLoadingProduct(false);
            errorModeRef.current = false;
            const { productsInRows: newProductsData } = result;

            setProductsInRows(currentProductsInRows => {
                let overallChanges = false;

                // If the number of rows changes, it's a definite overall change.
                if (currentProductsInRows.length !== newProductsData.length) {
                    overallChanges = true;
                }

                const updatedProductsInRows = newProductsData.map((newRow, rowIndex) => {
                    const currentRow = currentProductsInRows[rowIndex];
                    let rowChanges = false;

                    // If the number of columns in a row changes, it's a row change.
                    if (!currentRow || newRow.length !== currentRow.length) {
                        rowChanges = true;
                    }

                    const updatedRow = newRow.map((newProduct, colIndex) => {
                        const currentProduct = currentRow?.[colIndex];

                        if (!newProduct && !currentProduct) return null; // Both are null
                        if (!newProduct || !currentProduct) { // One is null, the other is not
                            rowChanges = true;
                            return newProduct ? { ...newProduct } : null;
                        }

                        // Both products exist, compare them. Assuming 'id' is the unique identifier.
                        // And other relevant props for change detection.
                        if (newProduct.id !== currentProduct.id ||
                            newProduct.name !== currentProduct.name ||
                            newProduct.mrp !== currentProduct.mrp ||
                            newProduct.quantity !== currentProduct.quantity ||
                            newProduct.imageUrl !== currentProduct.imageUrl ||
                            newProduct.status !== currentProduct.status
                            // Add other properties that, if changed, should trigger a re-render of the card
                        ) {
                            rowChanges = true;
                            return { ...newProduct }; // Create new object for changed product
                        }

                        // If ids are same and no relevant props changed, reuse the currentProduct reference
                        return currentProduct;
                    });

                    if (rowChanges) {
                        overallChanges = true;
                        return updatedRow; // This is a new array reference for the row
                    }
                    return currentRow; // Reuse existing row array reference
                });

                if (overallChanges) {
                    return updatedProductsInRows; // This is a new array reference for productsInRows
                }
                return currentProductsInRows; // Reuse existing top-level array reference
            });

        } else if (result?.isErrorButNotUnauthorized) {
            errorModeRef.current = true;
            setErrorLoadingProduct(true);
            await flushData();
        } else {
            setErrorLoadingProduct(false);
            await flushData();
            await flushToken();
            setIsLoggedIn(false);
        }

        setLoading(false);
    }

    const clearExistingInterval = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const setupDynamicInterval = () => {
        clearExistingInterval();
        const delay = errorModeRef.current ? 15000 : 60000;
        intervalRef.current = setInterval(() => {
            getProducts();
        }, delay);
    };

    useFocusEffect(
        useCallback(() => {
            getProducts();
            setupDynamicInterval();

            return () => {
                clearExistingInterval();
            };
        }, [])
    );

    useEffect(() => {
        setupDynamicInterval();
    }, [errorModeRef.current]);

    // useEffect(() => {
    //     getProducts();
    // }, [serviceMode]);

    const handleRefresh = async () => {
        setRefreshing(true);
        setRefreshVersion(prev => prev + 1);
        getProducts();
        setRefreshing(false);
    };

    const toggleModal = () => {
        setVisible(!visible);
        handleRefresh();
    }

    function goToCheckout() {
        // if (visible == true)
        //     toggleModal();
        getStoredCart().then((savedCart) => {
            if (!savedCart || Object.keys(savedCart).length == 0) {
                Alert.alert("Please add products in cart!");
                // toggleModal();
                return;
            }
            else {
                navigation.navigate("Checkout")
            }
        });
    }

    const handleDoubleTap = async () => {
        await flushData();
        handleRefresh();
        tapCount.current = 0;
        lastTap.current = null;
        console.log("Refreshed");
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
        setVisible(!visible);
    }

    const handleTabChange = (value: number) => {
        setLoading(true);
        startTransition(() => {
            setOption(value);
        });
        setLoading(false);
    };

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

                {/* {flattenedFilteredData?.length > 0 ? (
                    <FlatList
                        data={flattenedFilteredData}
                        numColumns={2}
                        keyExtractor={(_, index) => index.toString()}
                        renderItem={({ item, index }) => {
                            const rowIndex = Math.floor(index / 2);
                            const colIndex = index % 2;
                            return (
                                <ProductCard
                                    navigation={navigation}
                                    item={item}
                                    rowIndex={rowIndex}
                                    colIndex={colIndex}
                                    productsInRows={productsInRows}
                                    serviceMode={serviceMode}
                                    refreshVersion={refreshVersion}
                                />
                            );
                        }}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        initialNumToRender={1}
                        maxToRenderPerBatch={1}
                        windowSize={1}
                        removeClippedSubviews={true}
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                    />

                ) : (
                    <Text className="text-center mt-10 text-slate-600">No products found.</Text>
                )} */}
                {loading ?
                    <ActivityIndicator size={"large"} />
                    :
                    <ProductGrid
                        productsInRows={productsInRows}
                        option={option}
                        navigation={navigation}
                        serviceMode={serviceMode}
                        refreshVersion={refreshVersion}
                        refreshing={refreshing}
                        handleRefresh={handleRefresh}
                    />
                }
            </View>
            {serviceMode ?
                <></>
                :
                <View className="absolute border border-t-1 border-black bg-white bottom-0 py-3 left-0 flex flex-row justify-between items-center w-full bg-transparent px-8">
                    {/* TEMPORARILY NOT SHOWING CART BUTTON BUT ALLOWED TO CLICK SINCE USEFUL FOR FLUSH DATA */}
                    <TouchableOpacity className="rounded-full p-3 flex justify-center items-center bg-slate-200 opacity-0"
                        onPress={handleAddToCartClick}
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
            {errorLoadingProduct &&
                <View className="absolute top-0 left-0 w-full h-full bg-white/80 flex justify-center items-center">
                    <Text className="text-red-900 text-5xl font-bold">Error Loading Products!</Text>
                </View>
            }
        </SafeAreaView >
    )
}