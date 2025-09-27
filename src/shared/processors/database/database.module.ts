import { Global, Logger, Module, OnModuleInit } from '@nestjs/common';
import { InjectConnection, MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { TransactionManager } from './transaction-manager.service';
import { DatabaseSeeder } from './database-seeder.service';
import { Wallet, WalletSchema } from 'src/shared/schemas/wallet.schema';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async () => {
        let mongoUri = process.env.MONGO_URI;

        if (process.env.NODE_ENV !== 'production') { // only run it locally
          const replSet = await MongoMemoryReplSet.create({ // mongodb sessions work only with replica sets, so connecting to local Db Server would result in a failure
            replSet: { count: 1, storageEngine: 'wiredTiger' },
          });
          mongoUri = replSet.getUri('ledger');
        }

        return { uri: mongoUri };
      },
    }),
    MongooseModule.forFeature([
      { name: Wallet.name, schema: WalletSchema }
    ]),
  ],
  providers: [TransactionManager, DatabaseSeeder],
  exports: [MongooseModule, TransactionManager],
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