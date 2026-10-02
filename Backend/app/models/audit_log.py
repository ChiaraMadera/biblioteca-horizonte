import uuid
from datetime import datetime

from app.extensions import db


class AuditLog(db.Model):
    __tablename__ = "audit_logs"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    actor_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    action = db.Column(db.String(50), nullable=False)  # CREATE_USER | UPDATE_RESOURCE | etc.
    target_entity = db.Column(db.String(50), nullable=False)  # Resource | User | Request
    target_id = db.Column(db.String(100), nullable=False)
    details = db.Column(db.JSON, nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<AuditLog {self.action} on {self.target_entity}>"
