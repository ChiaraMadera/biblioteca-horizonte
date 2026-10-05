"""
Script de migración de recursos para Biblioteca Horizonte.

Este script reemplaza los recursos existentes con la lista fija correcta:
- 2 proyectores
- 4 notebooks

Uso:
    python seed.py

Nota: Este script es destructivo - elimina todos los recursos existentes
y los reemplaza con los datos correctos según el análisis técnico (B-07).
"""

from app import create_app
from app.extensions import db
from app.models.resource import Resource

# Lista fija de recursos según análisis técnico (B-07)
RESOURCES = [
    {
        "id": "proyector-01",
        "name": "Proyector Epson EB-X06",
        "category": "Equipamiento",
        "description": "Proyector Full HD para presentaciones en aula.",
        "info": "Resolución 1080p, 3600 lúmenes, HDMI/VGA. Incluye control remoto.",
        "icon": "Projector",
        "available": True,
        "condition": "EXCELENTE",
        "serial_number": "EPS-EBX06-001",
        "location": "Biblioteca · Estantería A1",
        "tone": "bg-blue-50 text-blue-600",
    },
    {
        "id": "proyector-02",
        "name": "Proyector BenQ MW550",
        "category": "Equipamiento",
        "description": "Proyector portátil para uso en distintos espacios.",
        "info": "Resolución WXGA, 3600 lúmenes, HDMI. Incluye estuche de transporte.",
        "icon": "Projector",
        "available": True,
        "condition": "BUENO",
        "serial_number": "BNQ-MW550-002",
        "location": "Biblioteca · Estantería A2",
        "tone": "bg-blue-50 text-blue-600",
    },
    {
        "id": "notebook-01",
        "name": "Notebook Lenovo ThinkPad E14",
        "category": "Equipamiento",
        "description": "Notebook para uso pedagógico en biblioteca.",
        "info": "Intel Core i5, 8GB RAM, 256GB SSD, Windows 11 Pro.",
        "icon": "Laptop",
        "available": True,
        "condition": "EXCELENTE",
        "serial_number": "LEN-E14-001",
        "location": "Biblioteca · Estantería B1",
        "tone": "bg-green-50 text-green-600",
    },
    {
        "id": "notebook-02",
        "name": "Notebook HP 255 G8",
        "category": "Equipamiento",
        "description": "Notebook para uso pedagógico en biblioteca.",
        "info": "AMD Ryzen 5, 8GB RAM, 256GB SSD, Windows 11 Pro.",
        "icon": "Laptop",
        "available": True,
        "condition": "BUENO",
        "serial_number": "HP-255G8-002",
        "location": "Biblioteca · Estantería B2",
        "tone": "bg-green-50 text-green-600",
    },
    {
        "id": "notebook-03",
        "name": "Notebook Dell Latitude 3520",
        "category": "Equipamiento",
        "description": "Notebook para uso pedagógico en biblioteca.",
        "info": "Intel Core i5, 16GB RAM, 512GB SSD, Windows 11 Pro.",
        "icon": "Laptop",
        "available": True,
        "condition": "EXCELENTE",
        "serial_number": "DEL-3520-003",
        "location": "Biblioteca · Estantería B3",
        "tone": "bg-green-50 text-green-600",
    },
    {
        "id": "notebook-04",
        "name": "Notebook Acer Aspire 5",
        "category": "Equipamiento",
        "description": "Notebook para uso pedagógico en biblioteca.",
        "info": "AMD Ryzen 7, 16GB RAM, 512GB SSD, Windows 11 Home.",
        "icon": "Laptop",
        "available": True,
        "condition": "BUENO",
        "serial_number": "ACE-AS5-004",
        "location": "Biblioteca · Estantería B4",
        "tone": "bg-green-50 text-green-600",
    },
]


def migrate_resources():
    """
    Reemplaza todos los recursos existentes con la lista fija correcta.
    
    Este script:
    1. Elimina todos los recursos existentes
    2. Inserta los 6 recursos correctos (2 proyectores, 4 notebooks)
    """
    app = create_app()
    with app.app_context():
        # Contar recursos existentes
        existing_count = Resource.query.count()
        print(f"Recursos existentes: {existing_count}")
        
        if existing_count > 0:
            print("\nADVERTENCIA: Se eliminarán todos los recursos existentes.")
            print("   Esto es necesario para cumplir con la lista fija del análisis técnico (B-07).")
            print()
            
            # Eliminar recursos existentes
            Resource.query.delete()
            db.session.commit()
            print(f"✓ Eliminados {existing_count} recursos existentes.")
        
        # Insertar recursos correctos
        print("\nInsertando recursos correctos...")
        for resource_data in RESOURCES:
            resource = Resource(**resource_data)
            db.session.add(resource)
            print(f"  ✓ {resource_data['id']}: {resource_data['name']}")
        
        db.session.commit()
        
        # Verificar
        final_count = Resource.query.count()
        print(f"\n✓ Migración completada: {final_count} recursos en la base de datos.")
        print("  - 2 proyectores")
        print("  - 4 notebooks")


if __name__ == "__main__":
    migrate_resources()
