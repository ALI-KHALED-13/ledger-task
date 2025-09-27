import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ISessionManager } from "../shared/processors/database/transaction-manager.service";
import { Transaction, TransactionDocument } from "../shared/schemas/transaction.schema";
import { Wallet, WalletDocument } from "../shared/schemas/wallet.schema";
import { Injectable } from "@nestjs/common";
import { appendTransactionDto } from "./dto/append-transaction-dto";


// Repository wrapper around DB operations; dependency inversion
@Injectable()
export class WalletRepository {

  constructor(
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
     @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
  ){
  }

  async getDefaultWallet(session?: ISessionManager){
    const wallet = await this.walletModel.findOne({}, null, {session}) // real-world implmentation would require id but here we have only one wallet as per task
    return wallet;
  }

  async updateWalletBalance(newBalance: number, session?: ISessionManager){
    await this.walletModel.findOneAndUpdate({}, {balance: newBalance}, {session})
  }

  async appendTransaction(body: appendTransactionDto & {originalCurrency: string;}, session?: ISessionManager){
    const transaction = await new this.transactionModel(body);
    await transaction.save({session})
    return transaction;
  }


}