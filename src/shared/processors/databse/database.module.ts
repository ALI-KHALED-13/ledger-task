import { Global, Logger, Module, OnModuleInit } from '@nestjs/common';
import { InjectConnection, MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { TransactionManager } from './transaction-manager.service';


let AppOdmModule: any = MongooseModule;

@Global()
@Module({
  imports: [
    AppOdmModule.forRoot('mongodb://localhost:27017/ledger'),
  ],
  providers: [TransactionManager],
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