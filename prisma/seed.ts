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

  // Create facilities for room booking system
  const facilities = [
    { name: 'Projector', description: 'HD projector for presentations', icon: 'projector' },
    { name: 'Whiteboard', description: 'Large whiteboard for brainstorming', icon: 'whiteboard' },
    { name: 'Video Conference', description: 'Video conferencing equipment', icon: 'video-camera' },
    { name: 'Air Conditioning', description: 'Climate control system', icon: 'snowflake' },
    { name: 'WiFi', description: 'High-speed wireless internet', icon: 'wifi' },
    { name: 'Sound System', description: 'Audio equipment for presentations', icon: 'volume-up' },
  ];

  const createdFacilities = [];
  for (const facility of facilities) {
    const createdFacility = await prisma.facility.create({
      data: {
        id: uuidv4(),
        name: facility.name,
        description: facility.description,
        icon: facility.icon,
      },
    });
    createdFacilities.push(createdFacility);
  }

  console.log('Created facilities');

  // Create rooms
  const rooms = [
    {
      name: 'Conference Room A',
      description: 'Large conference room for important meetings',
      capacity: 20,
      location: 'Floor 2, East Wing',
      facilityIds: [createdFacilities[0].id, createdFacilities[1].id, createdFacilities[2].id, createdFacilities[3].id, createdFacilities[4].id],
    },
    {
      name: 'Meeting Room B',
      description: 'Medium-sized meeting room for team discussions',
      capacity: 10,
      location: 'Floor 1, West Wing',
      facilityIds: [createdFacilities[1].id, createdFacilities[3].id, createdFacilities[4].id],
    },
    {
      name: 'Small Meeting Room C',
      description: 'Cozy room for small team meetings',
      capacity: 6,
      location: 'Floor 1, East Wing',
      facilityIds: [createdFacilities[1].id, createdFacilities[4].id],
    },
    {
      name: 'Training Room D',
      description: 'Large training room with presentation equipment',
      capacity: 30,
      location: 'Floor 3, Central',
      facilityIds: [createdFacilities[0].id, createdFacilities[1].id, createdFacilities[3].id, createdFacilities[4].id, createdFacilities[5].id],
    },
  ];

  const createdRooms = [];
  for (const room of rooms) {
    const createdRoom = await prisma.room.create({
      data: {
        id: uuidv4(),
        name: room.name,
        description: room.description,
        capacity: room.capacity,
        location: room.location,
        status: 'available',
        facilities: {
          create: room.facilityIds.map(facilityId => ({
            facilityId,
          })),
        },
      },
    });
    createdRooms.push(createdRoom);
  }

  console.log('Created rooms');

  // Create sample bookings
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  // Create a confirmed booking for tomorrow
  await prisma.booking.create({
    data: {
      id: uuidv4(),
      userId: user.id,
      roomId: createdRooms[0].id,
      startTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 9, 0, 0),
      endTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 11, 0, 0),
      purpose: 'Weekly team standup meeting',
      status: 'confirmed',
    },
  });

  // Update room status to booked
  await prisma.room.update({
    where: { id: createdRooms[0].id },
    data: { status: 'booked' },
  });

  // Create a pending booking for next week
  await prisma.booking.create({
    data: {
      id: uuidv4(),
      userId: user.id,
      roomId: createdRooms[1].id,
      startTime: new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 14, 0, 0),
      endTime: new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 16, 0, 0),
      purpose: 'Client presentation for Q1 results',
      status: 'pending',
    },
  });

  console.log('Created sample bookings');

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
