import { DataSource } from 'typeorm';
import { Role } from '../src/entities/role/role.entity';
import { Permission } from '../src/entities/role/permission.entity';
import { User } from '../src/entities/user/user.entity';

async function check() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL || 'postgresql://postgres:123123@localhost:5432/wewin_db',
    entities: ['src/entities/**/*.ts'],
    synchronize: false,
  });
  
  await dataSource.initialize();
  
  const roleRepo = dataSource.getRepository(Role);
  const permRepo = dataSource.getRepository(Permission);
  const userRepo = dataSource.getRepository(User);
  
  const roles = await roleRepo.find({ relations: ['permissions'] });
  const permissions = await permRepo.find();
  const user = await userRepo.findOne({ 
    where: { email: 'tin@gmail.com' },
    relations: ['roles']
  });
  
  console.log('=== ROLES ===');
  if (roles.length === 0) {
    console.log('Không có role nào trong database');
  } else {
    roles.forEach(r => {
      console.log(`- ${r.name} (ID: ${r.id.substring(0, 8)}...)`);
      console.log(`  Permissions: ${r.permissions.map(p => p.name).join(', ')}`);
    });
  }
  
  console.log('\n=== PERMISSIONS ===');
  if (permissions.length === 0) {
    console.log('Không có permission nào trong database');
  } else {
    permissions.forEach(p => console.log(`- ${p.name}`));
  }
  
  console.log('\n=== USER TIN ===');
  if (user) {
    console.log(`Name: ${user.name}`);
    console.log(`Roles: ${user.roles && user.roles.length > 0 ? user.roles.map(r => r.name).join(', ') : 'Chưa assign role nào'}`);
  }
  
  await dataSource.destroy();
}

check();
