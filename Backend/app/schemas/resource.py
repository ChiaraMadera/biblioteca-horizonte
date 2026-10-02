from marshmallow import Schema, fields, validate

from app.extensions import ma
from app.models.resource import Resource


class ResourceSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Resource
        load_instance = True

    id = fields.String(dump_only=True)
    category = fields.String(
        validate=validate.OneOf(["Equipamiento", "Espacios", "Material bibliográfico"])
    )
    condition = fields.String(
        validate=validate.OneOf(["EXCELENTE", "BUENO", "EN_MANTENIMIENTO", "FUERA_DE_SERVICIO"])
    )
    available = fields.Boolean(load_default=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class CreateResourceSchema(Schema):
    id = fields.String(required=True, validate=validate.Length(min=1, max=100))
    name = fields.String(required=True, validate=validate.Length(min=2, max=150))
    category = fields.String(
        required=True,
        validate=validate.OneOf(["Equipamiento", "Espacios", "Material bibliográfico"]),
    )
    description = fields.String(required=True)
    info = fields.String(required=True)
    icon = fields.String(required=True, validate=validate.Length(max=50))
    available = fields.Boolean(load_default=True)
    condition = fields.String(
        validate=validate.OneOf(["EXCELENTE", "BUENO", "EN_MANTENIMIENTO", "FUERA_DE_SERVICIO"]),
        load_default="EXCELENTE",
    )
    serial_number = fields.String(validate=validate.Length(max=100))
    location = fields.String(validate=validate.Length(max=200))
    tone = fields.String(required=True, validate=validate.Length(max=100))


class UpdateResourceSchema(Schema):
    name = fields.String(validate=validate.Length(min=2, max=150))
    category = fields.String(
        validate=validate.OneOf(["Equipamiento", "Espacios", "Material bibliográfico"])
    )
    description = fields.String()
    info = fields.String()
    icon = fields.String(validate=validate.Length(max=50))
    available = fields.Boolean(load_default=True)
    condition = fields.String(
        validate=validate.OneOf(["EXCELENTE", "BUENO", "EN_MANTENIMIENTO", "FUERA_DE_SERVICIO"])
    )
    serial_number = fields.String(validate=validate.Length(max=100))
    location = fields.String(validate=validate.Length(max=200))
    tone = fields.String(validate=validate.Length(max=100))