import { hash } from 'bcryptjs';
import { db } from './index';
import { organizations, users } from './schema';

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // Create default organization
    const [org] = await db
      .insert(organizations)
      .values({
        name: 'Demo Company',
        legalName: 'Demo Company Ltd.',
        currencyCode: 'USD',
        timezone: 'UTC',
        fiscalYearStartMonth: 1,
        isActive: true,
      })
      .returning();

    console.log('✅ Created organization:', org.name);

    // Create demo admin user
    const hashedPassword = await hash('demo123', 10);
    const [user] = await db
      .insert(users)
      .values({
        organizationId: org.id,
        firstName: 'Admin',
        lastName: 'Demo',
        email: 'admin@demo.com',
        passwordHash: hashedPassword,
        role: 'admin',
        isActive: true,
      })
      .returning();

    console.log('✅ Created user:', user.email);
    console.log('\n📧 Demo credentials:');
    console.log('Email: admin@demo.com');
    console.log('Password: demo123');
    
    console.log('\n🎉 Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();