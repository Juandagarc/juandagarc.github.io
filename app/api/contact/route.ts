import { NextResponse } from 'next/server';
import { addContactToNotion } from '../../../utils/notion';

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await addContactToNotion(name, email, subject, message);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
