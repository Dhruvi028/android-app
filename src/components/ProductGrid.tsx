import React, { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Text } from "react-native";
import ProductCard from "./ProductCard";
import { OPTION_ALL, OPTION_DRINKS, OPTION_SNACKS } from "../models/productModel";

export default function ProductGrid({
    productsInRows,
    option,
    navigation,
    serviceMode,
    refreshVersion,
    refreshing,
    handleRefresh,
}: any) {
    const [loading, setLoading] = useState<boolean>(false);

    const filteredRows = useMemo(() => {
        setLoading(true);
        const pRows = productsInRows
            .map((row: any) => {
                return row.filter((product: any) => {
                    if (!product) return false;
                    if (option === OPTION_ALL) return true;
                    if (option === OPTION_DRINKS) return product.type === "drinks";
                    if (option === OPTION_SNACKS) return product.type === "chips";
                    return false;
                })
            }
            )
            .filter((row: any) => row.length > 0);
        setLoading(false);
        return pRows;
    }, [productsInRows, option]);

    const renderHorizontalList = ({ item: row, index: rowIndex }: any) => (
        <FlatList
            data={row}
            keyExtractor={(item) => `${item.row}-${item.column}-${Math.random()}`}
            horizontal
            showsHorizontalScrollIndicator={true}
            renderItem={({ item, index: colIndex }) => (
                <ProductCard
                    navigation={navigation}
                    item={item}
                    rowIndex={item.row}
                    colIndex={item.column}
                    productsInRows={productsInRows}
                    serviceMode={serviceMode}
                    refreshVersion={refreshVersion}
                />
            )}
            initialNumToRender={1}
            maxToRenderPerBatch={1}
            windowSize={1}
            removeClippedSubviews
        />
    );

    return (
        <>
            {loading ?
                <ActivityIndicator size={"large"} /> :
                <FlatList
                    data={filteredRows}
                    keyExtractor={(_, rowIndex) => `row-${rowIndex}`}
                    renderItem={renderHorizontalList}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    initialNumToRender={1}
                    maxToRenderPerBatch={1}
                    windowSize={1}
                    removeClippedSubviews
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    ListEmptyComponent={
                        <Text style={{ textAlign: "center", marginTop: 40, color: "#64748b" }}>
                            No products found.
                        </Text>
                    }
                />
            }
        </>
    );
}
