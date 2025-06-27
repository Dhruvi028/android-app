import { create } from 'zustand';

type State = {
    isLoggedIn: boolean;
    goToPayment: boolean;
    userType: String;
    setLoggedIn: (value: boolean) => void;
    setGoToPayment: (value: boolean) => void;
    cart: any;
    cartDetails: any;
    setCart: (value: any) => void;
    setCartDetails: (value: any) => void;
    setUserType: (value: any) => void;
    usbSerialPort: any;
    setUsbSerialPort: (value: any) => void;
    usbDevices: any;
    setUsbDevices: (value: any) => void;
    pollIntervalRef: any;
    setPollIntervalRef: (value: any) => void;
    data: any;
    setData: (value: any) => void;
};

export const useStore = create<State>((set) => ({
    isLoggedIn: false,
    goToPayment: false,
    userType: "user",
    cart: {},
    cartDetails: [],
    usbSerialPort: null,
    usbDevices: [],
    pollIntervalRef: null,
    data: {},
    setLoggedIn: (value) => set({ isLoggedIn: value }),
    setGoToPayment: (value) => set({ goToPayment: value }),
    setCart: (value) => set({ cart: value }),
    setCartDetails: (value) => {
        if (Array.isArray(value)) {
            set({ cartDetails: value });
        }
        else {
            console.log("=======================", value);
        }
    },
    setUserType: (value) => { set({ userType: value }) },
    setUsbSerialPort: (value) => { set({ usbSerialPort: value }) },
    setUsbDevices: (value) => { set({ usbDevices: value }) },
    setPollIntervalRef: (value) => { set({ pollIntervalRef: value }) },
    setData: (value) => { set({ data: value }) }
}));
