const BASE_URL = 'https://elige-ser-backend.onrender.com/api';

// Helper para hacer requests con token automático
async function makeAuthenticatedRequest(url, options = {}) {
    // Obtener token de admin temporal
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
    
    // Hacer request autenticado
    return await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        }
    });
}

async function testCRUDCompleto() {
    console.log('🚀 =================================');
    console.log('🚀 TEST COMPLETO DE TODOS LOS CRUDS');
    console.log('🚀 =================================\n');
    
    let testResults = {
        usuarios: { success: 0, total: 0 },
        pacientes: { success: 0, total: 0 },
        consultas: { success: 0, total: 0 },
        mediciones: { success: 0, total: 0 },
        resultados: { success: 0, total: 0 }
    };
    
    // ======================
    // 1. TEST CRUD USUARIOS
    // ======================
    console.log('👤 === TEST CRUD USUARIOS ===');
    
    try {
        // Login (READ)
        testResults.usuarios.total++;
        console.log('🔄 1.1 Login Usuario...');
        const loginResponse = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@admin.com',
                password: 'admin123'
            })
        });
        const loginData = await loginResponse.json();
        console.log(loginResponse.ok ? '✅ Login exitoso' : '❌ Login fallido');
        if (loginResponse.ok) testResults.usuarios.success++;
        
        // Registro (CREATE)
        testResults.usuarios.total++;
        console.log('🔄 1.2 Registro Usuario...');
        const registerResponse = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: 'Test User',
                username: 'testuser',
                email: `test_${Date.now()}@test.com`,
                password: 'test123'
            })
        });
        console.log(registerResponse.ok ? '✅ Registro exitoso' : '❌ Registro fallido');
        if (registerResponse.ok) testResults.usuarios.success++;
        
        // Obtener Usuario (READ)
        testResults.usuarios.total++;
        console.log('🔄 1.3 Obtener Usuario...');
        const getUserResponse = await makeAuthenticatedRequest(`${BASE_URL}/usuario/1`);
        console.log(getUserResponse.ok ? '✅ Obtener usuario exitoso' : '❌ Obtener usuario fallido');
        if (getUserResponse.ok) testResults.usuarios.success++;
        
    } catch (error) {
        console.error('❌ Error en CRUD Usuarios:', error.message);
    }
    
    // ======================
    // 2. TEST CRUD PACIENTES
    // ======================
    console.log('\n🏥 === TEST CRUD PACIENTES ===');
    
    let pacienteId = null;
    
    try {
        // Crear Paciente (CREATE)
        testResults.pacientes.total++;
        console.log('🔄 2.1 Crear Paciente...');
        const createPacienteResponse = await makeAuthenticatedRequest(`${BASE_URL}/pacientes`, {
            method: 'POST',
            body: JSON.stringify({
                nombre: 'Paciente Test CRUD',
                fecha_nacimiento: '1990-01-01',
                sexo: 'M',
                telefono: '555-TEST',
                ocupacion: 'Tester',
                nivel_actividad: 'Moderado',
                objetivo: 'Test CRUD completo',
                horas_sueno: 8,
                habitos: 'Testing',
                antecedentes: 'Ninguno'
            })
        });
        const createPacienteData = await createPacienteResponse.json();
        console.log(createPacienteResponse.ok ? '✅ Crear paciente exitoso' : '❌ Crear paciente fallido');
        if (createPacienteResponse.ok) {
            testResults.pacientes.success++;
            pacienteId = createPacienteData.id || createPacienteData.paciente?.id_paciente;
            console.log(`📝 Paciente creado con ID: ${pacienteId}`);
        }
        
        // Listar Pacientes (READ)
        testResults.pacientes.total++;
        console.log('🔄 2.2 Listar Pacientes...');
        const listPacientesResponse = await makeAuthenticatedRequest(`${BASE_URL}/pacientes/1`);
        const listPacientesData = await listPacientesResponse.json();
        console.log(listPacientesResponse.ok ? '✅ Listar pacientes exitoso' : '❌ Listar pacientes fallido');
        if (listPacientesResponse.ok) {
            testResults.pacientes.success++;
            console.log(`📋 Total pacientes encontrados: ${Array.isArray(listPacientesData) ? listPacientesData.length : 'N/A'}`);
            
            // Si no tenemos pacienteId del CREATE, usar uno de la lista
            if (!pacienteId && Array.isArray(listPacientesData) && listPacientesData.length > 0) {
                pacienteId = listPacientesData[0].id_paciente;
                console.log(`📝 Usando paciente existente ID: ${pacienteId}`);
            }
        }
        
        // Obtener Paciente específico (READ)
        if (pacienteId) {
            testResults.pacientes.total++;
            console.log('🔄 2.3 Obtener Paciente específico...');
            const getPacienteResponse = await makeAuthenticatedRequest(`${BASE_URL}/paciente/${pacienteId}`);
            console.log(getPacienteResponse.ok ? '✅ Obtener paciente específico exitoso' : '❌ Obtener paciente específico fallido');
            if (getPacienteResponse.ok) testResults.pacientes.success++;
        }
        
        // Actualizar Paciente (UPDATE)
        if (pacienteId) {
            testResults.pacientes.total++;
            console.log('🔄 2.4 Actualizar Paciente...');
            const updatePacienteResponse = await makeAuthenticatedRequest(`${BASE_URL}/pacientes/${pacienteId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    nombre: 'Paciente Test CRUD ACTUALIZADO',
                    telefono: '555-UPDATED'
                })
            });
            console.log(updatePacienteResponse.ok ? '✅ Actualizar paciente exitoso' : '❌ Actualizar paciente fallido');
            if (updatePacienteResponse.ok) testResults.pacientes.success++;
        }
        
    } catch (error) {
        console.error('❌ Error en CRUD Pacientes:', error.message);
    }
    
    // ======================
    // 3. TEST CRUD CONSULTAS
    // ======================
    console.log('\n📋 === TEST CRUD CONSULTAS ===');
    
    let consultaId = null;
    
    try {
        // Crear Consulta (CREATE)
        if (pacienteId) {
            testResults.consultas.total++;
            console.log('🔄 3.1 Crear Consulta...');
            const createConsultaResponse = await makeAuthenticatedRequest(`${BASE_URL}/consultas`, {
                method: 'POST',
                body: JSON.stringify({
                    id_paciente: pacienteId,
                    fecha: new Date().toISOString().split('T')[0],
                    motivo: 'Test CRUD consulta',
                    observaciones: 'Consulta de prueba para test completo'
                })
            });
            const createConsultaData = await createConsultaResponse.json();
            console.log(createConsultaResponse.ok ? '✅ Crear consulta exitoso' : '❌ Crear consulta fallido');
            if (createConsultaResponse.ok) {
                testResults.consultas.success++;
                consultaId = createConsultaData.id || createConsultaData.consulta?.id_consulta;
                console.log(`📝 Consulta creada con ID: ${consultaId}`);
            }
        }
        
        // Listar Consultas (READ)
        if (pacienteId) {
            testResults.consultas.total++;
            console.log('🔄 3.2 Listar Consultas...');
            const listConsultasResponse = await makeAuthenticatedRequest(`${BASE_URL}/consultas/paciente/${pacienteId}`);
            console.log(listConsultasResponse.ok ? '✅ Listar consultas exitoso' : '❌ Listar consultas fallido');
            if (listConsultasResponse.ok) testResults.consultas.success++;
        }
        
    } catch (error) {
        console.error('❌ Error en CRUD Consultas:', error.message);
    }
    
    // ======================
    // 4. TEST CRUD MEDICIONES
    // ======================
    console.log('\n📏 === TEST CRUD MEDICIONES ===');
    
    let medicionId = null;
    
    try {
        // Crear Medición (CREATE)
        if (consultaId) {
            testResults.mediciones.total++;
            console.log('🔄 4.1 Crear Medición...');
            const createMedicionResponse = await makeAuthenticatedRequest(`${BASE_URL}/mediciones`, {
                method: 'POST',
                body: JSON.stringify({
                    id_consulta: consultaId,
                    peso: 75.5,
                    talla: 175,
                    pl_tricipital: 15,
                    pl_bicipital: 8,
                    pl_subescapular: 18,
                    pl_supraespinal: 10,
                    pl_suprailiaco: 12,
                    pl_abdominal: 20,
                    pl_muslo_medial: 22,
                    pl_pantorrilla_medial: 8,
                    per_brazo_reposo: 30,
                    per_brazo_flex: 32,
                    per_muslo_medio: 55,
                    per_pantorrilla_medial: 35,
                    per_cintura: 85,
                    per_cadera: 95,
                    diametro_femoral: 9.5,
                    diametro_biestiloideo: 5.8,
                    diametro_humeral: 6.8
                })
            });
            const createMedicionData = await createMedicionResponse.json();
            console.log(createMedicionResponse.ok ? '✅ Crear medición exitoso' : '❌ Crear medición fallido');
            if (createMedicionResponse.ok) {
                testResults.mediciones.success++;
                medicionId = createMedicionData.id || createMedicionData.medicion?.id_medicion;
                console.log(`📝 Medición creada con ID: ${medicionId}`);
            }
        }
        
        // Listar Mediciones por Paciente (READ)
        if (pacienteId) {
            testResults.mediciones.total++;
            console.log('🔄 4.2 Listar Mediciones por Paciente...');
            const listMedicionesResponse = await makeAuthenticatedRequest(`${BASE_URL}/mediciones/paciente/${pacienteId}`);
            console.log(listMedicionesResponse.ok ? '✅ Listar mediciones exitoso' : '❌ Listar mediciones fallido');
            if (listMedicionesResponse.ok) testResults.mediciones.success++;
        }
        
        // Actualizar Medición (UPDATE)
        if (medicionId) {
            testResults.mediciones.total++;
            console.log('🔄 4.3 Actualizar Medición...');
            const updateMedicionResponse = await makeAuthenticatedRequest(`${BASE_URL}/mediciones/${medicionId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    peso: 76.0,
                    talla: 175
                })
            });
            console.log(updateMedicionResponse.ok ? '✅ Actualizar medición exitoso' : '❌ Actualizar medición fallido');
            if (updateMedicionResponse.ok) testResults.mediciones.success++;
        }
        
    } catch (error) {
        console.error('❌ Error en CRUD Mediciones:', error.message);
    }
    
    // ======================
    // 5. TEST CRUD RESULTADOS
    // ======================
    console.log('\n📊 === TEST CRUD RESULTADOS ===');
    
    let resultadoId = null;
    
    try {
        // Crear Resultado (CREATE)
        if (pacienteId) {
            testResults.resultados.total++;
            console.log('🔄 5.1 Crear Resultado...');
            const createResultadoResponse = await makeAuthenticatedRequest(`${BASE_URL}/resultados`, {
                method: 'POST',
                body: JSON.stringify({
                    id_paciente: pacienteId,
                    fecha: new Date().toISOString().split('T')[0],
                    masa_corporal: 75.5,
                    masa_muscular: 45.2,
                    masa_osea: 12.1,
                    masa_residual: 18.2,
                    porcentaje_grasa: 15.8,
                    imc: 24.7,
                    observaciones: 'Resultado de prueba para test CRUD'
                })
            });
            const createResultadoData = await createResultadoResponse.json();
            console.log(createResultadoResponse.ok ? '✅ Crear resultado exitoso' : '❌ Crear resultado fallido');
            if (createResultadoResponse.ok) {
                testResults.resultados.success++;
                resultadoId = createResultadoData.id || createResultadoData.resultado?.id_resultado;
                console.log(`📝 Resultado creado con ID: ${resultadoId}`);
            }
        }
        
        // Listar Resultados por Paciente (READ)
        if (pacienteId) {
            testResults.resultados.total++;
            console.log('🔄 5.2 Listar Resultados por Paciente...');
            const listResultadosResponse = await makeAuthenticatedRequest(`${BASE_URL}/resultados/paciente/${pacienteId}`);
            console.log(listResultadosResponse.ok ? '✅ Listar resultados exitoso' : '❌ Listar resultados fallido');
            if (listResultadosResponse.ok) testResults.resultados.success++;
        }
        
        // Obtener Resultado específico (READ)
        if (resultadoId) {
            testResults.resultados.total++;
            console.log('🔄 5.3 Obtener Resultado específico...');
            const getResultadoResponse = await makeAuthenticatedRequest(`${BASE_URL}/resultados/${resultadoId}`);
            console.log(getResultadoResponse.ok ? '✅ Obtener resultado específico exitoso' : '❌ Obtener resultado específico fallido');
            if (getResultadoResponse.ok) testResults.resultados.success++;
        }
        
        // Actualizar Resultado (UPDATE)
        if (resultadoId) {
            testResults.resultados.total++;
            console.log('🔄 5.4 Actualizar Resultado...');
            const updateResultadoResponse = await makeAuthenticatedRequest(`${BASE_URL}/resultados/${resultadoId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    masa_corporal: 76.0,
                    observaciones: 'Resultado actualizado en test CRUD'
                })
            });
            console.log(updateResultadoResponse.ok ? '✅ Actualizar resultado exitoso' : '❌ Actualizar resultado fallido');
            if (updateResultadoResponse.ok) testResults.resultados.success++;
        }
        
    } catch (error) {
        console.error('❌ Error en CRUD Resultados:', error.message);
    }
    
    // ======================
    // RESUMEN FINAL
    // ======================
    console.log('\n📋 ================================');
    console.log('📋 RESUMEN DEL TEST CRUD COMPLETO');
    console.log('📋 ================================');
    
    let totalTests = 0;
    let totalSuccess = 0;
    
    Object.keys(testResults).forEach(module => {
        const { success, total } = testResults[module];
        const percentage = total > 0 ? ((success / total) * 100).toFixed(1) : '0.0';
        const status = success === total ? '✅' : success > 0 ? '⚠️' : '❌';
        
        console.log(`${status} ${module.toUpperCase()}: ${success}/${total} (${percentage}%)`);
        totalTests += total;
        totalSuccess += success;
    });
    
    const overallPercentage = totalTests > 0 ? ((totalSuccess / totalTests) * 100).toFixed(1) : '0.0';
    const overallStatus = totalSuccess === totalTests ? '🎉' : totalSuccess > totalTests * 0.8 ? '✅' : totalSuccess > 0 ? '⚠️' : '❌';
    
    console.log('\n' + '='.repeat(40));
    console.log(`${overallStatus} RESULTADO GENERAL: ${totalSuccess}/${totalTests} (${overallPercentage}%)`);
    console.log('='.repeat(40));
    
    if (totalSuccess === totalTests) {
        console.log('🎊 ¡TODOS LOS CRUDS FUNCIONAN PERFECTAMENTE!');
    } else if (totalSuccess > totalTests * 0.8) {
        console.log('✅ La mayoría de CRUDs funcionan correctamente');
    } else if (totalSuccess > 0) {
        console.log('⚠️ Algunos CRUDs necesitan atención');
    } else {
        console.log('❌ Los CRUDs necesitan revisión');
    }
    
    console.log('\n🚀 Test CRUD completo finalizado\n');
}

// Ejecutar el test
testCRUDCompleto().catch(console.error);
