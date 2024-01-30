import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const accessToken = process.env.SUPERHERO_ACCESS_TOKEN;
    if (!accessToken) {
        return new NextResponse('API key not configured', { status: 500 });
    }

    // Extract the superhero ID from the URL.
    const superheroId = request.nextUrl.pathname.split('/').pop();
    if (!superheroId) {
        return new NextResponse('Superhero ID is required', { status: 400 });
    }

    // Construct the superhero API URL.
    const apiUrl = `https://superheroapi.com/api/${accessToken}/${superheroId}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
        }

        // Get the JSON response body
        const superheroDetails = await response.json();

        return new NextResponse(JSON.stringify(superheroDetails), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // You can narrow this down for better security
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        return new NextResponse(JSON.stringify({ error: message }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // You can narrow this down for better security
            },
        });
    }
}
