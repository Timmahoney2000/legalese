import { Pinecone } from '@pinecone-database/pinecone';

let pineconeClient: Pinecone | null = null;

export function getPineconeClient(): Pinecone {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }
  return pineconeClient;
}

export async function searchSimilarTerms(
  queryEmbedding: number[],
  topK: number = 5
): Promise<Array<{ term: string; definition: string; score: number }>> {
  try {
    const client = getPineconeClient();
    const indexName = process.env.PINECONE_INDEX || 'legal-dictionary';
    const index = client.index(indexName);

    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    });

    return queryResponse.matches.map((match) => ({
      term: match.metadata?.term as string || '',
      definition: match.metadata?.definition as string || '',
      score: match.score || 0,
    }));
  } catch (error) {
    console.error('Error searching Pinecone:', error);
    return [];
  }
}

export async function verifyPineconeConnection(): Promise<boolean> {
  try {
    const client = getPineconeClient();
    await client.listIndexes();
    return true;
  } catch (error) {
    return false;
  }
}