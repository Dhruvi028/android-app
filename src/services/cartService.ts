import { getStoredCart, storeCart } from './cartStorageService';
type Cart = Record<string, number>;

export function updateCart(
    cart: Cart,
    row: number,
    column: number,
    type: 1 | -1
): Cart {
    const key = `${row}${column}`;
    const updatedCart = { ...cart };

    if (type === 1) {
        updatedCart[key] = (updatedCart[key] || 0) + 1;
    } else if (type === -1 && updatedCart[key]) {
        updatedCart[key] = Math.max(updatedCart[key] - 1, 0);
    }

    if (updatedCart[key] === 0) delete updatedCart[key];
    return updatedCart;
}

export function extractCartDetails(cart: Cart, productsInRows: any[][]): any[] {
    try {
        const cartDetails = [];

        for (const key in cart) {
            const [row, col] = key.split('').map(Number);
            const product = productsInRows[row - 1]?.[col - 1];
            if (product && cart[key] > 0) {
                cartDetails.push({ ...product, count: cart[key] });
            }
        }

        return cartDetails;
    } catch (err: any) {
        console.log(err);
        return [];
    }
}

export async function updateCartAndStore(
    row: number,
    column: number,
    type: 1 | -1,
    currentCart: Record<string, number>
) {
    const key = `${row}${column}`;
    const updatedCart = { ...currentCart };

    if (type === 1) {
        updatedCart[key] = (updatedCart[key] || 0) + 1;
    } else if (type === -1 && updatedCart[key]) {
        updatedCart[key] = Math.max(updatedCart[key] - 1, 0);
    }

    if (updatedCart[key] === 0) delete updatedCart[key];
    await storeCart(updatedCart);

    return updatedCart;
}
