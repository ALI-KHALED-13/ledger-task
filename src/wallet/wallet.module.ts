import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Transaction, TransactionSchema } from 'src/shared/schemas/transaction.schema';
import { Wallet, WalletSchema } from 'src/shared/schemas/wallet.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: Wallet.name, schema: WalletSchema}
    ])
  ],
  controllers: [WalletController],
  providers: [WalletService]
})
export class WalletModule {}
