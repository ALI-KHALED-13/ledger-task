import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TransactionTypes } from 'src/configs/enums';


@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true, unique: true })
  transactionId: string;

  @Prop({ 
    required: true, 
    enum: TransactionTypes,
    type: String
  })
  type: TransactionTypes;

  @Prop({ required: true })
  amount: number;

  @Prop({ 
    required: true,
    length: 3,
    uppercase: true,
    enum: "EGP"
  })
  currency: string;
}

export type TransactionDocument = Transaction & Document;
export const TransactionSchema = SchemaFactory.createForClass(Transaction);