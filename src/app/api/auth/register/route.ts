import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: { _form: ['Email and password are required'] } },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: { _form: ['User with this email already exists'] } },
        { status: 400 }
      );
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        // In a real app, you'd store the hashed password in a separate table
        // For this example, we're not storing passwords
      }
    });

    // Create default user settings
    await prisma.userSettings.create({
      data: {
        userId: user.id,
        theme: 'light',
        language: 'en'
      }
    });

    // Generate JWT token
    const token = await generateToken(user.id, user.email);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        token
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: { _form: ['An error occurred during registration'] } },
      { status: 500 }
    );
  }
}
