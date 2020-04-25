import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';

import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoriesRepositories = getRepository(Category);

    const { total } = await transactionRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('Insufficient balance for transaction!');
    }

    let findCategory = await categoriesRepositories.findOne({
      where: { title: category },
    });

    if (!findCategory) {
      findCategory = categoriesRepositories.create({
        title: category,
      });

      await categoriesRepositories.save(findCategory);
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category: findCategory,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
