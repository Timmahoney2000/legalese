import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

interface DictionaryEntry {
  term: string;
  definition: string;
  category?: string;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

async function ingestDictionary() {
  console.log('🚀 Starting dictionary ingestion...\n');

  // Load dictionary
  const dictionaryPath = path.join(process.cwd(), 'data', 'blacks-dictionary.json');
  const dictionaryData: DictionaryEntry[] = JSON.parse(
    fs.readFileSync(dictionaryPath, 'utf-8')
  );

  console.log(`📚 Loaded ${dictionaryData.length} dictionary entries\n`);

  // Get Pinecone index
  const indexName = process.env.PINECONE_INDEX || 'legal-dictionary';
  
  try {
    // Check if index exists
    const indexes = await pinecone.listIndexes();
    const indexExists = indexes.indexes?.some(idx => idx.name === indexName);

    if (!indexExists) {
      console.log(`📝 Creating index: ${indexName}...`);
      await pinecone.createIndex({
        name: indexName,
        dimension: 1536, // text-embedding-3-small dimension
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1',
          },
        },
      });
      console.log('✅ Index created!\n');
      
      // Wait for index to be ready
      console.log('⏳ Waiting for index to be ready...');
      await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 60 seconds
    } else {
      console.log(`✅ Index ${indexName} already exists\n`);
    }

    const index = pinecone.index(indexName);

    // Process entries in batches
    const batchSize = 100;
    let processed = 0;

    for (let i = 0; i < dictionaryData.length; i += batchSize) {
      const batch = dictionaryData.slice(i, i + batchSize);
      
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}...`);

      const vectors = [];

      for (const entry of batch) {
        try {
          // Create combined text for embedding
          const textToEmbed = `${entry.term}: ${entry.definition}`;
          
          // Generate embedding
          const embedding = await generateEmbedding(textToEmbed);

          vectors.push({
            id: `term-${i + batch.indexOf(entry)}`,
            values: embedding,
            metadata: {
              term: entry.term,
              definition: entry.definition,
              category: entry.category || 'General',
            },
          });

          processed++;
          
          // Rate limiting - wait between API calls
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Error processing ${entry.term}:`, error);
        }
      }

      // Upsert batch to Pinecone
      if (vectors.length > 0) {
        await index.upsert(vectors);
        console.log(`✅ Uploaded ${vectors.length} vectors (${processed}/${dictionaryData.length})\n`);
      }
    }

    console.log('\n🎉 Dictionary ingestion complete!');
    console.log(`📊 Total entries processed: ${processed}`);
    
  } catch (error) {
    console.error('❌ Error during ingestion:', error);
    throw error;
  }
}

// Run ingestion
ingestDictionary()
  .then(() => {
    console.log('\n✅ All done! Your dictionary is ready to use.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Ingestion failed:', error);
    process.exit(1);
  });