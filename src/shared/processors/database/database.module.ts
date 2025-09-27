import { Global, Logger, Module, OnModuleInit } from '@nestjs/common';
import { InjectConnection, MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { TransactionManager } from './transaction-manager.service';
import { DatabaseSeeder } from './database-seeder.service';
import { Wallet, WalletSchema } from 'src/shared/schemas/wallet.schema';


let AppOdmModule: any = MongooseModule;

@Global()
@Module({
  imports: [
    AppOdmModule.forRoot('mongodb://localhost:27017/ledger'),
    MongooseModule.forFeature([
      { name: Wallet.name, schema: WalletSchema }
    ]),
  ],
  providers: [TransactionManager, DatabaseSeeder],
  exports: [AppOdmModule, TransactionManager],
})
export class DatabaseModule implements OnModuleInit {
  private readonly logger = new Logger(DatabaseModule.name);

  constructor(
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async onModuleInit() {
    try {
      const isConnected = this.connection.readyState === 1;
    if (isConnected) {
      this.logger.log('Successfully connected to MongoDB database');
    } else {
      this.logger.error('Failed to connect to MongoDB');
    }

    } catch (error) {
      this.errorExit(error);
    }
  }

  private errorExit(err?: Error) {
    const errorMessage = `Failed to connect to MongoDB: ${err}`;
    this.logger.error(errorMessage);
  }
}