import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, Alert, Modal, ActivityIndicator, Image, NativeModules, ToastAndroid } from 'react-native';
import Header from '../../components/Header';
import BackSVG from "../../../assets/img/back.svg"
import { SafeAreaView } from 'react-native-safe-area-context';
import PaySVG from "../../../assets/img/pay.svg";
// import {
//     UsbSerialManager,
//     Device,
//     UsbSerial,
//     Parity,
// } from 'react-native-usb-serialport-for-android';

import SerialPortAPI from 'react-native-serial-port-api';
import Back from '../../components/Back';
import InfoSVG from "../../../assets/img/info.svg";
import SuccessSVG from "../../../assets/img/success.svg";
import axios from 'axios';
import { envConfig } from '../../config/environment';
import RNFS from 'react-native-fs';
import { Client } from '@taoqf/react-native-mqtt';
import { getProductsInRows } from '../../services/productService';
import { getStoredCart } from '../../services/cartStorageService';
import { extractCartDetails } from '../../services/cartService';
import { RenderItemCart } from '../../components/CartModal';
import { useAuth } from '../../context/AuthContext';
import mqtt from '@taoqf/react-native-mqtt';
import { useAsyncTimer } from '../../hooks/useAsyncTimer';
import EncryptedStorage from 'react-native-encrypted-storage';


const { MqttCertModule } = NativeModules;


// export const BACKEND_URL = 'http://192.168.0.110:3006';

const products = [
    { id: '1', name: 'Organic Honey', quantity: 1, price: 10 },
    { id: '2', name: 'Almond Milk', quantity: 2, price: 4.5 },
    { id: '3', name: 'Oats', quantity: 1, price: 6 },
];
export enum VendStatus {
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETE = "COMPLETE",
    NO_MOTOR = "NO_MOTOR",
    ERROR = "ERROR",
    FAILED = "FAILED",
}

function hex2BinaryString(hex: string) {
    const a = "00000000" + (parseInt(hex, 16)).toString(2)
    return a.substring(a.length - 8)
}
const inferVendOrPollResponse = (msg: string, printInference = false): VendStatus => {

    const byte2Hex = msg.substring(4, 6);
    const binByte2 = hex2BinaryString(byte2Hex);

    if (binByte2[0] === "1") {
        if (printInference) console.log("Vend In Progress");
        return VendStatus.IN_PROGRESS;
    }

    if (binByte2[1] === "1") {
        if (printInference) console.log("Vend Complete");
        return VendStatus.COMPLETE;
    }

    if (binByte2[5] === "1") {
        if (printInference) console.log("No Motor");
        return VendStatus.NO_MOTOR;
    }

    if (binByte2[6] === "1") {
        if (printInference) console.log("Vend Error");
        return VendStatus.ERROR;
    }

    if (binByte2[7] === "1") {
        if (printInference) console.log("Vend Did Not Succeed");
        return VendStatus.FAILED;
    }

    return VendStatus.ERROR;
}

const sleep = (seconds: number) => {
    return new Promise((r) => {
        setTimeout(() => { r(null) }, seconds * 1000);
    })
}
const getUsbListAndConnect = async (setUsbDevices: any, setUsbSerialPort: any, pollIntervalRef: any) => {

    // const allDevices = await UsbSerialManager.list();

    // console.log(allDevices);
    // const result = await UsbSerialManager.tryRequestPermission(allDevices[0].deviceId);
    // console.log(result);

    // const usbSerialport = await SerialPortAPI.open(
    //     allDevices[0].deviceId,
    //     {
    //         baudRate: 9600,
    //         parity: Parity.None,
    //         dataBits: 8,
    //         stopBits: 1,
    //     },
    // );
    // setUsbDevices([...allDevices]);
    const usbSerialPort = await SerialPortAPI.open("/dev/ttyS9", { baudRate: 9600 });
    // usbSerialPort.onReceived()
    setUsbSerialPort(usbSerialPort);
    return;
}

const pollCommand = "A502000002";
const vendCommandPrefix = "A50700"

