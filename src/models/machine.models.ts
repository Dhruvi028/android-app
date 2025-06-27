import { Device } from './device.model';
import { Product } from './product.model';

export interface MachineLayout {
  id: number;
  rowCount: number;
  colCountByRows: {
    [key: string]: number;
  };
  name: string;
}

export interface MachineDetail {
  id: number;
  rowNumber: number;
  columnNumber: number;
  quantity: number;
  selectionCode: number;
  status: boolean;
  product: Product;
}

export interface MachineResponse {
  apiKey: string;
  machine: Machine;
  products: []
}

export interface Machine {
  id: number;
  name: string;
  machineCode: string;
  status: boolean;
  cashlessDeviceStatus: boolean;
  statusMessage: string;
  machineLayoutId: number;
  machineLayout?: MachineLayout;
  machineDetails: MachineDetail[];
  operatorId: number;
  deviceId: number;
  device?: Device;
  tabUniqueId: string;
  appApiKey: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
}

export interface MachineMetadata {
  id: number;
  name: string;
  machineCode: string;
  device: { posId: string; id: number; isOnline: boolean };
  status: boolean;
}
