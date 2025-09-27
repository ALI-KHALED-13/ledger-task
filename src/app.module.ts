import { Module } from '@nestjs/common';

import { WalletModule } from './wallet/wallet.module';
import { DatabaseModule } from './shared/processors/database/database.module';

@Module({
  imports: [WalletModule, DatabaseModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
