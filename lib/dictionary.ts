import type { DictionaryEntry } from '@/types';
import { generateEmbedding } from './embeddings';
import { searchSimilarTerms } from './pinecone';

export function extractLegalTerms(text: string): string[] {
  const legalPatterns = [
    /\b(ad\s+hoc|prima\s+facie|mens\s+rea|actus\s+reus|habeas\s+corpus|sub\s+judice|inter\s+alia|et\s+al\.|ex\s+parte|in\s+re|pro\s+bono|quid\s+pro\s+quo|sui\s+generis|ultra\s+vires|vis-à-vis|de\s+facto|de\s+jure|ipso\s+facto|per\s+se|res\s+judicata|stare\s+decisis)\b/gi,
    /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Act|Rule|Clause|Amendment|Order|Motion|Writ|Court|Statute|Code|Law)\b/g,
    /\b(plaintiff|defendant|appellant|appellee|petitioner|respondent|affidavit|deposition|injunction|tort|lien|escrow|probate|intestate|testator|beneficiary|trustee|fiduciary|arbitration|mediation|litigation|precedent|jurisdiction|venue|subpoena|warrant|indictment|arraignment|bail|parole|discovery|damages|liability|negligence|malpractice|contract|conveyance|easement|encumbrance|foreclosure|mortgage|lease|tenancy|covenant|estoppel|waiver|remedy|restitution|rescission|consideration|breach)\b/gi,
  ];
  
  const terms = new Set<string>();
  
  for (const pattern of legalPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => terms.add(match.trim()));
    }
  }
  
  return Array.from(terms);
}

export async function searchDictionaryByEmbedding(
  terms: string[]
): Promise<Map<string, Array<{ term: string; definition: string; score: number }>>> {
  const results = new Map();
  
  for (const term of terms) {
    try {
      const embedding = await generateEmbedding(term);
      const matches = await searchSimilarTerms(embedding, 3);
      
      if (matches.length > 0) {
        results.set(term, matches);
      }
    } catch (error) {
      console.error(`Error searching for term: ${term}`, error);
    }
  }
  
  return results;
}