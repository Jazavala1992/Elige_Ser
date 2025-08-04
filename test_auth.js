const BASE_URL = 'https://elige-ser-backend.onrender.com/api';

async function testAuth() {
    try {
        console.log('🔄 Probando login...');
        
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
        console.log('✅ Login respuesta status:', loginResponse.status);
        console.log('✅ Login data:', loginData);
        
        if (!loginResponse.ok) {
            throw new Error(`Login failed: ${loginResponse.status} - ${JSON.stringify(loginData)}`);
        }
        
        const token = loginData.token;
        
        // 2. Probar endpoint de pacientes con el token
        console.log('🔄 Probando endpoint de paciente específico...');
        const pacientesResponse = await fetch(`${BASE_URL}/paciente/2`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const pacientesData = await pacientesResponse.json();
        console.log('✅ Pacientes respuesta status:', pacientesResponse.status);
        console.log('✅ Pacientes data:', pacientesData);
        
        if (!pacientesResponse.ok) {
            throw new Error(`Pacientes failed: ${pacientesResponse.status} - ${JSON.stringify(pacientesData)}`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testAuth();
