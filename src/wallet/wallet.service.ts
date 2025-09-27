import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { appendTransactionDto } from './dto/append-transaction-dto';
import { TransactionManager } from '../shared/processors/database/transaction-manager.service';
import { WalletRepository } from './wallet.repository';
import { TransactionTypes } from '../configs/enums';

@Injectable()
export class WalletService {
  constructor(
    private readonly transactionManager: TransactionManager,
    private readonly walletRepository: WalletRepository,
  ) {}
  
  async getBalance(){
    const wallet = await this.walletRepository.getDefaultWallet();
    if (!wallet){
      throw new NotFoundException("not found wallet, make sure seeding step took place")
    }
    return {success: true, data: (wallet.balance + " " + wallet.currency)};
  }

  async getAllTransactions(){
    return {
      success: true,
      data: await this.walletRepository.getAllTransactions()
    }
  }

  // AI sugessted @WithTransaction() decorator here for cleaner code and isolation of session managment logic, but not gonna add it since I didn't recognize this pattern before, it's interesting tho
  async appendTransaction(body: appendTransactionDto){
    const {transactionId, type, amount, currency: originalCurrency} = body;

    if (
      type === TransactionTypes.DEPOSIT && amount < 0 ||
      type === TransactionTypes.WITHDRAW && amount > 0
    ) { // to be future proof in case req body logic changes
      throw new BadRequestException("transaction body is inconsistent")
    }

    let EGPAmount = amount;

    if (originalCurrency !== "EGP") {
      let exchangeRate = 0.04; // some base xchange rate, EGP is not doing well
      const exchangeRateResp = await fetch("https://v6.exchangerate-api.com/v6/2618b005f15b5f68f6c7cda8/latest/EGP", {headers: {"Content-Type": "application/JSON"}});
      if (exchangeRateResp.ok){
        const exchangeRateObj = await exchangeRateResp.json();  
        exchangeRate = (exchangeRateObj.result === "success" && exchangeRateObj.conversion_rates?.[originalCurrency]) || exchangeRate
      }
      EGPAmount = amount / exchangeRate;
    }

    const session = await this.transactionManager.startTransaction();
    try {
      const wallet = await this.walletRepository.getDefaultWallet(session);
      if (!wallet){
        throw new NotFoundException("Not found wallet, make sure seeding step took place")
      }
      const wouldBalanceGoNegative =  type === TransactionTypes.WITHDRAW && (wallet.balance + EGPAmount) < 0;
      if (wouldBalanceGoNegative){
        throw new UnprocessableEntityException("Balance insufficient to exeute this withdraw request")
      }

      const createdTransaction = await this.walletRepository.appendTransaction({
        transactionId,
        amount: +(EGPAmount.toFixed(2)), // to avoid percision problems
        type,
        originalCurrency,
        currency: "EGP",
      }, session);

      await this.walletRepository.updateWalletBalance(
        +(wallet.balance + EGPAmount).toFixed(2), // to avoid percision problems
        session
      )

      await this.transactionManager.commitTransaction(session)

      return {success: true, data: createdTransaction} 
    } catch(err){
      await this.transactionManager.rollbackTransaction(session);
      console.error(err) // sentry or logging service
      throw  err
    }finally {
      await this.transactionManager.releaseTransaction(session);
    }
  }

}
