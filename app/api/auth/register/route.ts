import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '@/lib/db';
import { organizations, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, password } = await request.json();

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Create or get default organization
    let org;
    const existingOrg = await db
      .select()
      .from(organizations)
      .where(eq(organizations.name, 'Demo Company'))
      .limit(1);

    if (existingOrg.length > 0) {
      org = existingOrg[0];
    } else {
      const [newOrg] = await db
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
      org = newOrg;
    }

    // Hash password and create user
    const hashedPassword = await hash(password, 10);
    const [newUser] = await db
      .insert(users)
      .values({
        organizationId: org.id,
        firstName,
        lastName,
        email,
        passwordHash: hashedPassword,
        role: 'user',
        isActive: true,
      })
      .returning();

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: `${newUser.firstName} ${newUser.lastName}`,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}