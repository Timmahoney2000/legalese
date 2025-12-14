import { NextResponse } from 'next/server';
import { processDocument, validateFile } from '@/lib/document';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }
    
    // Process document
    const documentContent = await processDocument(file);
    
    return NextResponse.json({
      success: true,
      document: documentContent,
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process document' },
      { status: 500 }
    );
  }
}