import { Test, TestingModule } from '@nestjs/testing';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { appendTransactionDto } from './dto/append-transaction-dto';
import { TransactionTypes } from '../configs/enums';
import { UnprocessableEntityException, BadRequestException } from '@nestjs/common';

describe('WalletController', () => {
  let controller: WalletController;
  let service: WalletService;

  const mockWalletService = {
    getBalance: jest.fn(),
    appendTransaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [{ provide: WalletService, useValue: mockWalletService }],
    }).compile();

    controller = module.get<WalletController>(WalletController);
    service = module.get<WalletService>(WalletService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Balance Operations', () => {
    it('should return wallet balance', async () => {
      mockWalletService.getBalance.mockResolvedValue({ success: true, data: '500 EGP' });
      
      const result = await controller.getBalance();
      
      expect(result.data).toBe('500 EGP');
      expect(service.getBalance).toHaveBeenCalledTimes(1);
    });
  });

  describe('Transaction Operations', () => {
    it('should increase balance on deposit', async () => {
      const depositDto: appendTransactionDto = {
        transactionId: 'tx_001',
        type: TransactionTypes.DEPOSIT,
        amount: 100,
        currency: 'EGP',
      };
      
      mockWalletService.appendTransaction.mockResolvedValue({
        success: true,
        data: { transactionId: 'tx_001', amount: 100, type: TransactionTypes.DEPOSIT }
      });

      const result = await controller.appendTransaction(depositDto);
      
      expect(result.success).toBe(true);
      expect(result.data.type).toBe(TransactionTypes.DEPOSIT);
      expect(service.appendTransaction).toHaveBeenCalledWith(depositDto);
    });

    it('should decrease balance on withdrawal', async () => {
      const withdrawDto: appendTransactionDto = {
        transactionId: 'tx_002',
        type: TransactionTypes.WITHDRAW,
        amount: -50,
        currency: 'EGP',
      };

      mockWalletService.appendTransaction.mockResolvedValue({
        success: true,
        data: { transactionId: 'tx_002', amount: -50, type: TransactionTypes.WITHDRAW }
      });

      const result = await controller.appendTransaction(withdrawDto);
      
      expect(result.success).toBe(true);
      expect(result.data.type).toBe(TransactionTypes.WITHDRAW);
      expect(service.appendTransaction).toHaveBeenCalledWith(withdrawDto);
    });

    it('should fail withdrawal if balance would go negative', async () => {
      const withdrawDto: appendTransactionDto = {
        transactionId: 'tx_003',
        type: TransactionTypes.WITHDRAW,
        amount: -2000,
        currency: 'EGP',
      };

      mockWalletService.appendTransaction.mockRejectedValue(
        new UnprocessableEntityException('Balance insufficient to execute this withdraw request')
      );

      await expect(controller.appendTransaction(withdrawDto))
        .rejects.toThrow(UnprocessableEntityException);
      expect(service.appendTransaction).toHaveBeenCalledWith(withdrawDto);
    });

    it('should handle duplicate transaction IDs (idempotent)', async () => {
      const duplicateDto: appendTransactionDto = {
        transactionId: 'tx_duplicate',
        type: TransactionTypes.DEPOSIT,
        amount: 100,
        currency: 'EGP',
      };

      // Simulate database duplicate key error being thrown
      mockWalletService.appendTransaction.mockRejectedValue(
        Object.assign(new Error('Transaction ID already exists'), { code: 11000 })
      );

      await expect(controller.appendTransaction(duplicateDto)).rejects.toThrow();
      expect(service.appendTransaction).toHaveBeenCalledWith(duplicateDto);
    });

    it('should validate transaction consistency', async () => {
      const inconsistentDto: appendTransactionDto = {
        transactionId: 'tx_004',
        type: TransactionTypes.DEPOSIT,
        amount: -100, // Negative amount for deposit
        currency: 'EGP',
      };

      mockWalletService.appendTransaction.mockRejectedValue(
        new BadRequestException('transaction body is inconsistent')
      );

      await expect(controller.appendTransaction(inconsistentDto))
        .rejects.toThrow(BadRequestException);
      expect(service.appendTransaction).toHaveBeenCalledWith(inconsistentDto);
    });

    it('should handle foreign currency conversion', async () => {
      const usdDepositDto: appendTransactionDto = {
        transactionId: 'tx_usd',
        type: TransactionTypes.DEPOSIT,
        amount: 100,
        currency: 'USD',
      };

      // Mock service to return converted amount in EGP
      mockWalletService.appendTransaction.mockResolvedValue({
        success: true,
        data: { 
          transactionId: 'tx_usd', 
          amount: 2500, // Converted to EGP
          currency: 'EGP',
          originalCurrency: 'USD'
        }
      });

      const result = await controller.appendTransaction(usdDepositDto);
      
      expect(result.success).toBe(true);
      expect(result.data.amount).toBe(2500); // Converted amount
      expect(result.data.currency).toBe('EGP');
      expect(service.appendTransaction).toHaveBeenCalledWith(usdDepositDto);
    });
  });
});