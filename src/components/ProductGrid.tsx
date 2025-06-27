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
    // const [loading, setLoading] = useState<boolean>(false); // See note below

    // Note: The loading state was being set synchronously within useMemo, which is an anti-pattern.
    // Client-side filtering as done here is usually very fast. If a loading indicator is truly
    // needed (e.g., for very large datasets), it should be managed with useEffect,
    // triggering the filtering and updating a separate loading state.
    // For now, we assume the filtering is fast enough not to need a dedicated loading spinner.
    const filteredRows = useMemo(() => {
        return productsInRows
            .map((row: any) => {
                return row.filter((product: any) => {
                    if (!product) return false;
                    // Assuming product has a unique 'id' field.
                    // If not, ensure product objects have stable unique identifiers.
                    if (option === OPTION_ALL) return true;
                    if (option === OPTION_DRINKS) return product.type === "drinks";
                    if (option === OPTION_SNACKS) return product.type === "chips";
                    return false;
                });
            })
            .filter((row: any) => row.length > 0);
    }, [productsInRows, option]);

    const renderHorizontalList = ({ item: row, index: rowIndex }: any) => (
        <FlatList
            data={row}
            // Assuming 'item' has a unique 'id'. If not, use `${item.row}-${item.column}`
            // provided these are stable and unique within the row.
            // IMPORTANT: The product object *must* have a stable unique identifier for keys.
            // If 'item.id' is not present or not unique, this needs to be addressed in the data source.
            keyExtractor={(item, index) => item.id ? `product-${item.id}` : `product-${item.row}-${item.column}-${index}`}
            horizontal
            showsHorizontalScrollIndicator={true}
            renderItem={({ item, index: colIndex }) => (
                <ProductCard
                    navigation={navigation}
                    item={item}
                    // Ensure rowIndex and colIndex passed to ProductCard are the original, stable ones if item itself doesn't contain them
                    rowIndex={item.row} // Assuming item.row is the original row index
                    colIndex={item.column} // Assuming item.column is the original col index
                    productsInRows={productsInRows} // This prop might cause re-renders if not stable
                    serviceMode={serviceMode}
                    refreshVersion={refreshVersion}
                />
            )}
            initialNumToRender={3} // Increased from 1
            maxToRenderPerBatch={3} // Increased from 1
            windowSize={5} // Increased from 1
            removeClippedSubviews // Keep this, can be beneficial
        />
    );

    // If the loading state was primarily for the filtering process, it's likely not needed.
    // If it was for data fetching (controlled by `refreshing`), that's handled by the FlatList's own prop.
    return (
        <>
            {/* {loading ? // Removed loading state tied to filtering
                <ActivityIndicator size={"large"} /> : */}
                <FlatList
                    data={filteredRows}
                    keyExtractor={(_, rowIndex) => `row-${rowIndex}`} // This seems fine for rows
                    renderItem={renderHorizontalList}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    initialNumToRender={3} // Increased from 1
                    maxToRenderPerBatch={3} // Increased from 1
                    windowSize={7} // Increased from 1, typically (2 * visible_items) + 1
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
