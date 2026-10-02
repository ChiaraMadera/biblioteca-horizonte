"""
Script para restablecer las contraseñas de los usuarios.

Este script permite restablecer las contraseñas de los usuarios existentes
a valores conocidos para facilitar el acceso al sistema.

Uso:
    python reset_passwords.py

Contraseñas restablecidas:
- admin@horizonte.edu.ar → Admin123!
- biblioteca@horizonte.edu.ar → Biblioteca123!
- docente1@horizonte.edu.ar → Docente123!
- docente2@horizonte.edu.ar → Docente123!
"""

from app import create_app
from app.extensions import db
from app.models.user import User
from werkzeug.security import generate_password_hash

# Contraseñas por email
PASSWORDS = {
    "admin@horizonte.edu.ar": "Admin123!",
    "biblioteca@horizonte.edu.ar": "Biblioteca123!",
    "docente1@horizonte.edu.ar": "Docente123!",
    "docente2@horizonte.edu.ar": "Docente123!",
}


def reset_passwords():
    """Restablece las contraseñas de los usuarios existentes."""
    app = create_app()
    with app.app_context():
        print("Restableciendo contraseñas de usuarios...\n")
        
        for email, new_password in PASSWORDS.items():
            user = User.query.filter_by(email=email).first()
            if user:
                user.password_hash = generate_password_hash(new_password)
                print(f"  ✓ {email} → {new_password}")
            else:
                print(f"  ✗ Usuario no encontrado: {email}")
        
        db.session.commit()
        print("\n✓ Contraseñas restablecidas exitosamente.")
        print("\nCredenciales de acceso:")
        print("  Admin:        admin@horizonte.edu.ar / Admin123!")
        print("  Bibliotecaria: biblioteca@horizonte.edu.ar / Biblioteca123!")
        print("  Docente 1:    docente1@horizonte.edu.ar / Docente123!")
        print("  Docente 2:    docente2@horizonte.edu.ar / Docente123!")


if __name__ == "__main__":
    reset_passwords()
