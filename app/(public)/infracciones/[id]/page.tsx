
export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    console.log('ID:', id);


    const baseUrl =
        process.env.NODE_ENV === 'production'
            ? 'https://via-v2.vercel.app'
            : 'http://localhost:3000';


    const res = await fetch(
        `${baseUrl}/api/infracciones/registradas/${id}`,
        { cache: 'no-store' }
    );

    const data = await res.json();
    console.log('Data:', data.data);

    return (
        <div>
            <h1>Infracción</h1>

            <p><strong>Folio:</strong> {data.data.folio}</p>
            <p><strong>Estatus:</strong> {data.data.estatus}</p>
            <p><strong>Monto total:</strong> {data.data.montoTotal}</p>
            <p><strong>Monto final:</strong> {data.data.montoFinal}</p>
            <p><strong>Ciudadano presente:</strong> {data.data.ciudadanoPresente ? 'Sí' : 'No'}</p>
        </div>
    );
}