async function generatePDF(carrito, metodoPago) {
    try {
        // Preparar los datos para enviar al backend
        const data = {
            items: carrito.map(item => ({
                titulo: item.titulo,
                cantidad: item.cantidad || 1,
                precio: item.precio,
                tipo: item.tipo || 'venta'
            })),
            total: carrito.reduce((sum, item) => sum + (item.precio || 0) * (item.cantidad || 1), 0),
            metodoPago: metodoPago,
            username: localStorage.getItem('username')
        };

        // Si hay alquileres, registrarlos primero
        const alquileres = carrito.filter(item => item.tipo === 'alquiler');
        if (alquileres.length > 0) {
            const response = await fetch('http://localhost:3000/api/alquiler', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: localStorage.getItem('username'),
                    alquileres: alquileres.map(alq => ({
                        titulo: alq.titulo,
                        cantidad: alq.cantidad || 1
                    }))
                })
            });

            if (!response.ok) {
                throw new Error('Error al registrar alquileres');
            }

            const result = await response.json();
            data.alquilerIds = result.alquilerIds;
        }

        // Hacer la petición al backend para generar el PDF
        const response = await fetch('http://localhost:3000/api/generate-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Error al generar la factura');
        }

        // Abrir el PDF en una nueva pestaña
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
    } catch (error) {
        console.error('Error:', error);
        alert('Error al generar la factura. Por favor, inténtalo de nuevo.');
    }
}
