import { Injectable } from '@nestjs/common';
import { appendTransactionDto } from './dto/append-transaction-dto';

@Injectable()
export class WalletService {

  async getBalance(){
    return 0;
  }

  async appendTransaction(body: appendTransactionDto){
    const exchangeRateResp = await fetch("https://v6.exchangerate-api.com/v6/2618b005f15b5f68f6c7cda8/latest/EGP", {headers: {"Content-Type": "application/JSON"}});
    return 'new transaction added or otherwise'
  }

}
