console.log('🔍 DEBUG: ERROR 500 EN RESULTADOS');
console.log('==================================');

const BASE_URL = 'https://elige-ser-backend.onrender.com/api';

// Función helper para hacer requests autenticados
async function makeAuthenticatedRequest(url, options = {}) {
    try {
        // Login para obtener token temporal
        const loginResponse = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@admin.com',
                password: 'admin123'
            })
        });

        if (!loginResponse.ok) {
            console.error('❌ Error en login:', await loginResponse.text());
            return null;
        }

        const loginData = await loginResponse.json();
        const token = loginData.token;

        // Hacer el request con el token
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        };

        return await fetch(url, { ...options, headers });
    } catch (error) {
        console.error('❌ Error en request:', error);
        return null;
    }
}

async function debugResultadosError() {
    console.log('\n🔄 1. Probando crear resultado con datos válidos...');
    
    // Datos que coinciden exactamente con la base de datos
    const resultadoData = {
        id_medicion: 27, // ID de medición existente
        imc: 24.7,
        suma_pliegues: 60.0,
        porcentaje_grasa: 18.5,
        masa_muscular_kg: 55.2,
        porcentaje_masa_muscular: 65.5,
        masa_osea: 12.1,
        masa_residual: 18.2
    };

    console.log('📤 Datos a enviar:', JSON.stringify(resultadoData, null, 2));

    const response = await makeAuthenticatedRequest(`${BASE_URL}/resultados`, {
        method: 'POST',
        body: JSON.stringify(resultadoData)
    });

    if (response) {
        console.log('📥 Status response:', response.status);
        const responseText = await response.text();
        console.log('📥 Response text:', responseText);

        if (response.ok) {
            console.log('✅ CREATE resultados exitoso');
        } else {
            console.log('❌ CREATE resultados fallido');
            console.log('💥 Error details:', responseText);
        }
    } else {
        console.log('❌ No se pudo obtener respuesta');
    }

    // Probar con datos mínimos requeridos
    console.log('\n🔄 2. Probando con datos mínimos...');
    const resultadoMinimo = {
        id_medicion: 27,
        imc: 24.7
    };

    console.log('📤 Datos mínimos:', JSON.stringify(resultadoMinimo, null, 2));

    const response2 = await makeAuthenticatedRequest(`${BASE_URL}/resultados`, {
        method: 'POST',
        body: JSON.stringify(resultadoMinimo)
    });

    if (response2) {
        console.log('📥 Status response 2:', response2.status);
        const responseText2 = await response2.text();
        console.log('📥 Response text 2:', responseText2);
    }

    // Verificar que existe la medición
    console.log('\n🔄 3. Verificando si la medición existe...');
    const medicionCheck = await makeAuthenticatedRequest(`${BASE_URL}/mediciones/paciente/3`);
    if (medicionCheck && medicionCheck.ok) {
        const mediciones = await medicionCheck.json();
        console.log('📋 Mediciones encontradas:', mediciones.length);
        if (mediciones.length > 0) {
            console.log('📋 Última medición:', mediciones[mediciones.length - 1]);
        }
    }
}

debugResultadosError();
