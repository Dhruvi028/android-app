import { Modal, Text, TouchableOpacity, View } from "react-native"
import ProductCountComponent from "./ProductCountComponent";
import { useEffect, useState } from "react";
import { getProductsInRows } from "../services/productService";
import { getStoredCart } from "../services/cartStorageService";
import { extractCartDetails } from "../services/cartService";
import { useAuth } from "../context/AuthContext";

export const RenderItemCart = ({ item, index, productsInRows, noBorder, handleCartRefresh }: any) => {
    return (
        item && item.count >= 1 ?
            <View className={`flex-row justify-between px-4 py-2 ${noBorder ? "" : "border-b border-gray-200"}`} key={`${index}${Math.random()}`}>
                <View className="flex flex-row items-center gap-4">
                    {/* <View className="rounded-xl px-2 bg-slate-200">
                        <Text className="text-lg">{index + 1}</Text>
                    </View> */}
                    <Text className="text-lg">{item.name} - {item.count}</Text>
                </View>
                <View className="flex flex-row gap-4">
                    <ProductCountComponent item={item} productsInRows={productsInRows} refreshKey={`${index}`} handleCartRefresh={handleCartRefresh} />
                    <Text className="text-lg w-[50] text-right">{"₹"} {item.count ? Number(item.count) * Number(item.mrp) : item.mrp}</Text>
                </View>
            </View>
            : <></>
    )
};

export default function CartModal({
    navigation,
    visible,
    toggleModal,
    goToCheckout
}: any) {
    const [productsInRows, setProductsInRows] = useState<any>();
    const [cart, setCart] = useState<Record<string, number>>({});
    const [cartDetails, setCartDetails] = useState<any[]>([]);
    const { serviceMode, flushData, flushToken, setIsLoggedIn } = useAuth();

    async function getProducts() {
        var result = await getProductsInRows(serviceMode);
        if (result) {
            const { productsInRows: rows } = result;
            const clonedRows = rows.map(row => row.map(col => (col ? { ...col } : null)));
            setProductsInRows(clonedRows);
            getStoredCart().then((savedCart) => {
                setCart({ ...savedCart });
                const extractedCartDetails = extractCartDetails({ ...savedCart }, clonedRows);
                setCartDetails([...extractedCartDetails]);
            });
        }
        else {
            await flushData();
            await flushToken();
            setIsLoggedIn(false);
        }
    }

    function handleCartRefresh() {
        getStoredCart().then((savedCart) => {
            setCart({ ...savedCart });
            const extractedCartDetails = extractCartDetails({ ...savedCart }, productsInRows);
            setCartDetails([...extractedCartDetails]);
        });
    }

    useEffect(() => {
        getProducts();
    }, [visible]);

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            onRequestClose={toggleModal}
        >
            <View className="flex-1 justify-end bg-black/20">
                <View className="bg-white rounded-t-2xl p-4 max-h-[70%]">
                    <Text className="text-xl font-bold mb-2 ml-2">Your Cart</Text>
                    {Array.isArray(cartDetails) && cartDetails.length > 0 ?
                        <>
                            {cartDetails.map((el: any, index: any) => {
                                return (
                                    <RenderItemCart
                                        key={index}
                                        item={el}
                                        index={index}
                                        data={productsInRows}
                                        handleCartRefresh={handleCartRefresh}
                                    />
                                )
                            })}
                        </>
                        :
                        <Text className="text-red-800 text-2xl ml-3">No Products Selected!</Text>
                    }

                    <View className="w-full flex flex-row gap-4">
                        <TouchableOpacity
                            className="bg-red-100 mt-4 py-2 rounded-lg flex-1"
                            onPress={toggleModal}
                        >
                            <Text className="text-red-900 text-center text-lg">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="bg-slate-800 mt-4 py-2 rounded-lg flex-1 disabled:opacity-60"
                            onPress={goToCheckout}
                            disabled={!(Object.keys(cart).length > 0 && Object.values(cart).some((count: any) => count > 0))}
                        >
                            <Text className="text-white text-center text-lg">Checkout</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </Modal>
    )
}


{/* <Modal
                visible={productInfoModal != null}
                transparent
            // onRequestClose={() => setProductInfoModal(null)}
            >
                <Pressable
                    onPress={() => setProductInfoModal(null)}
                    className="flex-1 justify-center items-center bg-black/20"
                >
                    <Pressable
                        onPress={() => { }}
                        className="bg-white rounded-xl py-4 px-6 flex gap-3 w-[80%] "
                    >

                        <View className="flex ">
                            <View className="w-full flex flex-row justify-end">
                                <TouchableOpacity className="p-2 bg-red-200 rounded-full"
                                    onPress={() => { setProductInfoModal(null) }}
                                >
                                    <CrossSVG />
                                </TouchableOpacity>
                            </View>
                            <Text className="text-sm text-center">{productInfoModal?.rowNumber}-{productInfoModal?.columnNumber}</Text>
                            <View className="flex justify-center items-center " style={{ height: 250 }}>
                                <View style={{ width: '100%', aspectRatio: 2 }} className="">
                                    <Image source={{ uri: productInfoModal?.imageUrl }}
                                        resizeMode="contain"
                                        style={{ width: '100%', height: '100%' }}
                                    />
                                </View>
                            </View>
                            <View className="w-full flex justify-center items-start flex-row my-4" style={{ height: 35 }}>
                                <Text className="text-slate-800 font-semibold text-2xl">{productInfoModal?.name}</Text>
                            </View>

                            <View className="flex w-full">
                                <View className="w-full flex justify-between items-center flex-row px-1 ">
                                    <Text className="text-xl font-semibold text-slate-600">{"₹"} {productInfoModal?.mrp}</Text>
                                    <ProductCountComponent item={productInfoModal} data={data} />
                                </View>
                            </View>
                        </View>
                        <Text className="text-xl">Available Quantity: {productInfoModal?.quantity}</Text>
                    </Pressable>
                </Pressable>
            </Modal> */}