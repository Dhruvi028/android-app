import PlusSVG from "../../assets/img/plus.svg"
import MinusSVG from "../../assets/img/minus.svg";
import { useEffect, useState } from "react";
import { getProductsInRows } from "../services/productService";
import { getStoredCart } from "../services/cartStorageService";
import { updateCartAndStore } from "../services/cartService";
import React, { useEffect, useState } from "react"; // Imported React
import { Text, TouchableOpacity, View } from "react-native";
import PlusSVG from "../../assets/img/plus.svg";
import MinusSVG from "../../assets/img/minus.svg";
import { getProductsInRows } from "../services/productService";
import { getStoredCart } from "../services/cartStorageService";
import { updateCartAndStore } from "../services/cartService";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../store/useStore";

const ProductCountComponentInner = ({ item, productsInRows, refreshVersion, handleCartRefresh }: any) => {
    const { cart, setCart } = useStore();
    const { serviceMode, flushData, flushToken, setIsLoggedIn } = useAuth();

    async function getProducts() {
        if (!productsInRows) {
            var result = await getProductsInRows(serviceMode);
            if (result)
                productsInRows = result.productsInRows
            else {
                await flushData();
                await flushToken();
                setIsLoggedIn(false);
            }
        }
    }

    useEffect(() => {
        getProducts();
        getStoredCart().then((savedCart) => {
            setCart({ ...savedCart });
        });
    }, [refreshVersion]);

    async function onCartChange(row: number, column: number, type: 1 | -1) {
        const cartCopy = { ...cart };
        const updated = await updateCartAndStore(row, column, type, cartCopy);
        setCart({ ...updated });
        if (type == -1 && cartCopy[`${row}${column}`] == 1 && handleCartRefresh) {
            handleCartRefresh()
        }
    }

    return (
        <View>
            {cart && cart[`${item.rowNumber}${item.columnNumber}`] && cart[`${item.rowNumber}${item.columnNumber}`] > 0 ?
                <View className="flex flex-row gap-2 items-center border border-2 border-slate-800 rounded-lg h-7">
                    <TouchableOpacity className="p-2 flex justify-center items-center rounded-xl h-7"
                        onPress={() => {
                            onCartChange(item.rowNumber, item.columnNumber, -1)
                        }}
                    ><MinusSVG width={8} /></TouchableOpacity>
                    <View className="flex justify-center items-center h-7"><Text className="text-lg font-semibold text-slate-700">{cart && cart[`${item.rowNumber}${item.columnNumber}`]}</Text></View>
                    <TouchableOpacity
                        className="p-2 flex justify-center items-center rounded-full h-7"
                        onPress={() => {
                            onCartChange(item.rowNumber, item.columnNumber, 1)
                        }}
                    ><PlusSVG width={8} /></TouchableOpacity>
                </View>
                :
                <TouchableOpacity className="bg-slate-700 px-8 py-1 rounded-lg flex justify-center items-center"
                    onPress={() => {
                        onCartChange(item.rowNumber, item.columnNumber, 1)
                    }}
                    disabled={!item.status}
                >
                    <Text className="text-white">Add</Text>
                </TouchableOpacity>
            }
        </View>
    )
}

export default React.memo(ProductCountComponentInner);