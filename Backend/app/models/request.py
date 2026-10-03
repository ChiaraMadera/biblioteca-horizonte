import uuid
from datetime import datetime

from app.extensions import db
from sqlalchemy import Index
from datetime import datetime
from zoneinfo import ZoneInfo


class Request(db.Model):
    __tablename__ = "requests"

    id = db.Column(db.String(10), primary_key=True)  # "BH-0018"
    resource_id = db.Column(db.String(100), db.ForeignKey("resources.id"), nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    teacher = db.Column(db.String(100), nullable=False)
    date = db.Column(db.Date, nullable=False)
    shift = db.Column(
        db.Enum(
            "Mañana · 08:00–12:00",
            "Tarde · 13:00–17:00",
            name="shift_enum",
        ),
        nullable=False,
    )
    module = db.Column(
        db.Enum(
            "Módulo 1 · 08:00–09:20",
            "Módulo 2 · 09:30–10:50",
            "Módulo 3 · 11:00–12:00",
            "Módulo 1 · 13:00–14:20",
            "Módulo 2 · 14:30–15:50",
            "Módulo 3 · 16:00–17:00",
            name="module_enum",
        ),
        nullable=False,
    )
    notes = db.Column(db.String(500), nullable=True)
    status = db.Column(
        db.Enum("PENDIENTE", "CONFIRMADA", "RECHAZADA", "CANCELADA", name="request_status_enum"),
        nullable=False,
        default="PENDIENTE",
    )
    created_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(ZoneInfo("America/Argentina/Cordoba")),
        nullable=False
    )
    reviewed_by = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=True)
    reviewed_at = db.Column(db.DateTime, nullable=True)

    # Relación con el revisor
    reviewer = db.relationship("User", foreign_keys=[reviewed_by], lazy="joined")

    __table_args__ = (
        Index(
            "uq_confirmed_request_slot",
            "resource_id",
            "date",
            "shift",
            "module",
            unique=True,
            sqlite_where=db.text("status = 'CONFIRMADA'"),
            postgresql_where=db.text("status = 'CONFIRMADA'"),
        ),
        
    )

    def __repr__(self):
        return f"<Request {self.id}>"
    