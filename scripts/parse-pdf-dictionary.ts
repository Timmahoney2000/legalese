import * as fs from 'fs';
import * as path from 'path';
import pdfParse from 'pdf-parse';

interface DictionaryEntry {
  term: string;
  definition: string;
  category?: string;
}

async function parsePDFDictionary() {
  console.log('📚 Starting Black\'s Law Dictionary PDF parsing...\n');

  // Path to your PDF
  const pdfPath = path.join(process.cwd(), 'data', 'blacks-law-dictionary.pdf');
  
  if (!fs.existsSync(pdfPath)) {
    console.error(`❌ PDF not found at: ${pdfPath}`);
    console.log('\n📝 Please place your Black\'s Law Dictionary PDF at:');
    console.log('   data/blacks-law-dictionary.pdf');
    process.exit(1);
  }

  // Read and parse PDF
  const dataBuffer = fs.readFileSync(pdfPath);
  console.log('📖 Reading PDF...');
  
  const pdfData = await pdfParse(dataBuffer);
  console.log(`✅ PDF loaded: ${pdfData.numpages} pages\n`);

  const text = pdfData.text;
  const entries: DictionaryEntry[] = [];

  // Pattern 1: Standard format - TERM (in caps or bold) followed by definition
  // Example: "ABANDON - To give up..."
  const pattern1 = /^([A-Z][A-Z\s\-',\.]+?)\s+[-–—]\s+(.+?)(?=\n[A-Z][A-Z\s\-',\.]+?\s+[-–—]|\n\n|$)/gms;
  
  // Pattern 2: Alternative format - Term. Definition
  const pattern2 = /^([A-Z][a-z\s\-',\.]+?)\.\s+(.+?)(?=\n[A-Z][a-z\s\-',\.]+?\.|$)/gms;

  console.log('🔍 Extracting entries...\n');

  // Try pattern 1
  let matches = [...text.matchAll(pattern1)];
  
  if (matches.length === 0) {
    console.log('📝 Pattern 1 found no matches, trying pattern 2...');
    matches = [...text.matchAll(pattern2)];
  }

  for (const match of matches) {
    const term = match[1].trim();
    let definition = match[2].trim();
    
    // Clean up definition
    definition = definition
      .replace(/\s+/g, ' ')  // Normalize whitespace
      .replace(/\n/g, ' ')   // Remove newlines
      .trim();

    // Skip very short definitions (likely parsing errors)
    if (definition.length < 20) continue;

    // Truncate very long definitions
    if (definition.length > 1000) {
      definition = definition.substring(0, 997) + '...';
    }

    entries.push({
      term,
      definition,
      category: 'General',
    });
  }

  console.log(`✅ Extracted ${entries.length} entries\n`);

  if (entries.length === 0) {
    console.log('⚠️  No entries found. Let me show you a sample of the text format:\n');
    console.log('--- First 1000 characters ---');
    console.log(text.substring(0, 1000));
    console.log('\n--- End sample ---\n');
    console.log('Please copy the sample above and send it to me so I can adjust the parser!');
    process.exit(1);
  }

  // Save to JSON
  const outputPath = path.join(process.cwd(), 'data', 'blacks-dictionary.json');
  fs.writeFileSync(outputPath, JSON.stringify(entries, null, 2));

  console.log(`💾 Saved to: ${outputPath}`);
  console.log(`📊 Total entries: ${entries.length}`);
  
  // Show first few entries as sample
  console.log('\n📖 Sample entries:');
  entries.slice(0, 3).forEach((entry, i) => {
    console.log(`\n${i + 1}. ${entry.term}`);
    console.log(`   ${entry.definition.substring(0, 100)}...`);
  });

  console.log('\n✅ Done! Ready to run: npm run ingest');
}

parsePDFDictionary()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });