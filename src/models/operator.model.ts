import {User} from './user.model';

export interface Operator {
  id: number;
  operatorCode: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  employee: User[];
}
