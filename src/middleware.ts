 // (Later) protect routes when auth is added

 import { NextResponse, NextRequest } from 'next/server'

 // This function can be marked `async` if using `await` inside
 export function middleware(request: NextRequest) {
     return NextResponse.redirect(new URL('/login', request.url))
 }

 export const config = {
     matcher: '/games/auth',
 }