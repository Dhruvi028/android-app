import React from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native'; // Removed Image
import FastImage from 'react-native-fast-image'; // Added FastImage
import ProductCountComponent from './ProductCountComponent';

const { width } = Dimensions.get('window');
// const itemWidth = (width - 15 - 20) / 2.5;
const itemWidth = (width - 150) / 2;

type Props = {
    navigation: any;
    item: any;
    rowIndex: number;
    colIndex: number;
    productsInRows: any;
    serviceMode: boolean;
    refreshVersion: number;
};

const ProductCardComponent = ({
    navigation,
    item,
    rowIndex,
    colIndex,
    productsInRows,
    serviceMode,
    refreshVersion
}: Props) => {
    const slotKey = `${rowIndex}-${colIndex}`;

    if (!item && !serviceMode) return null;

    const isEmptySlot = !item;
    const containerClasses = isEmptySlot
        ? ''
        : 'border-2 border-gray-500 rounded-2xl overflow-hidden';

    return (
        <View
            key={`${rowIndex}-${colIndex}-${item?.quantity ?? 'empty'}`}
            className='flex justify-center items-center my-2 mr-6'>
            <View key={slotKey}
                style={{ width: itemWidth }}
                className={containerClasses}>
                {isEmptySlot ? (
                    <TouchableOpacity
                        className="w-full p-4 border-2 border-slate-400 rounded-2xl bg-slate-100"
                        style={{ height: 270 }}
                        onPress={() => {
                            navigation.navigate("AddProduct", { row: rowIndex + 1, column: colIndex + 1 });
                        }}
                    >
                        <View className="flex flex-row justify-between items-center w-full mt-1">
                            <Text className="text-sm">{rowIndex + 1}-{colIndex + 1}</Text>
                        </View>
                        <View className="flex justify-center items-center flex-1">
                            <Text className="text-6xl text-slate-500">+</Text>
                        </View>
                    </TouchableOpacity>
                ) : (
                    <View className={`flex px-4 py-4 w-full ${item.status ? 'bg-white' : 'bg-red-50 opacity-70'}`}>
                        <View className="flex flex-row justify-between items-center w-full px-1 mb-2">
                            <Text className="text-sm text-slate-500">{item.rowNumber}-{item.columnNumber}</Text>
                            {item.quantity ? (
                                <View className="py-1 px-2 rounded-xl bg-slate-100">
                                    <Text className="text-sm">{item.quantity} / 10</Text>
                                </View>
                            ) : (
                                <View className="w-12" />
                            )}
                        </View>

                        <View className="flex justify-center items-center" style={{ height: 150 }}>
                            <View style={{ width: '100%', aspectRatio: 1.5 }}>
                                <FastImage
                                    style={{ width: '100%', height: '100%' }}
                                    source={{
                                        uri: item?.imageUrl,
                                        priority: FastImage.priority.normal, // Optional: .low, .normal, .high
                                        cache: FastImage.cacheControl.immutable, // Optional: .web, .cacheOnly, .immutable
                                    }}
                                    resizeMode={FastImage.resizeMode.contain} // .contain, .cover, .stretch, .center
                                />
                            </View>
                        </View>

                        <View className="mt-3">
                            <Text className="text-slate-800 font-semibold text-lg text-center">{item?.name}</Text>
                            <View className={`flex flex-row 
                                ${serviceMode ? 'justify-center' : 'justify-between'}
                                 items-center mt-2 px-1`}>
                                <Text className="text-xl font-semibold text-slate-600">₹ {item?.mrp}</Text>
                                {serviceMode ?
                                    <></>
                                    :
                                    <ProductCountComponent item={item} productsInRows={productsInRows} refreshVersion={refreshVersion} />
                                }
                            </View>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
};

export default React.memo(ProductCardComponent);


// const renderItem = (item: any, rowIndex: number, colIndex: number, productsInRows: any, serviceMode: boolean) => {
//     if (!item && !serviceMode) {
//         return null
//     }
//     if (!item) {
//         return (
//             <View style={[{ width: itemWidth }]} className="p-3">
//                 <TouchableOpacity className=" p-4 border-2 border-slate-400 rounded-2xl w-full bg-slate-100" style={{ height: 270 }}
//                     onPress={() => {
//                         // navigation.navigate("AddProduct", { row: item.rowNumber, column: item.columnNumber })
//                     }}
//                 >
//                     <View className="flex flex-row justify-between items-center w-full mt-1">
//                         <Text className="text-sm">{rowIndex + 1}-{colIndex + 1}</Text>
//                     </View>
//                     <View className="flex justify-center items-center flex-1">
//                         <Text className="text-6xl">+</Text>
//                     </View>
//                 </TouchableOpacity>
//             </View>
//         )
//     }
//     return (
//         <>
//             {/* {(option == 1 || (option == 2 && item.type != "drinks") || (option == 3 && item.type == "drinks")) ? */}
//             <View style={[{ width: itemWidth }]} className="p-3" key={colIndex}>
//                 <View className={`flex px-4 py-4 border-2 border-slate-300 rounded-2xl w-full ${item?.status ? 'bg-white' : 'bg-red-50 opacity-70'}`} >
//                     <View className="flex flex-row justify-between items-center w-full px-1">
//                         {/* <TouchableOpacity className="bg-slate-100 p-1 rounded-full"
//                                     onPress={() => { setProductInfoModal(item) }}
//                                     disabled={!item.status}
//                                 >
//                                     <InfoSVG width={15} />
//                                 </TouchableOpacity> */}
//                         {/* {userType == "admin" ? */}
//                         <Text className="text-sm">{item.rowNumber}-{item.columnNumber}</Text>
//                         {/* : <></>} */}
//                         {item.quantity ?
//                             <View className="py-1 px-2 rounded-xl bg-slate-100">
//                                 <Text className="text-sm">{item.quantity} / 10</Text>
//                             </View>
//                             : <View className="w-12"></View>
//                         }
//                     </View>
//                     <View className="flex justify-center items-center " style={{ height: 150 }}>
//                         <View style={{ width: '100%', aspectRatio: 1.5 }} className="">
//                             <Image source={{ uri: item?.imageUrl }}
//                                 resizeMode="contain"
//                                 style={{ width: '100%', height: '100%' }}
//                             />
//                         </View>
//                     </View>
//                     <View className="flex ">
//                         <View className="w-full flex justify-center items-start flex-row " style={{ height: 35 }}>
//                             <Text className="text-slate-800 font-semibold text-xl">{item?.name}</Text>
//                         </View>
//                         <View className="flex w-full">
//                             <View className="w-full flex justify-between items-center flex-row px-1 ">
//                                 <Text className="text-xl font-semibold text-slate-600 ">{"₹"} {item?.mrp}</Text>
//                                 <ProductCountComponent item={item} data={productsInRows} />
//                             </View>
//                         </View>
//                     </View>
//                 </View>
//             </View>
//             <></>
//             {/* } */}
//         </>
//     )

// };