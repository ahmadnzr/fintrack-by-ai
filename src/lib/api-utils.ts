import { NextResponse } from 'next/server';

export function successResponse(data: any, status = 200) {
  return NextResponse.json({
    success: true,
    data
  }, { status });
}

export function errorResponse(message: string | string[], status = 400) {
  const formattedError = typeof message === 'string' 
    ? { message } 
    : { _form: message };
  
  return NextResponse.json({
    error: formattedError
  }, { status });
}

export function paginatedResponse(data: any[], total: number, page: number, limit: number) {
  const pages = Math.ceil(total / limit);
  
  return NextResponse.json({
    data,
    pagination: {
      total,
      pages,
      currentPage: page,
      limit
    }
  });
}
