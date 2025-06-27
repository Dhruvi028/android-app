import {Operator} from './operator.model';

export interface Company {
  id: number;
  name: string;
  location: string;
  pocName: string;
  contactNo: string;
  creditRechargeType: CreditRechargeType;
  defaultCreditAmount: number;
  cardCharges: number;
  operatorId: number;
  createdAt: Date;
  updatedAt: Date;
  operator: Operator;
}

export enum CreditRechargeType {
  AUTO = 'auto',
  SELF = 'self',
}

export interface CompanyEmployee {
  id: number;
  employeeCode: string;
  employeePin: string;
  companyId: number;
  name: string;
  costCenter: string;
  credits: number;
  createdAt: Date;
}

export interface Recharge {
  id: string;
  amount: number;
  state: RechargeState;
  companyEmployeeId: number;
  transactionId: string;
  companyId: number;
  createdAt: Date;
  updatedAt: Date;
  companyEmployee: CompanyEmployee;
  company: Company;
}
export enum RechargeState {
  INITIATED = 'initiated',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}
