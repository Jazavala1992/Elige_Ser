#!/bin/bash

# 🧪 Script completo de pruebas CRUD para ElijeSer Backend
# Servidor: http://localhost:4006

echo "🚀 === PRUEBAS CRUD COMPLETAS ElijeSer ==="
echo "🔗 Servidor: http://localhost:4006"
echo ""

# Función para mostrar resultados
test_endpoint() {
    echo "📍 $1"
    echo "🔗 $2"
    response=$(curl -s -w "HTTP_STATUS:%{http_code}" "$2")
    http_status=$(echo $response | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
    body=$(echo $response | sed 's/HTTP_STATUS:[0-9]*$//')
    
    echo "   Status: $http_status"
    if [ ! -z "$body" ] && [ "$body" != "null" ]; then
        echo "   Body: $body" | head -c 300
        if [ ${#body} -gt 300 ]; then echo "..."; fi
    else
        echo "   Body: (vacío)"
    fi
    echo ""
}

# ===== HEALTH CHECKS =====
echo "🏥 === HEALTH CHECKS ==="
test_endpoint "Health Check" "http://localhost:4006/health"
test_endpoint "Debug Connection" "http://localhost:4006/api/debug/connection"

# ===== PACIENTES CRUD =====
echo "👥 === PACIENTES CRUD ==="
test_endpoint "Debug Table Structure" "http://localhost:4006/api/debug/table-structure"
test_endpoint "GET Todos los Pacientes" "http://localhost:4006/api/pacientes"
test_endpoint "Debug Pacientes Usuario 1" "http://localhost:4006/api/debug/pacientes/1"

# ===== USUARIOS CRUD =====
echo "🔐 === USUARIOS CRUD ==="
test_endpoint "GET Usuario por ID (temporal)" "http://localhost:4006/api/usuario/1"

echo "✅ === FIN DE PRUEBAS BÁSICAS ==="
echo ""
echo "🔄 === PROBANDO OTROS MÓDULOS ==="

# Probar otros endpoints que puedan existir
for module in consultas mediciones resultados registros; do
    echo "📦 === $module ==="
    test_endpoint "GET $module" "http://localhost:4006/api/$module"
done

echo "🎯 === TODAS LAS PRUEBAS COMPLETADAS ==="
