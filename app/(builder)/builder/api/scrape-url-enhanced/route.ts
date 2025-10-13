import { NextRequest, NextResponse } from 'next/server';

// Function to sanitize smart quotes and other problematic characters
function sanitizeQuotes(text: string): string {
  return text
    // Replace smart single quotes
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    // Replace smart double quotes
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    // Replace other quote-like characters
    .replace(/[\u00AB\u00BB]/g, '"') // Guillemets
    .replace(/[\u2039\u203A]/g, "'") // Single guillemets
    // Replace other problematic characters
    .replace(/[\u2013\u2014]/g, '-') // En dash and em dash
    .replace(/[\u2026]/g, '...') // Ellipsis
    .replace(/[\u00A0]/g, ' '); // Non-breaking space
}

// Retry helper function
async function scrapeWithRetry(url: string, maxRetries: number = 2): Promise<any> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[scrape-url-enhanced] Attempt ${attempt}/${maxRetries} - Scraping with Firecrawl:`, url);

      const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
      if (!FIRECRAWL_API_KEY) {
        throw new Error('FIRECRAWL_API_KEY environment variable is not set');
      }

      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 second total timeout

      let firecrawlResponse;
      try {
        firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url,
            formats: ['markdown', 'screenshot'], // Reduced load - removed HTML format
            waitFor: 2000, // Reduced wait time
            timeout: 45000, // Reduced internal timeout to avoid queue timeouts
            blockAds: true,
            maxAge: 3600000, // Use cached data if less than 1 hour old (500% faster!)
            actions: [
              {
                type: 'wait',
                milliseconds: 1000 // Reduced wait time
              },
              {
                type: 'screenshot',
                fullPage: false // Just visible viewport for performance
              }
            ]
          }),
          signal: controller.signal
        });
      } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          throw new Error('Request timed out after 90 seconds. Firecrawl may be experiencing network issues.');
        }
        throw error;
      }
      clearTimeout(timeoutId);

      if (!firecrawlResponse.ok) {
        const error = await firecrawlResponse.text();
        console.error('[scrape-url-enhanced] Firecrawl API error response:', error);

        // Check for specific error types
        let errorMessage = 'Firecrawl API error';
        try {
          const errorData = JSON.parse(error);
          if (errorData.code === 'SCRAPE_TIMEOUT') {
            if (attempt < maxRetries) {
              console.log(`[scrape-url-enhanced] Timeout on attempt ${attempt}, retrying in 3 seconds...`);
              await new Promise(resolve => setTimeout(resolve, 3000));
              continue; // Retry
            }
            errorMessage = 'Firecrawl is experiencing high load. The scrape timed out after multiple attempts. Please try again later.';
          } else if (errorData.error) {
            errorMessage = `Firecrawl error: ${errorData.error}`;
          }
        } catch {
          errorMessage = `Firecrawl API error: ${error}`;
        }

        throw new Error(errorMessage);
      }

      // Success - return the response
      return await firecrawlResponse.json();

    } catch (error: any) {
      if (attempt === maxRetries) {
        throw error; // Last attempt failed
      }
      console.log(`[scrape-url-enhanced] Attempt ${attempt} failed:`, error.message);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({
        success: false,
        error: 'URL is required'
      }, { status: 400 });
    }

    const startTime = Date.now();

    // Use retry mechanism
    const data = await scrapeWithRetry(url, 2);

    if (!data.success || !data.data) {
      throw new Error('Failed to scrape content');
    }
    
    const { markdown, metadata, screenshot, actions } = data.data;
    // html available but not used in current implementation
    
    // Get screenshot from either direct field or actions result
    const screenshotUrl = screenshot || actions?.screenshots?.[0] || null;
    
    // Sanitize the markdown content
    const sanitizedMarkdown = sanitizeQuotes(markdown || '');
    
    // Extract structured data from the response
    const title = metadata?.title || '';
    const description = metadata?.description || '';
    
    // Format content for AI
    const formattedContent = `
Title: ${sanitizeQuotes(title)}
Description: ${sanitizeQuotes(description)}
URL: ${url}

Main Content:
${sanitizedMarkdown}
    `.trim();
    
    return NextResponse.json({
      success: true,
      url,
      content: formattedContent,
      screenshot: screenshotUrl,
      structured: {
        title: sanitizeQuotes(title),
        description: sanitizeQuotes(description),
        content: sanitizedMarkdown,
        url,
        screenshot: screenshotUrl
      },
      metadata: {
        scraper: 'firecrawl-enhanced',
        timestamp: new Date().toISOString(),
        contentLength: formattedContent.length,
        cached: data.data.cached || false, // Indicates if data came from cache
        ...metadata
      },
      message: 'URL scraped successfully with Firecrawl (with caching for 500% faster performance)'
    });

    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`[scrape-url-enhanced] Completed in ${duration}ms (${(duration/1000).toFixed(2)}s)`);

  } catch (error) {
    console.error('[scrape-url-enhanced] Error:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}