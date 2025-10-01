// Alternative Comics API using Comic Vine (more reliable than scraping)
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    // Correctly parse URL parameters
    const urlParams = new URL(request.url).searchParams;
    const searchTerm = urlParams.get('query');
    const page = parseInt(urlParams.get('page') || '1', 10);
    const pageSize = parseInt(urlParams.get('pageSize') || '10', 10);

    console.log('ComicsAPI Request:', {
        searchTerm,
        page,
        pageSize,
        nodeEnv: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });

    try {
        // Check if Comic Vine API key is available
        const apiKey = process.env.COMIC_VINE_API_KEY;
        if (!apiKey) {
            throw new Error('Comic Vine API key not configured');
        }

        // Use Comic Vine API instead of scraping
        const offset = (page - 1) * pageSize;
        let apiUrl: string;

        if (searchTerm) {
            apiUrl = `https://comicvine.gamespot.com/api/search/?api_key=${apiKey}&format=json&query=${encodeURIComponent(searchTerm)}&resources=issue&limit=${pageSize}&offset=${offset}`;
        } else {
            apiUrl = `https://comicvine.gamespot.com/api/issues/?api_key=${apiKey}&format=json&limit=${pageSize}&offset=${offset}&sort=date_added:desc`;
        }

        const response = await fetch(apiUrl, {
            headers: {
                'User-Agent': 'RetroPop Comics App/1.0',
                'Accept': 'application/json',
            },
            signal: AbortSignal.timeout(15000)
        });

        if (!response.ok) {
            throw new Error(`Comic Vine API responded with status: ${response.status}`);
        }

        const data = await response.json();

        if (data.error !== 'OK') {
            throw new Error(`Comic Vine API error: ${data.error}`);
        }

        // Transform Comic Vine data to match expected format
        const comics = data.results?.map((issue: any) => ({
            title: issue.name || issue.volume?.name || 'Unknown Title',
            coverPage: issue.image?.medium_url || issue.image?.original_url || '',
            description: issue.description || '',
            information: {
                Year: issue.cover_date ? new Date(issue.cover_date).getFullYear().toString() : '',
                Issue: issue.issue_number || '',
                Publisher: issue.volume?.publisher?.name || ''
            },
            downloadLinks: {},
            comicVineId: issue.id,
            comicVineUrl: issue.site_detail_url
        })) || [];

        console.log('Comic Vine API Success:', {
            resultsCount: comics.length,
            hasData: !!comics.length
        });

        return NextResponse.json(comics);

    } catch (error) {
        console.error('Comic Vine API Error:', error);

        return NextResponse.json({
            error: 'Failed to fetch comics',
            message: error instanceof Error ? error.message : 'An unexpected error occurred',
            provider: 'Comic Vine API'
        }, { status: 500 });
    }
}
