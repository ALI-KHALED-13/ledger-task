import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TransactionTypes } from '../../configs/enums';


@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true, unique: true, immutable: true})
  transactionId: string;

  @Prop({ 
    required: true, 
    enum: TransactionTypes,
    type: String,
    immutable: true
  })
  type: TransactionTypes;

  @Prop({ required: true, min: 0, immutable: true})
  amount: number;

  @Prop({ 
    required: true,
    length: 3,
    uppercase: true,
    enum: "EGP",
    immutable: true
  })
  currency: string;

  @Prop({ required: false, default: "EGP", immutable: true}) // not required by task but i think it would be useful for statistic
  originalCurrency: string;
}

export type TransactionDocument = Transaction & Document;
export const TransactionSchema = SchemaFactory.createForClass(Transaction);