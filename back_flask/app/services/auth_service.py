from werkzeug.security import check_password_hash
from flask_jwt_extended import create_access_token

from app.extensions import db
from app.models.user import User


def authenticate_user(email: str, password: str, role: str):
    """Autentica un usuario y retorna el token JWT + datos del usuario."""
    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password_hash, password):
        return None, "Credenciales inválidas."

    if user.role != role:
        return None, "El rol no coincide con el usuario."

    if user.status != "ACTIVO":
        return None, "La cuenta no está activa."

    token = create_access_token(identity=user.id)
    return {"token": token, "user": user}, None