const calculateChecksum = (arr: string): string => {
    let sum = 0;

    for (const val of arr) {
        sum += parseInt(val, 16);
    }

    const checksum = sum % 256;
    var checksumNew = checksum.toString(16)
    if (checksumNew.length == 1) {
        return `0${checksumNew}`;
    }
    return checksumNew;
};

const updateOnReceiveFunction = (usbSerialPort: any, pollIntervalRef: any) => {
    let vendOrPollResponse = '';
    const sub = usbSerialPort.onReceived((event: any) => {
        console.log(event);
        if (event.checkoutCost === 'A5') vendOrPollResponse = 'A5';
        else {
            if (vendOrPollResponse.length < 10) {
                vendOrPollResponse = `${vendOrPollResponse}${event.checkoutCost}`;
            }
            if (vendOrPollResponse.length === 10) {
                // console.log(`Final checkoutCost => ${vendOrPollResponse}`);
                const currentVendStatus = inferVendOrPollResponse(vendOrPollResponse, true);
                if (currentVendStatus !== VendStatus.IN_PROGRESS && pollIntervalRef) {
                    clearInterval(pollIntervalRef);
                    sub.remove();
                }
            }
        }
    });
}

const waitForVendCompletion = (usbSerialPort: any): Promise<VendStatus> => {
    return new Promise((resolve) => {
        let pollInterval: NodeJS.Timeout;
        // let vendOrPollResponse = "";

        const sub = usbSerialPort.onReceived((buffer: any) => {
            console.log(buffer.toString('hex').toUpperCase(), 'Response');
            const vendOrPollResponse = buffer.toString('hex').toUpperCase();
            if (vendOrPollResponse.length === 10) {
                const status = inferVendOrPollResponse(vendOrPollResponse, true);
                if (status !== VendStatus.IN_PROGRESS) {
                    sub.remove();
                    clearInterval(pollInterval);
                    console.log(status);
                    return resolve(status);
                }
            }
        });

        pollInterval = setInterval(async () => {
            await usbSerialPort.send(pollCommand);
        }, 500);

        // setTimeout(() => {
        //     clearInterval(pollInterval);
        //     sub.remove();
        //     return resolve(VendStatus.UNKNOWN);
        // }, 20000);
    });
};


