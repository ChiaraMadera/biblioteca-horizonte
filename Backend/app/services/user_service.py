from werkzeug.security import generate_password_hash

from app.extensions import db
from app.models.user import User
from app.models.audit_log import AuditLog


def get_users(role=None, status=None, search=None, page=1, limit=10):
    query = User.query

    if role:
        query = query.filter_by(role=role)
    if status:
        query = query.filter_by(status=status)
    if search:
        like = f"%{search}%"
        query = query.filter(
            db.or_(User.name.ilike(like), User.email.ilike(like), User.dni.ilike(like))
        )

    pagination = query.order_by(User.created_at.desc()).paginate(
        page=page, per_page=limit, error_out=False
    )
    return pagination.items, pagination.total


def get_user_by_id(user_id: str):
    return User.query.get(user_id)


def create_user(data: dict, actor_id: str = None):
    if User.query.filter_by(email=data["email"]).first():
        return None, "El email ingresado ya pertenece a un usuario registrado."

    if data.get("dni") and User.query.filter_by(dni=data["dni"]).first():
        return None, "El DNI ingresado ya pertenece a un usuario registrado."

    user = User(
        name=data["name"],
        email=data["email"],
        password_hash=generate_password_hash(data["password"]),
        role=data["role"],
        dni=data.get("dni"),
        phone=data.get("phone"),
    )
    db.session.add(user)
    db.session.flush()

    _log_audit(actor_id, "CREATE_USER", "User", user.id, {"email": user.email})

    db.session.commit()
    return user, None


def update_user(user_id: str, data: dict, actor_id: str = None):
    user = User.query.get(user_id)
    if not user:
        return None, "Usuario no encontrado."

    for field in ["name", "email", "role", "status", "dni", "phone"]:
        if field in data:
            setattr(user, field, data[field])

    _log_audit(actor_id, "UPDATE_USER", "User", user.id, data)
    db.session.commit()
    return user, None


def delete_user(user_id: str, actor_id: str = None):
    user = User.query.get(user_id)
    if not user:
        return None, "Usuario no encontrado."

    user.status = "INACTIVO"  # Baja lógica
    _log_audit(actor_id, "DELETE_USER", "User", user.id, {"email": user.email})
    db.session.commit()
    return user, None


def _log_audit(actor_id, action, target_entity, target_id, details):
    log = AuditLog(
        actor_id=actor_id,
        action=action,
        target_entity=target_entity,
        target_id=target_id,
        details=details,
    )
    db.session.add(log)
