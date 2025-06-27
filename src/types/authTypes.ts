export type UserType = 'admin' | 'user';

export interface AuthData {
    userType: UserType;
    goToPayment: boolean;
    timestamp: number;
}

export interface ApiKeyData {
    apiKey: string;
    timestamp: number;
}

export interface AppAuthState {
    isLoggedIn: boolean;
    userType: UserType;
    goToPayment: boolean;
    serviceMode: boolean;
}