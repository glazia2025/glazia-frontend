import { NextRequest, NextResponse } from 'next/server';

// Mock admin credentials (in production, this should be in a secure database)
const ADMIN_CREDENTIALS = [
  { 
    username: 'admin', 
    password: 'admin123', 
    role: 'admin',
    id: 'admin_001',
    permissions: ['orders:read', 'orders:write', 'products:read', 'products:write', 'users:read']
  },
  { 
    username: 'manager', 
    password: 'manager123', 
    role: 'manager',
    id: 'manager_001',
    permissions: ['orders:read', 'orders:write', 'products:read']
  }
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Find matching admin credentials
    const admin = ADMIN_CREDENTIALS.find(
      cred => cred.username === username && cred.password === password
    );

    if (!admin) {
      return NextResponse.json(
        { message: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Create a simple JWT-like token (in production, use proper JWT library)
    const tokenPayload = {
      id: admin.id,
      username: admin.username,
      role: admin.role,
      permissions: admin.permissions,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };

    // Base64 encode the payload (simplified JWT structure)
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify(tokenPayload));
    const signature = btoa(`signature_${Date.now()}`); // In production, use proper HMAC
    
    const token = `${header}.${payload}.${signature}`;

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        permissions: admin.permissions
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
