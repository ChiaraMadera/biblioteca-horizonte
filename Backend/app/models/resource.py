from datetime import datetime

from app.extensions import db


class Resource(db.Model):
    __tablename__ = "resources"

    id = db.Column(db.String(100), primary_key=True)  # slug: "proyector", "microfono-inalambrico"
    name = db.Column(db.String(150), nullable=False)
    category = db.Column(
        db.Enum("Equipamiento", "Espacios", "Material bibliográfico", name="resource_category_enum"),
        nullable=False,
    )
    description = db.Column(db.Text, nullable=False)
    info = db.Column(db.Text, nullable=False)
    icon = db.Column(db.String(50), nullable=False)
    available = db.Column(db.Boolean, default=True, nullable=False)
    condition = db.Column(
        db.Enum("EXCELENTE", "BUENO", "EN_MANTENIMIENTO", "FUERA_DE_SERVICIO", name="resource_condition_enum"),
        nullable=False,
        default="EXCELENTE",
    )
    serial_number = db.Column(db.String(100), nullable=True)
    location = db.Column(db.String(200), nullable=True)
    tone = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relaciones
    requests = db.relationship("Request", backref="resource", lazy="dynamic")

    def __repr__(self):
        return f"<Resource {self.name}>"
