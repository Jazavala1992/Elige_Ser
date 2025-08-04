#!/bin/bash

for file in *.js; do
    echo "Procesando $file..."
    
    # Crear archivo temporal
    temp_file="${file}.tmp"
    
    # Procesar línea por línea
    while IFS= read -r line; do
        if [[ $line == *"\$PLACEHOLDER"* ]]; then
            # Contar cuántos placeholders hay en la línea y reemplazarlos secuencialmente
            counter=1
            new_line="$line"
            while [[ $new_line == *"\$PLACEHOLDER"* ]]; do
                new_line=$(echo "$new_line" | sed "s/\\\$PLACEHOLDER/\\\$$counter/")
                ((counter++))
            done
            echo "$new_line"
        else
            echo "$line"
        fi
    done < "$file" > "$temp_file"
    
    # Reemplazar archivo original
    mv "$temp_file" "$file"
    
    echo "✅ $file convertido"
done

echo "🚀 Todos los controllers convertidos a PostgreSQL"
