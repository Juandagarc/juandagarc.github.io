import { NextResponse } from 'next/server';
import { getProjectsFromNotion } from '../../../utils/notion';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const projects = await getProjectsFromNotion();
    return NextResponse.json({ projects });
  } catch (error) {
    return NextResponse.json({ projects: [] }, { status: 500 });
  }
}
