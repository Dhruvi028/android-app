import {Machine} from './machine.models';

export interface Order {
  idx?: number;
  id: string;
  orderState: OrderState;
  amount: number;
  refundAmount: number;
  orderDetails: OrderDetail[];
  payment: Payment;
  refund: Refund[];
  machine: Machine;
  machineId: number;
  posId: string;
  orderType: OrderType;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderDetail {
  id: number;
  price: number;
  status: OrderDetailStatus;
  productName: string;
  orderId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: number;
  resultCode: string;
  resultMsg: string;
  resultStatus: string;
  txnId: string;
  txnRefundId: string;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Refund {
  id: string;
  refundId: number;
  amount: number;
  resultCode: string;
  resultMsg: string;
  resultStatus: string;
  createdAt: string;
  updatedAt: string;
}

export enum PaymentStatus {
  SUCCESS = 'success',
  REFUND = 'refund',
  FAILED = 'failed',
  PROCESSING = 'processing',
}

export enum OrderDetailStatus {
  QUEUED = 'queued',
  SUCCESS = 'success',
  FAIL = 'fail',
}

export enum OrderState {
  RECEIVED = 'received',
  ACCEPTED = 'accepted',
  COMPLETE = 'complete',
  TIMEOUT = 'timeout',
  FAILED = 'failed',
  OFFLINE = 'offline',
}

export enum OrderType {
  CASH = 'cash',
  PAYTM = 'paytm',
  CREDIT = 'credit',
}
