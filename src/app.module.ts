import { Module } from '@nestjs/common';

import { WalletModule } from './wallet/wallet.module';
import { DatabaseModule } from './shared/processors/database/database.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 50,  // 50 requests per minute
      },
    ]),
    WalletModule,
    DatabaseModule
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
