import { Injectable } from '@nestjs/common';
import { appendTransactionDto } from './dto/append-transaction-dto';
import { TransactionManager } from 'src/shared/processors/databse/transaction-manager.service';

@Injectable()
export class WalletService {
  constructor(
    private readonly transactionManager: TransactionManager,
    /* private readonly walletRepository: WalletRepository,
    private readonly transactionRepository: TransactionRepository, */
  ) {}
  
  async getBalance(){
    return 0;
  }

  async appendTransaction(body: appendTransactionDto){
    const {type, amount, currency} = body;

    let EGPAmount = amount;

    if (currency !== "EGP") {
      let exchangeRate = 50; // some base xchange rate, EGP is not doing good
      const exchangeRateResp = await fetch("https://v6.exchangerate-api.com/v6/2618b005f15b5f68f6c7cda8/latest/EGP", {headers: {"Content-Type": "application/JSON"}});
      if (exchangeRateResp.ok){
        const exchangeRateObj = await exchangeRateResp.json();  
        exchangeRate = (exchangeRateObj.result === "success" && exchangeRateObj.conversion_rates?.[currency]) || 50
      }
      EGPAmount = amount * exchangeRate;
    }

    const session = await this.transactionManager.startTransaction();
    try {
      // check if transactionId is already added to db, if yes throw an error
      // get user wallet
      // check type withdrawl vs deposit (and amount +ve or -ve as task not clear what would be the way to determin)
      // if deposit just add
      // if withdrawl you gotta check for insuffiecent balance first, no suffiecient throw an error
      // add transaction
      // update balance

    } catch(err){
      await this.transactionManager.rollbackTransaction(session);

      throw new err
    }finally {
      await this.transactionManager.releaseTransaction(session);
    }
    
    return 'new transaction added or otherwise'
  }

}
