import { Body, Controller, Get, Post } from '@nestjs/common';
import { appendTransactionDto } from './dto/append-transaction-dto';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {

  constructor(private walletService: WalletService){}

  @Get('balance')
  getBalance(){
    return this.walletService.getBalance()
  }

  @Post('transaction')
  appendTransaction(@Body() body: appendTransactionDto){
    return this.walletService.appendTransaction(body)
  }

}
