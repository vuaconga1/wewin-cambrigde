import { DataSource } from 'typeorm';
import { User } from '../src/entities/user/user.entity';
import bcrypt from 'bcrypt';

async function seedUser() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL || 'postgresql://postgres:123123@localhost:5432/wewin_db',
    entities: ['src/entities/**/*.ts'],
    synchronize: false,
    logging: false,
  });

  await dataSource.initialize();

  const userRepository = dataSource.getRepository(User);

  // Xóa user cũ nếu tồn tại (để tạo lại từ đầu)
  const existing = await userRepository.findOne({ where: { email: 'tin@gmail.com' } });
  if (existing) {
    console.log('🗑️ Removing old user...');
    await userRepository.remove(existing);
  }

  // Hash password bcrypt
  const hashedPassword = await bcrypt.hash('123123', 10);

  // Tạo user mới
  const user = userRepository.create({
    name: 'Lê Trọng Tín',
    email: 'tin@gmail.com',
    password: hashedPassword,
    phone: '0924212074',
    address: '141 điền...',
    dob: new Date('2004-01-01'),
    image: null,
    isActive: true,
    role: 1,
  });

  await userRepository.save(user);
  console.log('✅ User seeded successfully!');
  console.log(`📧 Email: tin@gmail.com`);
  console.log(`🔑 Password: 123123`);
  console.log(`🔐 Password Hash: ${hashedPassword}`);

  await dataSource.destroy();
}

seedUser().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
