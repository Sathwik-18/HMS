// app/api/syncUser/route.js
import { NextResponse } from 'next/server';
import { syncUserToDB } from '../../../lib/syncUser';

export async function POST(request) {
  try {
    const { clerkUserId, email, role } = await request.json();

    // Call the sync function
    await syncUserToDB({ clerkUserId, email, role });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
