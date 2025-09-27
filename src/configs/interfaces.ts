import { TransactionTypes } from "./enums";


export interface ITransaction {
  transactionId: string;
  amount: number;
  type: TransactionTypes;
  currency: string;
  originalCurrency?: string;
}

export interface IBaseRepository<T> {
  create(data: Partial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  findAll(filter?: any): Promise<T[]>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  findOne(filter: any): Promise<T | null>;
}