import { NextRequest, NextResponse } from 'next/server';
import { POOL_PG as pool } from '@/lib/db';

export async function GET(req: NextRequest) {
    const cp = req.nextUrl.searchParams.get('cp');
    const lat = req.nextUrl.searchParams.get('lat');
    const lng = req.nextUrl.searchParams.get('lng');

    if (!cp || !/^\d{5}$/.test(cp)) {
        return NextResponse.json({ error: 'CP inválido' }, { status: 400 });
    }
    if (!lat || !lng || isNaN(Number(lat)) || isNaN(Number(lng))) {
        return NextResponse.json({ error: 'lat/lng inválidos' }, { status: 400 });
    }

    const query = `
        SELECT id, codigo_postal, colonia, tipo, zona,
            (6371 * acos(
                cos(radians($1)) * cos(radians(latitud)) * cos(radians(longitud) - radians($2)) + 
                sin(radians($1)) * sin(radians(latitud))
            )) AS distancia_km
        FROM cat_colonias_sjr
        WHERE codigo_postal = $3
        ORDER BY distancia_km ASC
    `;

    try {
        const result = await pool.query(query, [lat, lng, cp]);
        return NextResponse.json({ colonias: result.rows });
    } catch (error) {
        console.error('[COLONIAS API]', error);
        return NextResponse.json({ error: 'Error al consultar colonias' }, { status: 500 });
    }
}
