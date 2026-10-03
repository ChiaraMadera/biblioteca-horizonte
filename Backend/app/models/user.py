import uuid
from datetime import datetime
from zoneinfo import ZoneInfo

from app.extensions import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum("docente", "bibliotecaria", "admin", name="role_enum"), nullable=False)
    status = db.Column(
        db.Enum("ACTIVO", "INACTIVO", "SUSPENDIDO", name="user_status_enum"),
        nullable=False,
        default="ACTIVO",
    )
    dni = db.Column(db.String(20), unique=True, nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    created_at = db.Column(
    db.DateTime,
    default=lambda: datetime.now(ZoneInfo("America/Argentina/Cordoba")),
    nullable=False
)
    updated_at = db.Column(
        db.DateTime,
    default=lambda: datetime.now(ZoneInfo("America/Argentina/Cordoba")),
    onupdate=lambda: datetime.now(ZoneInfo("America/Argentina/Cordoba")),
    nullable=False
    )

    # Relaciones
    requests = db.relationship("Request", foreign_keys="Request.user_id", backref="user", lazy="dynamic")
    audit_logs = db.relationship("AuditLog", backref="actor", lazy="dynamic")

    def __repr__(self):
        return f"<User {self.email}>"