const CheckoutScreen = ({ navigation }: any) => {

    const total = products.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = total * 0.05;
    const finalAmount = total + tax;
    const [checkoutCost, setCheckoutCost] = useState<any>({
        subtotal: 0,
        gst: 0,
        total: 0
    })
    const [usbSerialPort, setUsbSerialPort] = useState<any>();
    const [usbDevices, setUsbDevices] = useState<any>();
    const [pollIntervalRef, setPollIntervalRef] = useState<any>();
    const [showProductStatusModal, setShowProductStatusModal] = useState<boolean>(false);
    const [generatedOrder, setGeneratedOrder] = useState<any>();

    const [connectionStatus, setConnectionStatus] = useState('Disconnected');
    const [message, setMessage] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const clientRef = useRef<any>(null);
    const [cart, setCart] = useState<Record<string, number>>({});
    const [cartDetails, setCartDetails] = useState<any[]>([]);
    const { serviceMode, flushData, flushCart, flushToken, setIsLoggedIn } = useAuth();
    const [productsInRows, setProductsInRows] = useState<any>();
    const [paymentLoading, setPaymentLoading] = useState<any>();
    const [paymentSuccess, setPaymentSuccess] = useState<any>();
    const [vendingSuccess, setVendingSuccess] = useState<boolean>(false);

    async function getProductDetails() {
        var result: any = await getProductsInRows(serviceMode);
        if (result) {
            getStoredCart().then((savedCart) => {
                setCart(savedCart);
                setCartDetails(extractCartDetails(savedCart, result?.productsInRows));
            });
            setProductsInRows(result.productsInRows);
        }
        else {
            await flushData();
            await flushToken();
            setIsLoggedIn(false);
        }
    }

    // TODO : MQTT IMPLEMENTATION
    // const initMQTT = async () => {
    //     try {
    //         const ca1 = await RNFS.readFileAssets('ca1.pem.crt', 'utf8');
    //         const ca2 = await RNFS.readFileAssets('ca3.pem.crt', 'utf8');
    //         const cert = await RNFS.readFileAssets('cert.pem.crt', 'utf8');
    //         const key = await RNFS.readFileAssets('private-key.pem.key', 'utf8');

    //         const options = {
    //             host: envConfig.MQTT_URL,
    //             port: 8883,
    //             protocol: 'mqtts',
    //             tls: true,
    //             ca: [ca1, ca2],
    //             cert: cert,
    //             key: key,
    //             rejectUnauthorized: true,
    //             clientId: 'rn-client-' + Math.random().toString(16).substr(2, 8),
    //         };
    //         console.log(options);

    //         const client = mqtt.connect(options);

    //         clientRef.current = client;
    //         console.log(client);


    //         client.on('connect', () => {
    //             setConnectionStatus('Connected');
    //             setIsConnected(true);
    //         });

    //         client.on('error', (err: any) => {
    //             setConnectionStatus(`Error: ${err.message}`);
    //             setIsConnected(false);
    //         });

    //         client.on('close', () => {
    //             setConnectionStatus('Disconnected');
    //             setIsConnected(false);
    //         });

    //         console.log(client);
    //     } catch (err: any) {
    //         console.log(err.message);
    //         setConnectionStatus(`Init Error: ${err.message}`);
    //     }
    // };

    useEffect(() => {
        getProductDetails();
        getUsbListAndConnect(setUsbDevices, setUsbSerialPort, pollIntervalRef);
    }, []);

    useEffect(() => {
        if (cartDetails && cartDetails.length) {
            const subtotal = cartDetails.reduce((acc: any, item: any) => acc + item.mrp * item.count, 0);
            const gst = 0;
            const total = +(subtotal + gst).toFixed(2);
            setCheckoutCost({
                subtotal: subtotal,
                gst: gst,
                total: total
            })
        }
    }, [cartDetails])

    // TODO : MQTT IMPLEMENTATION
    // useEffect(() => {

    //     initMQTT();

    //     return () => {
    //         if (clientRef.current) {
    //             // clientRef.current.disconnect();
    //         }
    //     };
    // }, []);


    // async function getProducts() {
    //     var result = await getProductsInRows(serviceMode);
    //     console.log(result);

    //     if (result)
    //         productsInRows = result.productsInRows
    // }

    async function handleCheckout() {
        setPaymentLoading(true);
        const machineResultBuffer: any = await EncryptedStorage.getItem('machine');
        const machineId = JSON.parse(machineResultBuffer)['machine']['id'];
         
        if (!machineResultBuffer) {
            await flushToken();
            await flushData();
            setIsLoggedIn(false);
            return;
        }
        await axios.post(`${envConfig.BACKEND_URL}/paytm/generate-payment-qr`, {
            amount: checkoutCost.total,
            machineId: machineId,
        })
            .then((res) => {
                if (res.data.success) {
                    subscribeToTopic(`${res.data.data.orderId}`);
                    setPaymentLoading(false);
                    setGeneratedOrder(res.data.data);
                }
                else {
                    setPaymentLoading(false);
                    console.error(res.data);
                }
            })
            .catch((err) => {
                setPaymentLoading(false);
                console.error(err);
            });
    }

    const subscribeToTopic = async (orderId: any) => {
        // TODO : MQTT IMPLEMENTATION
        // if (!clientRef.current || !isConnected) {
        //     console.warn('Not connected to MQTT broker');
        //     return;
        // }
        // // Remove any existing message handler to avoid duplicates
        // clientRef.current.removeAllListeners('message');
        // // Set up new message handler
        // clientRef.current.on('message', (receivedTopic: any, msg: any) => {
        //     if (receivedTopic === topic) {
        //         setMessage(msg.toString());
        //     }
        // });
        // clientRef.current.subscribe(topic);
        // console.log(`Subscribed to ${topic}`);


        // TEMPORARY FIX: POLL API UNTIL GOT SUCCESS FOR ORDER
        // setPaymentLoading(true);
        pollUntilSuccess(orderId);
    };

    const pollUntilSuccess = async (orderId: any) => {
        if (!orderId) {
            return;
        }
        let success = false;
        const maxRetries = 30;
        let attempt = 0;

        while (!success && attempt < maxRetries) {
            try {
                const response = await axios.get(`${envConfig.BACKEND_URL}/order/app-order/status/${orderId}`);

                if (response?.data?.success === true) {
                    success = true;
                    setPaymentSuccess(true);
                    break;
                } else {
                    console.log('Retrying');
                }

                attempt++;
                await new Promise((resolve) => setTimeout(resolve, 2000));
            } catch (err) {
                console.error('API call failed:', err);
                attempt++;
                await new Promise((resolve) => setTimeout(resolve, 2000));
            }
        }

        setPaymentSuccess(success);
        if (!success) {
            // Alert.alert("Payment Error","Payment not recevied for 60 secs.");
            ToastAndroid.show("Payment not recevied for 60 secs.", 3000);
            await sleep(3);
            await flushData();
            navigation.navigate("Products");

        }
        else {
            setPaymentLoading(false);
            handleVending(orderId);
        }
    };




    async function handleVending(orderId:string) {
        // console.log(usbDevices);
        // if (usbDevices.length === 0) {
        //     Alert.alert("No devices connected!");
        //     return;
        // }
        console.log("Started");
        console.log(cartDetails, orderId);
        const updatedCartDetails = [...cartDetails];
        setShowProductStatusModal(true);

        for (let index = 0; index < updatedCartDetails.length; index++) {
            const product = updatedCartDetails[index];

            for (let i = 0; i < product.count; i++) {
                if (!updatedCartDetails[index].vendingStatus) {
                    updatedCartDetails[index].vendingStatus = [];
                }
                updatedCartDetails[index].vendingStatus[i] = VendStatus.IN_PROGRESS;
                setCartDetails([...updatedCartDetails]);

                const rn = 1;
                const cn = 1;

                const checksumValue = calculateChecksum(`${vendCommandPrefix.slice(2)}${rn - 1}${cn - 1}`);
                const finalVendCommand = `${vendCommandPrefix}${rn - 1}${cn - 1}${checksumValue}`;
                await usbSerialPort.send(`${finalVendCommand}\r\n`);
                const status = await waitForVendCompletion(usbSerialPort);

                const postBody = {
                    status: VendStatus.COMPLETE ? true : false,
                    orderId: orderId,
                    machineDetailId: product.machineDetailId,
                };
                try {
                    await axios.post(`${envConfig.BACKEND_URL}/order/order-detail`,postBody)
                } catch (error) {
                    console.log(error);
                }

                updatedCartDetails[index].vendingStatus[i] = status === VendStatus.COMPLETE ? VendStatus.COMPLETE : VendStatus.FAILED;
                setCartDetails([...updatedCartDetails]);

                await sleep(1);
            }
            console.log(`${index + 1}th iteration success`);
        }
        setVendingSuccess(true);
        await sleep(5);
        await handleDoneVending();
        // WILL WAIT FOR 10 SECONDS UNTIL TIMER FINISHES AND THEN CALLS CALLBACK
        // const delayTimeInMilliseconds = 10000;
        // useAsyncTimer(handleDoneVending, delayTimeInMilliseconds);
    }

    async function handleDoneVending() {
        await flushData();
        navigation.navigate("Products");
    }

    return (
        <SafeAreaView className='flex-1'>
            <Header />
            <Back navigation={navigation} />
            <View className={` rounded-2xl py-4 px-8`}>
                {/* <Text>IS CONNECTED : {isConnected}</Text>
                <Text>Connection Status: {connectionStatus} </Text> */}
                <Text className="text-4xl font-bold mb-6">Order Summary</Text>

                {cartDetails && cartDetails.length > 0 ?
                    <>
                        {cartDetails != undefined && cartDetails.length > 0 && cartDetails.map((el: any, index: any) => {
                            return (
                                <RenderItemCart
                                    key={index}
                                    item={el}
                                    index={index}
                                    noBorder={index == cartDetails.length - 1}
                                    data={productsInRows}
                                />
                            )
                        })}
                    </>
                    :
                    <Text className="text-red-800 text-2xl ml-3">No Products Selected!</Text>
                }

                <View className="border-t border-gray-300 my-4 px-3" />
                {/* {checkoutCost?.subtotal ?
                    <View className="flex-row justify-between mb-2 px-3">
                        <Text className="text-2xl text-gray-700">Subtotal</Text>
                        <Text className="text-2xl text-gray-700">{"₹"} {checkoutCost.subtotal}</Text>
                    </View>
                    : <></>
                }

                {checkoutCost?.gst ?
                    <View className="flex-row justify-between mb-2 px-3">
                        <Text className="text-2xl text-gray-700">GST (5%)</Text>
                        <Text className="text-2xl text-gray-700">{"₹"} {checkoutCost.gst}</Text>
                    </View>
                    : <></>
                } */}

                {checkoutCost?.total ?
                    <View className="flex-row justify-between mb-2 px-3 bg-gray-200 py-1 rounded-xl">
                        <Text className="text-2xl text-gray-700 font-semibold">Total</Text>
                        <Text className="text-2xl text-gray-700 font-semibold">{"₹"} {checkoutCost.total}</Text>
                    </View>
                    : <></>
                }
                {generatedOrder ?
                    <View className='w-full flex justify-center items-center mt-36'>
                        <Text className='mb-3 text-xl'>Please pay using the below QR</Text>
                        <Image width={300} height={300} source={{ uri: generatedOrder?.qrBase64Str }} />
                    </View> :
                    <View>
                        <TouchableOpacity className="bg-green-600 mt-6 py-3 rounded-xl flex justify-center items-center flex-row gap-3"
                            onPress={handleCheckout}
                            disabled={paymentLoading || checkoutCost.total < 1 || cartDetails.length === 0}
                        >
                            <PaySVG />
                            <Text className="text-center text-white text-2xl font-semibold">Pay Now</Text>
                        </TouchableOpacity>
                    </View>
                }
            </View>
            {paymentLoading &&
                <View className='flex justify-center items-center absolute top-0 left-0 bg-white/70 w-full h-full'>
                    <ActivityIndicator size={"large"} />
                </View>
            }
            <Modal
                visible={showProductStatusModal}
                transparent
                onRequestClose={() => setShowProductStatusModal(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/20">
                    <View className="bg-white rounded-2xl p-4 max-h-[70%] w-[70%] flex-1">
                        <Text className='text-2xl font-semibold px-2'>Vending Status</Text>
                        <ScrollView className="flex w-full mt-8 px-3 flex-1">
                            {Array.isArray(cartDetails) && cartDetails.length > 0 && cartDetails.map((product: any, index: any) => {
                                return (
                                    <View className="flex justify-between items-center flex-row my-2" key={index}>
                                        <Text className={`font-bold text-xl`}>{product?.name} {product?.count ? `(${product.count})` : "(1)"}</Text>
                                        <View className="flex flex-row items-center justify-center gap-3">
                                            {Array.isArray(product.vendingStatus) ?
                                                <>
                                                    {product.vendingStatus.map((status: any, j: number) => {
                                                        return (
                                                            <View key={j}>
                                                                {status === VendStatus.IN_PROGRESS ? <ActivityIndicator /> : <>
                                                                    {status === VendStatus.COMPLETE ? <View className="bg-green-200 rounded-full p-2">
                                                                        <SuccessSVG width={15} height={15} />
                                                                    </View> : <>
                                                                        {status === VendStatus.FAILED ? <View className="bg-red-200 rounded-full p-2">
                                                                            <InfoSVG width={15} height={15} />
                                                                        </View> : <>
                                                                            <Text>Queued</Text>
                                                                        </>}
                                                                    </>}
                                                                </>}
                                                            </View>
                                                        )
                                                    })}
                                                </> :
                                                <View>
                                                    <Text>Queued</Text>
                                                </View>
                                            }
                                        </View>
                                    </View>
                                )
                            })}
                        </ScrollView>
                        <View className='px-4'>
                            {vendingSuccess &&
                                <TouchableOpacity className='bg-slate-700 w-full py-2 flex justify-center items-center rounded-xl'
                                    onPress={handleDoneVending}
                                >
                                    <Text className='text-white text-lg'>Done</Text>
                                </TouchableOpacity>
                            }
                        </View>

                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default CheckoutScreen;

