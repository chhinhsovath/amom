import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '@/lib/db';
import { organizations, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    // Check if demo user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, 'admin@demo.com'))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({
        message: 'Demo user already exists',
        email: 'admin@demo.com',
      });
    }

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

    return NextResponse.json({
      message: 'Seed data created successfully',
      organization: org.name,
      user: {
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
      },
      credentials: {
        email: 'admin@demo.com',
        password: 'demo123',
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to create seed data', details: error },
      { status: 500 }
    );
  }
}