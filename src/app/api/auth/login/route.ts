import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: { _form: ['Email and password are required'] } },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { error: { _form: ['Invalid email or password'] } },
        { status: 401 }
      );
    }

    // In a real app, you'd verify the password against a stored hash
    // For this example, we're skipping password verification
    // const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
    // if (!isPasswordValid) {
    //   return NextResponse.json(
    //     { error: { _form: ['Invalid email or password'] } },
    //     { status: 401 }
    //   );
    // }

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
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: { _form: ['An error occurred during login'] } },
      { status: 500 }
    );
  }
}
