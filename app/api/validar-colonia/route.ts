import { NextResponse } from "next/server";
import { POOL_PG as pool } from "@/lib/db"; // Ajusta la ruta a tu lib/db

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const cp = searchParams.get("cp");

  // Validación rápida de parámetros
  if (!lat || !lng || !cp) {
    return NextResponse.json(
      { error: "Faltan parámetros: lat, lng y cp son obligatorios." },
      { status: 400 },
    );
  }

  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    console.log(apiKey);
    const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=es`;

    // 1. Consultar a Google Maps desde el Servidor
    const googleResponse = await fetch(googleUrl);
    const googleData = await googleResponse.json();

    if (googleData.status !== "OK" || !googleData.results.length) {
      return NextResponse.json(
        { error: `Google Maps Error: ${googleData.status}` },
        { status: 500 },
      );
    }

    // 2. Extraer la colonia (sublocality_level_1) del JSON de Google
    let coloniaTextoGoogle = "";
    const components = googleData.results[0].address_components;

    for (const component of components) {
      if (component.types.includes("sublocality_level_1")) {
        coloniaTextoGoogle = component.long_name; // Ej: "Banthí"
        break;
      }
    }

    // Si Google no devolvió colonia, usamos la primera dirección como fallback de texto
    if (!coloniaTextoGoogle) {
      coloniaTextoGoogle = googleData.results[0].formatted_address || "";
    }

    // 3. Hacer el desempate inteligente en tu Base de Datos usando Haversine e ILIKE
    const querySQL = `
      SELECT id, codigo_postal, colonia, tipo, zona,
          (6371 * acos(
              cos(radians($1)) * cos(radians(latitud)) * cos(radians(longitud) - radians($2)) + 
              sin(radians($1)) * sin(radians(latitud))
          )) AS distancia_km
      FROM cat_colonias_sjr
      WHERE codigo_postal = $3
      ORDER BY 
          -- Prioridad si el catálogo coincide con lo que Google detectó en texto
          (colonia ILIKE $4) DESC,
          -- Desempate por distancia física
          distancia_km ASC
      LIMIT 1;
    `;

    const terminoBusqueda = `%${coloniaTextoGoogle}%`;
    const valores = [Number(lat), Number(lng), cp, terminoBusqueda];

    const resultadoBD = await pool.query(querySQL, valores);

    if (resultadoBD.rows.length === 0) {
      // Fallback: Si el CP de Mapbox no coincide con tu catálogo, buscamos la más cercana de todo el municipio
      const fallbackQuery = `
        SELECT id, codigo_postal, colonia, tipo, zona,
            (6371 * acos(cos(radians($1)) * cos(radians(latitud)) * cos(radians(longitud) - radians($2)) + sin(radians($1)) * sin(radians(latitud)))) AS distancia_km
        FROM cat_colonias_sjr
        ORDER BY (colonia ILIKE $3) DESC, distancia_km ASC
        LIMIT 1;
      `;
      const fallbackRes = await pool.query(fallbackQuery, [
        Number(lat),
        Number(lng),
        terminoBusqueda,
      ]);

      return NextResponse.json({
        origen: "fallback_global",
        coloniaTextoGoogle,
        coloniaOficial: fallbackRes.rows[0],
      });
    }

    // 4. Responder al Frontend con la colonia exacta del catálogo y su ID
    return NextResponse.json({
      success: true,
      coloniaTextoGoogle,
      coloniaOficial: resultadoBD.rows[0], // Contiene id, colonia, tipo, etc.
    });
  } catch (error: any) {
    console.error("❌ Error en el endpoint de validación:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
