#!/bin/bash

# 🧪 Script de pruebas CRUD para ElijeSer Backend
# Servidor: http://localhost:4004

echo "🚀 === INICIO DE PRUEBAS CRUD ElijeSer ==="
echo "🔗 Servidor: http://localhost:4004"
echo ""

# Función para mostrar resultados
test_endpoint() {
    echo "📍 Probando: $1"
    echo "🔗 Endpoint: $2"
    echo "📊 Respuesta:"
    response=$(curl -s -w "HTTP_STATUS:%{http_code}" "$2")
    http_status=$(echo $response | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
    body=$(echo $response | sed 's/HTTP_STATUS:[0-9]*$//')
    
    echo "   Status: $http_status"
    if [ ! -z "$body" ]; then
        echo "   Body: $body" | head -c 200
        if [ ${#body} -gt 200 ]; then echo "..."; fi
    else
        echo "   Body: (vacío)"
    fi
    echo ""
}

# 1. Health Check
test_endpoint "Health Check" "http://localhost:4004/health"

# 2. Debug Connection
test_endpoint "Debug Connection" "http://localhost:4004/api/debug/connection"

# 3. Usuarios CRUD
test_endpoint "GET Usuarios" "http://localhost:4004/api/usuarios"

# 4. Pacientes CRUD
test_endpoint "GET Pacientes" "http://localhost:4004/api/pacientes"

# 5. Consultas CRUD
test_endpoint "GET Consultas" "http://localhost:4004/api/consultas"

# 6. Mediciones CRUD
test_endpoint "GET Mediciones" "http://localhost:4004/api/mediciones"

# 7. Resultados CRUD
test_endpoint "GET Resultados" "http://localhost:4004/api/resultados"

# 8. Registros CRUD
test_endpoint "GET Registros" "http://localhost:4004/api/registros"

echo "✅ === FIN DE PRUEBAS CRUD ==="
