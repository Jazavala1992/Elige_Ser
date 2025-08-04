// Script de debug para verificar el estado del frontend en producción

console.log("=== DEBUG FRONTEND PRODUCCIÓN ===");
console.log("1. LocalStorage token:", localStorage.getItem("token"));
console.log("2. LocalStorage userId:", localStorage.getItem("userId"));
console.log("3. Modo de ambiente:", import.meta.env.MODE);
console.log("4. URL base actual:", window.location.origin);

// Probar login
async function testLoginProduccion() {
    try {
        const response = await fetch('https://elige-ser-backend.onrender.com/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@admin.com',
                password: 'admin123'
            })
        });
        
        const data = await response.json();
        console.log("5. Login response:", data);
        
        if (data.success && data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("userId", data.user.id);
            console.log("6. Token guardado en localStorage");
            
            // Probar API de pacientes
            const pacientesResponse = await fetch(`https://elige-ser-backend.onrender.com/api/pacientes/${data.user.id}`, {
                headers: { 'Authorization': `Bearer ${data.token}` }
            });
            
            const pacientesData = await pacientesResponse.json();
            console.log("7. Pacientes response:", pacientesData);
        }
        
    } catch (error) {
        console.error("Error en test:", error);
    }
}

// Ejecutar después de 2 segundos para dar tiempo a cargar la página
setTimeout(testLoginProduccion, 2000);
