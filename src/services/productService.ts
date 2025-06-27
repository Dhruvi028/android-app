import EncryptedStorage from 'react-native-encrypted-storage';
import dataJson from '../data/model.json';
import { MachineResponse } from '../models/machine.models';
import axios from 'axios';
import { envConfig } from '../config/environment';

type ProductInSlot = {
    id: number;
    productCode: string;
    name: string;
    imageUrl: string;
    mrp: number;
    sellingPrice: number;
    measure: number;
    unit: string;
    type: string;
    status: boolean;
    rowNumber: number;
    columnNumber: number;
    quantity: number;
    slotStatus: boolean;
    machineDetailId: number;
};

type MachineGrid = (ProductInSlot | null)[][];

type MachineDetailsResult = {
    data: any;
    isErrorButNotUnauthorized: boolean;
}

export const saveMachineDetails = async (data: MachineResponse): Promise<void> => {
    try {
        await EncryptedStorage.setItem('machine-details', JSON.stringify(data));
    } catch (error) {
        console.error(`[EncryptedStorage] Failed to store machine-details:`, error);
    }
};

export const getMachineDetails = async (): Promise<MachineDetailsResult | null> => {
    var result = {
        data: null,
        isErrorButNotUnauthorized: false,
    };
    try {
        // const result = await EncryptedStorage.getItem('machine-details');
        let storedUser: any = await EncryptedStorage.getItem('user-token');
        if (!storedUser) {
            return result;
        }
        storedUser = JSON.parse(storedUser);
        if (!storedUser.apiKey) {
            return result;
        }
        const machineResultBuffer: any = await EncryptedStorage.getItem('machine');
        const machineResult = JSON.parse(machineResultBuffer);
        const machineCode = machineResult['machine']['machineCode'];

        if (!machineResultBuffer) {
            return result;
        }
        await axios.get(`${envConfig.BACKEND_URL}/machine/${machineCode}/details`, {
            headers: {
                'api-key': `AppApiKey ${storedUser.apiKey}`,
            },
        })
            .then((res) => {
                result.data = res.data;
            })
            .catch((err) => {
                console.log(err);
                if (err.status !== 401) {
                    result.isErrorButNotUnauthorized = true;
                }
            })
        return result;
    } catch (error) {
        console.log(error);
        // console.error(`[EncryptedStorage] Failed to store machine-details:`, error);
        return result;
    }
};

export async function getProductsInRows(serviceMode: boolean = false): Promise<{
    productsInRows: MachineGrid;
    machineMeta: any;
    isErrorButNotUnauthorized: boolean
} | null> {
    const productsInRows: MachineGrid = [];
    var result = await getMachineDetails();
    if (result?.isErrorButNotUnauthorized || !result?.data) {
        return {
            productsInRows: productsInRows,
            machineMeta: null,
            isErrorButNotUnauthorized: result?.isErrorButNotUnauthorized ? true : false
        }
    }
    const data = result?.data;

    var machine = data?.machine;
    var productList = data?.products;

    const productMap: Record<number, any> = {};
    productList.forEach((product: any) => {
        productMap[product.id] = product;
    });

    const rowCount = machine.machineLayout.rowCount;
    const colCounts = JSON.parse(machine.machineLayout.colCountByRows);

    for (let i = 1; i <= rowCount; i++) {
        const colCount = colCounts[i];
        const row: (ProductInSlot | null)[] = [];
        for (let j = 0; j < colCount; j++) {
            row.push(null);
        }
        productsInRows.push(row);
    }

    for (const detail of machine.machineDetails) {
        const rowIdx = detail.rowNumber - 1;
        const colIdx = detail.columnNumber - 1;
        const prod = detail.product?.id ? productMap[detail.product.id] : null;

        if (prod) {
            const structuredProduct: ProductInSlot = {
                ...prod,
                rowNumber: detail.rowNumber,
                columnNumber: detail.columnNumber,
                quantity: detail.quantity,
                slotStatus: detail.status,
                machineDetailId: detail.id,
            };
            productsInRows[rowIdx][colIdx] = structuredProduct;
        } else {
            if (serviceMode) {
                productsInRows[rowIdx][colIdx] = null;
            } else {
                productsInRows[rowIdx][colIdx] = undefined as any;
            }
        }
    }

    if (!serviceMode) {
        for (let i = 0; i < productsInRows.length; i++) {
            productsInRows[i] = productsInRows[i].filter((item) => item !== undefined);
        }
    }

    return {
        productsInRows,
        machineMeta: {
            layout: machine.machineLayout,
            machineId: machine.id,
            name: machine.name,
            status: machine.status,
            operationMode: machine.operationMode,
        },
        isErrorButNotUnauthorized: false
    };
}

