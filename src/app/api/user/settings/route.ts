import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest, unauthorized } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  // Authenticate request
  const user = await authenticateRequest(req);
  if (!user) return unauthorized();

  // Get user settings
  const settings = await prisma.userSettings.findUnique({
    where: {
      userId: user.id,
    },
  });

  if (!settings) {
    // Create default settings if they don't exist
    const defaultSettings = await prisma.userSettings.create({
      data: {
        userId: user.id,
        theme: 'light',
        language: 'en',
      },
    });
    return successResponse(defaultSettings);
  }

  return successResponse(settings);
}

export async function PUT(req: NextRequest) {
  // Authenticate request
  const user = await authenticateRequest(req);
  if (!user) return unauthorized();

  try {
    const body = await req.json();
    const { theme, language } = body;

    // Validate theme
    if (theme && !['light', 'dark'].includes(theme)) {
      return errorResponse(['Invalid theme value']);
    }

    // Validate language
    if (language && !['en', 'id', 'es'].includes(language)) {
      return errorResponse(['Invalid language value']);
    }

    // Update or create settings
    const settings = await prisma.userSettings.upsert({
      where: {
        userId: user.id,
      },
      update: {
        theme: theme || undefined,
        language: language || undefined,
      },
      create: {
        userId: user.id,
        theme: theme || 'light',
        language: language || 'en',
      },
    });

    return successResponse(settings);
  } catch (error) {
    console.error('Error updating user settings:', error);
    return errorResponse(['An error occurred while updating user settings'], 500);
  }
}
