import {UserRole} from '../enum/user-roles.enum';
import {Operator} from '../models/operator.model';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  number: string;
  token: string;
  role: UserRole;
  operator: Operator;
  operatorId: number;
  createdAt: Date;
}
