import { IsEnum, IsNumber, IsString, Length } from "class-validator";
import { TransactionTypes } from "src/configs/enums";

export class appendTransactionDto {
  @IsString()
  transactionId: string;

  @IsEnum(TransactionTypes)
  type: TransactionTypes;

  @IsNumber()
  amount: number;

  @IsString()
  @Length(3, 3)
  currency: string;

}