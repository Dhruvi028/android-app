import {Machine} from './machine.models';
import {Operator} from './operator.model';

export interface Sales {
  id: number;
  paytmTotal: number;
  paytmRefund: number;
  creditTotal: number;
  creditRefund: number;
  cashTotal: number;
  dateIst: Date;
  statusCountStr: string;
  statusCount: SalesStatusCount;
  machineId: number;
  operatorId: number;
  createdAt: Date;
  updatedAt: Date;
  machine: Machine;
  operator: Operator;
}

export interface SalesStatusCount {
  received: number;
  accepted: number;
  complete: number;
  timeout: number;
  failed: number;
  offline: number;
}
