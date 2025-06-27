import EncryptedStorage from 'react-native-encrypted-storage';

const CART_KEY = 'user_cart';

export async function getStoredCart(): Promise<Record<string, number>> {
    const json = await EncryptedStorage.getItem(CART_KEY);
    return json ? JSON.parse(json) : {};
}

export async function storeCart(cart: Record<string, number>): Promise<void> {
    console.log(cart);
    await EncryptedStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export async function clearStoredCart(): Promise<void> {
    await EncryptedStorage.removeItem(CART_KEY);
}
