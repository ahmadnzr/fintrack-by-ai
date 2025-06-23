import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create a test user
  const user = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: 'test@example.com',
      name: 'Test User',
    },
  });

  console.log(`Created user: ${user.email}`);

  // Create user settings
  await prisma.userSettings.create({
    data: {
      id: uuidv4(),
      userId: user.id,
      theme: 'light',
      language: 'en',
    },
  });

  console.log('Created user settings');

  // Create default categories
  const incomeCategories = [
    { name: 'Salary', icon: '💰' },
    { name: 'Freelance', icon: '💻' },
    { name: 'Investments', icon: '📈' },
    { name: 'Gifts', icon: '🎁' },
    { name: 'Other Income', icon: '💵' },
  ];

  const expenseCategories = [
    { name: 'Food & Dining', icon: '🍔' },
    { name: 'Transportation', icon: '🚗' },
    { name: 'Housing', icon: '🏠' },
    { name: 'Utilities', icon: '💡' },
    { name: 'Entertainment', icon: '🎬' },
    { name: 'Shopping', icon: '🛍️' },
    { name: 'Health', icon: '🏥' },
    { name: 'Education', icon: '📚' },
    { name: 'Travel', icon: '✈️' },
    { name: 'Other Expenses', icon: '📝' },
  ];

  const generalCategories = [
    { name: 'Transfers', icon: '🔄' },
    { name: 'Uncategorized', icon: '❓' },
  ];

  // Create income categories
  for (const category of incomeCategories) {
    await prisma.category.create({
      data: {
        id: uuidv4(),
        userId: user.id,
        name: category.name,
        type: 'income',
        isCustom: false,
        icon: category.icon,
      },
    });
  }

  console.log('Created income categories');

  // Create expense categories
  for (const category of expenseCategories) {
    await prisma.category.create({
      data: {
        id: uuidv4(),
        userId: user.id,
        name: category.name,
        type: 'expense',
        isCustom: false,
        icon: category.icon,
      },
    });
  }

  console.log('Created expense categories');

  // Create general categories
  for (const category of generalCategories) {
    await prisma.category.create({
      data: {
        id: uuidv4(),
        userId: user.id,
        name: category.name,
        type: 'general',
        isCustom: false,
        icon: category.icon,
      },
    });
  }

  console.log('Created general categories');

  // Get categories for transactions
  const salaryCategory = await prisma.category.findFirst({
    where: {
      userId: user.id,
      name: 'Salary',
    },
  });

  const foodCategory = await prisma.category.findFirst({
    where: {
      userId: user.id,
      name: 'Food & Dining',
    },
  });

  const transportationCategory = await prisma.category.findFirst({
    where: {
      userId: user.id,
      name: 'Transportation',
    },
  });

  const housingCategory = await prisma.category.findFirst({
    where: {
      userId: user.id,
      name: 'Housing',
    },
  });

  // Create sample transactions
  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);

  // Create income transaction
  await prisma.transaction.create({
    data: {
      id: uuidv4(),
      userId: user.id,
      date: new Date(today.getFullYear(), today.getMonth(), 1), // First day of current month
      description: 'Monthly Salary',
      amount: 5000,
      categoryId: salaryCategory!.id,
      type: 'income',
    },
  });

  // Create expense transactions
  await prisma.transaction.create({
    data: {
      id: uuidv4(),
      userId: user.id,
      date: new Date(today.getFullYear(), today.getMonth(), 5), // 5th day of current month
      description: 'Grocery Shopping',
      amount: 150,
      categoryId: foodCategory!.id,
      type: 'expense',
    },
  });

  await prisma.transaction.create({
    data: {
      id: uuidv4(),
      userId: user.id,
      date: new Date(today.getFullYear(), today.getMonth(), 10), // 10th day of current month
      description: 'Gas',
      amount: 50,
      categoryId: transportationCategory!.id,
      type: 'expense',
    },
  });

  await prisma.transaction.create({
    data: {
      id: uuidv4(),
      userId: user.id,
      date: new Date(today.getFullYear(), today.getMonth(), 15), // 15th day of current month
      description: 'Rent',
      amount: 1200,
      categoryId: housingCategory!.id,
      type: 'expense',
    },
  });

  console.log('Created sample transactions');

  // Create some tags
  const tags = ['essential', 'recurring', 'leisure'];

  for (const tagName of tags) {
    await prisma.tag.create({
      data: {
        id: uuidv4(),
        userId: user.id,
        name: tagName,
      },
    });
  }

  console.log('Created tags');

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
