import React, { createContext, useContext, useState, useEffect } from 'react';
import EncryptedStorage from 'react-native-encrypted-storage';
import { Machine, MachineResponse as MachineResponseModel } from '../models/machine.models';
import { saveMachineDetails } from '../services/productService';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [goToPayment, setGoToPayment] = useState(false);
    const [userType, setUserType] = useState<string | null>(null);
    const [serviceMode, setServiceMode] = useState<boolean>(false);

    const loadAuthState = async () => {
        const storedUser = await EncryptedStorage.getItem('user-token');
        if (!storedUser) {
            setIsLoggedIn(false);
            // setUserType('admin');
            // setServiceMode(false);
            return;
        }
        setIsLoggedIn(true);
        // setUserType('admin');
        // setGoToPayment(false);
        // setServiceMode(true);
    };

    useEffect(() => {
        loadAuthState();
    }, [userType]);

    useEffect(() => { console.log("Logged in : ", isLoggedIn); }, [isLoggedIn])

    const setAuthAndData = async (data: MachineResponseModel) => {
        await EncryptedStorage.setItem(
            'user-token',
            JSON.stringify({
                apiKey: data.apiKey
            })
        );
        await EncryptedStorage.setItem(
            'machine',
            JSON.stringify({
                machine: data.machine
            })
        );
        await saveMachineDetails(data);
        setIsLoggedIn(true);
        // setGoToPayment(false);
        // setServiceMode(true);
    };

    async function toggleUserType() {
        // const isUserAdmin = userType == "admin";
        // setUserType(isUserAdmin ? "user" : "admin");
        // if (isUserAdmin) {
        //     await EncryptedStorage.removeItem("user-token");
        // }
    }

    async function flushCart() {
        await EncryptedStorage.removeItem("user_cart");
    }

    async function flushProducts() {
        await EncryptedStorage.removeItem("machine-details");
    }
    async function flushData() {
        await flushCart();
        await flushProducts();
    }

    async function flushToken() {
        await EncryptedStorage.removeItem("user-token");
    }

    return (
        <AuthContext.Provider
            value={{ isLoggedIn, goToPayment, userType, serviceMode, setAuthAndData, toggleUserType, flushData, flushToken, flushCart, flushProducts, setIsLoggedIn }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
