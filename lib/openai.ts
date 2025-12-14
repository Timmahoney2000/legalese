import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface TranslationOptions {
  documentText: string;
  fileName: string;
  definitions: string;
  model?: string;
}

export async function translateWithOpenAI({
  documentText,
  fileName,
  definitions,
  model = 'gpt-4o-mini',
}: TranslationOptions): Promise<ReadableStream> {
  const systemPrompt = `You are an expert legal translator who converts complex legal documents into clear, accessible language for the general public.

Your task is to translate legal documents while:
1. Maintaining complete legal accuracy - never change the meaning
2. Replacing legal jargon with everyday language
3. Breaking down complex sentences into simpler ones
4. Explaining legal concepts briefly when necessary
5. Preserving all important details: dates, names, numbers, deadlines, and obligations

${definitions ? `**Legal Terms Reference:**\n${definitions}` : ''}

Guidelines:
- Write at a 10th-grade reading level
- Use active voice when possible
- Keep sentences under 25 words
- Add brief explanations in parentheses for unavoidable legal terms
- Maintain the document's structure and organization
- If a term is not in the reference but appears important, provide a brief explanation`;

  const userPrompt = `Please translate the following legal document into plain English:\n\n**Document: ${fileName}**\n\n${documentText}`;

  const stream = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.3,
    max_tokens: 4000,
    stream: true,
  });

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            controller.enqueue(new TextEncoder().encode(content));
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

export async function verifyOpenAIConnection(): Promise<boolean> {
  try {
    await openai.models.list();
    return true;
  } catch (error) {
    return false;
  }
}