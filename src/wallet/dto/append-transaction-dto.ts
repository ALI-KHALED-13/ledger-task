import { IsEnum, IsNumber, IsString, IsUUID, Length } from "class-validator";
import { TransactionTypes } from "src/configs/enums";

export class appendTransactionDto {
  @IsUUID()
  transactionId: string;

  @IsEnum(TransactionTypes)
  type: string;

  @IsNumber()
  amount: number;

  @IsString()
  @Length(3, 3)
  currency: string;

}