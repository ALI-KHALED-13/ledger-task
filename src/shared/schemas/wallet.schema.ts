import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Wallet {

  @Prop({ required: true, default: 0 })
  balance: number;

  @Prop({ required: false, default: "EGP" })
  currency: string;
}

export type WalletDocument = Wallet & Document;
export const WalletSchema = SchemaFactory.createForClass(Wallet);