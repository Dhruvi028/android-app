import {Machine} from './machine.models';
import {Product} from './product.model';
import {User} from './user.model';

export interface Warehouse {
  id: number;
  name: string;
  location: string;
  createdAt: string;
}

export interface Inventory {
  id: number;
  quantity: number;
  productId: number;
  warehouseId: number;
  createdAt: Date;
  updatedAt: Date;
  product: Product;
  warehouse: Warehouse;
}

export interface Inbound {
  id: string;
  invNo: string;
  employeeId: number;
  warehouseId: number;
  inboundType: InboundType;
  inbountDetails: InboundDetail[];
  employee: User;
  warehouse: Warehouse;
  createdAt: Date;
  updatedAt: Date;
}

export interface InboundDetail {
  id: number;
  quantity: number;
  productId: number;
  inboundId: string;
  product: Product;
  inbound: Inbound;
  createdAt: Date;
  updatedAt: Date;
}

export enum InboundType {
  D2W,
  W2W,
  M2W,
}

export interface Outbound {
  id: string;
  employeeId: number;
  warehouseId: number;
  outboundType: OutboundType;
  remark: string;
  machineId: number;
  createdAt: Date;
  updatedAt: Date;
  outboundDetails: OutboundDetail[];
  machine: Machine;
  employee: User;
  warehouse: Warehouse;
}

export interface OutboundDetail {
  id: number;
  quantity: number;
  productId: number;
  outboundId: string;
  createdAt: Date;
  updatedAt: Date;
  product: Product;
  outbound: Outbound;
}

export enum OutboundType {
  W2M,
  W2D,
}
