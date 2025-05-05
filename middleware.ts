import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';

// Export the middleware function, ensuring all routes go through it
export default function middleware(request: NextRequest) {
  // Apply the next-intl middleware to all routes
  const intlMiddleware = createMiddleware({
    locales: ['en', 'ja', 'uz'], // Update with your supported locales
    defaultLocale: 'en'
  });
  
  return intlMiddleware(request);
}

// Ensure middleware runs on all routes, including API routes
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}; 