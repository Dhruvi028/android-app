import {Operator} from './operator.model';

export enum DeviceNetworkMode {
  GSM = 'gsm',
  WIFI = 'wifi',
  UNKNOWN = 'unknown',
}

export interface Device {
  id: number;
  posId: string;
  isOnline: boolean;
  lastHeartBeat: Date;
  merchantId: string;
  merchantKey: string;
  websiteName: string;
  hwVersion: string;
  swVersion: string;
  updateToSwVersion: string;
  otaTimestamp: Date;
  extraInfos: string;
  networkMode: DeviceNetworkMode;
  netwrokRssi: string;
  operatorId: number;
  operator?: Operator;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeviceOffline {
  id: number;
  deviceId: number;
  nextOnlineTime: Date;
  createdAt: Date;
  device: Device;
}

export interface DeviceFirmware {
  id: number;
  hwVersion: string;
  swVersion: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
}
