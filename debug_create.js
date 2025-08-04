const BASE_URL = 'https://elige-ser-backend.onrender.com/api';

async function debugCreatePaciente() {
    try {
        // 1. Login
        const loginResponse = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@admin.com',
                password: 'admin123'
            })
        });
        const loginData = await loginResponse.json();
        const token = loginData.token;
        
        // 2. Intentar crear paciente - formato que espera el controlador
        console.log('🔄 Debuggeando CREATE Paciente - formato del controlador...');
        const response = await fetch(`${BASE_URL}/pacientes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                id_usuario: 1, // ID del admin
                nombre: 'Juan Carlos Test',
                fecha_nacimiento: '1990-01-01',
                sexo: 'M',
                telefono: '5551234567',
                ocupacion: 'Tester',
                nivel_actividad: 'Moderado',
                objetivo: 'Debug test',
                horas_sueno: 8,
                habitos: 'Testing',
                antecedentes: 'Ninguno'
            })
        });
        
        console.log('📊 Status:', response.status);
        console.log('📊 Status Text:', response.statusText);
        
        const responseData = await response.json();
        console.log('📊 Response Data:', JSON.stringify(responseData, null, 2));
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

debugCreatePaciente();
