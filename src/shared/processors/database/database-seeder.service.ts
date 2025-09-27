import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Wallet, WalletDocument } from 'src/shared/schemas/wallet.schema';



Injectable()
export class DatabaseSeeder implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSeeder.name);

  constructor(
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
  ) {}

  async onModuleInit() {
    await this.seedWallets();
  }

  private async seedWallets() {
    try {
      const walletCount = await this.walletModel.countDocuments();
      
      if (walletCount === 0) {
        const defaultWallet = new this.walletModel({
          balance: 500, // Starting balance
        });
        
        await defaultWallet.save();
        this.logger.log('Default wallet created with balance: 500');
      } else {
        this.logger.log(`Wallet collection already has ${walletCount} wallets - skipping seed`);
      }
    } catch (error) {
      this.logger.error('Failed to seed wallets:', error);
    }
  }
}