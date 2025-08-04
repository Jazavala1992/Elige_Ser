const BASE_URL = 'https://elige-ser-backend.onrender.com/api';

async function testAuthFinal() {
    try {
        console.log('🔄 Test final: Probando login y JWT...');
        
        // 1. Probar login
        const loginResponse = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@admin.com',
                password: 'admin123'
            })
        });
        
        const loginData = await loginResponse.json();
        console.log('✅ Login response:', loginData);
        
        if (!loginResponse.ok) {
            throw new Error(`Login failed: ${loginResponse.status} - ${JSON.stringify(loginData)}`);
        }
        
        const token = loginData.token;
        console.log('🔑 Token type:', token.startsWith('temporary-') ? 'TEMPORAL' : 'JWT');
        
        // 2. Probar API de pacientes con el token
        console.log('🔄 Probando endpoint de pacientes...');
        const pacientesResponse = await fetch(`${BASE_URL}/pacientes/1`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const pacientesData = await pacientesResponse.json();
        console.log('✅ Pacientes status:', pacientesResponse.status);
        console.log('✅ Pacientes data:', pacientesData);
        
        if (pacientesResponse.status === 401) {
            console.error('❌ Aún hay problema 401 - verificar configuración JWT_SECRET');
        } else {
            console.log('🎉 ¡PROBLEMA 401 RESUELTO!');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testAuthFinal();
