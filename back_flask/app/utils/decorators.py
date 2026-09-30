from functools import wraps

from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request

from app.models.user import User


def role_required(*allowed_roles):
    """Decorador para restringir acceso por rol."""

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            user = User.query.get(user_id)

            if not user:
                return jsonify({"error": "Unauthorized", "message": "Usuario no encontrado."}), 401

            if user.status != "ACTIVO":
                return jsonify({"error": "Forbidden", "message": "Cuenta no activa."}), 403

            if user.role not in allowed_roles:
                return (
                    jsonify({"error": "Forbidden", "message": "No tenés permiso para esta acción."}),
                    403,
                )

            return fn(*args, **kwargs)

        return wrapper

    return decorator
