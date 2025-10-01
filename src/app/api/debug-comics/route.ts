import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check if comicbooks-api package is available
    const comicsApi = require('comicbooks-api');
    
    // Test basic functionality
    const testResult = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      packageAvailable: !!comicsApi,
      methods: {
        hasGetLatestComics: typeof comicsApi.getLatestComics === 'function',
        hasGetComicsThroughSearch: typeof comicsApi.getComicsThroughSearch === 'function'
      },
      userAgent: request.headers.get('user-agent'),
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer')
    };

    // Try a simple call with minimal parameters
    try {
      console.log('Testing comicsApi.getLatestComics with page 1...');
      const testComics = await Promise.race([
        comicsApi.getLatestComics(1),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout after 10 seconds')), 10000)
        )
      ]);
      
      return NextResponse.json({
        success: true,
        test: testResult,
        comicsData: {
          count: testComics?.length || 0,
          hasData: !!testComics,
          firstComic: testComics?.[0] ? {
            title: testComics[0].title || 'No title',
            hasImage: !!testComics[0].image || !!testComics[0].coverPage,
            hasDescription: !!testComics[0].description
          } : null
        }
      });
    } catch (apiError) {
      console.error('comicsApi test error:', apiError);
      
      return NextResponse.json({
        success: false,
        test: testResult,
        apiError: {
          message: apiError instanceof Error ? apiError.message : 'Unknown API error',
          type: apiError?.constructor?.name,
          stack: apiError instanceof Error ? apiError.stack : undefined,
          response: apiError?.response ? {
            status: apiError.response.status,
            statusText: apiError.response.statusText,
            data: apiError.response.data
          } : undefined
        }
      });
    }
  } catch (error) {
    console.error('Debug endpoint error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
    }, { status: 500 });
  }
}