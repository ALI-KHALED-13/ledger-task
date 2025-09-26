import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WalletModule } from './wallet/wallet.module';
import { DatabaseModule } from './shared/processors/databse/database.module';

@Module({
  imports: [WalletModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
