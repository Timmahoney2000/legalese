import * as fs from 'fs';
import * as path from 'path';

interface DictionaryEntry {
  term: string;
  definition: string;
  category?: string;
}

async function scrapeCornellLII() {
  console.log('🌐 Scraping Cornell Legal Information Institute...\n');

  // Cornell LII Wex index page
  const baseUrl = 'https://www.law.cornell.edu';
  const indexUrl = `${baseUrl}/wex`;

  const entries: DictionaryEntry[] = [];
  
  try {
    // Fetch index page
    console.log('📥 Fetching Wex index...');
    const indexResponse = await fetch(indexUrl);
    const indexHtml = await indexResponse.text();

    // Extract all term links
    // Cornell uses: <a href="/wex/term_name">Term Name</a>
    const linkPattern = /<a href="\/wex\/([^"]+)">([^<]+)<\/a>/g;
    const links = [...indexHtml.matchAll(linkPattern)];

    console.log(`📋 Found ${links.length} terms to fetch\n`);

    // Fetch each term (with rate limiting)
    for (let i = 0; i < Math.min(links.length, 1000); i++) {
      const [, slug, termName] = links[i];
      
      try {
        const termUrl = `${baseUrl}/wex/${slug}`;
        console.log(`${i + 1}/${Math.min(links.length, 1000)}: ${termName}`);
        
        const termResponse = await fetch(termUrl);
        const termHtml = await termResponse.text();

        // Extract definition from the content div
        // Cornell uses: <div class="field-item even">...definition...</div>
        const defMatch = termHtml.match(/<div class="field-item even"[^>]*>(.+?)<\/div>/s);
        
        if (defMatch) {
          let definition = defMatch[1]
            .replace(/<[^>]+>/g, '')  // Remove HTML tags
            .replace(/\s+/g, ' ')      // Normalize whitespace
            .trim();

          if (definition.length > 50) {
            entries.push({
              term: termName,
              definition: definition.substring(0, 1000),
              category: 'Cornell LII',
            });
          }
        }

        // Rate limiting - be nice to Cornell's servers
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`  ❌ Failed to fetch ${termName}`);
      }
    }

    console.log(`\n✅ Successfully scraped ${entries.length} terms`);

    // Merge with existing dictionary
    const dictPath = path.join(process.cwd(), 'data', 'blacks-dictionary.json');
    let existingEntries: DictionaryEntry[] = [];
    
    if (fs.existsSync(dictPath)) {
      existingEntries = JSON.parse(fs.readFileSync(dictPath, 'utf-8'));
      console.log(`📚 Merging with ${existingEntries.length} existing entries`);
    }

    // Combine and deduplicate
    const allEntries = [...existingEntries, ...entries];
    const uniqueEntries = Array.from(
      new Map(allEntries.map(e => [e.term.toLowerCase(), e])).values()
    );

    // Save
    fs.writeFileSync(dictPath, JSON.stringify(uniqueEntries, null, 2));
    console.log(`\n💾 Saved ${uniqueEntries.length} total entries to blacks-dictionary.json`);

  } catch (error) {
    console.error('❌ Scraping failed:', error);
    throw error;
  }
}

scrapeCornellLII()
  .then(() => {
    console.log('\n✅ Done! Run: npm run ingest');
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });