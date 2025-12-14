import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export interface DocumentContent {
  text: string;
  fileName: string;
  fileType: string;
}

export async function processPDF(buffer: Buffer, fileName: string): Promise<DocumentContent> {
  try {
    const data = await pdfParse(buffer);
    
    return {
      text: data.text,
      fileName,
      fileType: 'pdf',
    };
  } catch (error) {
    throw new Error(`Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function processDOCX(buffer: Buffer, fileName: string): Promise<DocumentContent> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    
    return {
      text: result.value,
      fileName,
      fileType: 'docx',
    };
  } catch (error) {
    throw new Error(`Failed to process DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function processTXT(buffer: Buffer, fileName: string): Promise<DocumentContent> {
  try {
    const text = buffer.toString('utf-8');
    
    return {
      text,
      fileName,
      fileType: 'txt',
    };
  } catch (error) {
    throw new Error(`Failed to process TXT: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function processDocument(file: File): Promise<DocumentContent> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = file.name;
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return processPDF(buffer, fileName);
    case 'docx':
    case 'doc':
      return processDOCX(buffer, fileName);
    case 'txt':
      return processTXT(buffer, fileName);
    default:
      throw new Error(`Unsupported file type: ${extension}`);
  }
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }
  
  if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|docx?|txt)$/i)) {
    return { valid: false, error: 'Only PDF, DOCX, and TXT files are supported' };
  }
  
  return { valid: true };
}