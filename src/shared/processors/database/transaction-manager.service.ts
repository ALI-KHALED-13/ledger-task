import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, ClientSession } from 'mongoose';

export interface ISessionManager extends ClientSession {}

@Injectable()
export class TransactionManager {
  constructor(
    @InjectConnection() private readonly connection: Connection
  ) {}


  async startTransaction(): Promise<ISessionManager> {
    const session = await this.connection.startSession();
    session.startTransaction();
    return session;
  }


  async commitTransaction(session: ISessionManager): Promise<void> {
    await session.commitTransaction();
    await session.endSession();
  }

  async rollbackTransaction(session: ISessionManager): Promise<void> {
    await session.abortTransaction();
    await session.endSession();
  }

  async releaseTransaction(session: ISessionManager): Promise<void> {
    await session.endSession();
  }
}