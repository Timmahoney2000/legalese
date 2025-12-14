export interface DictionaryEntry {
    term: string;
    definition: string;
    category?: string;
}

export interface ProcessedDocument {
    originalText: string;
    translatedText?: string;
    identifiedTerms: string[];
    fileName: string;
}

export interface TranslationRequest {
    documentText: string;
    fileName: string;
}

export interface DictionaryMatch {
    term: string;
    definition: string;
    category?: string;
    relevance: number;
}