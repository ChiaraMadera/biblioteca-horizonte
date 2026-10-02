from marshmallow import Schema, fields, validate, validates_schema
from datetime import date

from app.extensions import ma
from app.models.request import Request


# Mapeo de módulos válidos por turno
SHIFT_MODULES = {
    "Mañana · 08:00–12:00": [
        "Módulo 1 · 08:00–09:20",
        "Módulo 2 · 09:30–10:50",
        "Módulo 3 · 11:00–12:00",
    ],
    "Tarde · 13:00–17:00": [
        "Módulo 1 · 13:00–14:20",
        "Módulo 2 · 14:30–15:50",
        "Módulo 3 · 16:00–17:00",
    ],
}


class RequestSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Request
        load_instance = True

    id = fields.String(dump_only=True)
    resource_id = fields.String(required=True)
    user_id = fields.String(dump_only=True)
    teacher = fields.String(required=True, validate=validate.Length(max=100))
    date = fields.Date(required=True)
    shift = fields.String(
        required=True,
        validate=validate.OneOf([
            "Mañana · 08:00–12:00",
            "Tarde · 13:00–17:00",
        ]),
    )
    module = fields.String(
        required=True,
        validate=validate.OneOf([
            "Módulo 1 · 08:00–09:20",
            "Módulo 2 · 09:30–10:50",
            "Módulo 3 · 11:00–12:00",
            "Módulo 1 · 13:00–14:20",
            "Módulo 2 · 14:30–15:50",
            "Módulo 3 · 16:00–17:00",
        ]),
    )
    notes = fields.String(validate=validate.Length(max=500))
    status = fields.String(
        validate=validate.OneOf(["PENDIENTE", "CONFIRMADA", "RECHAZADA", "CANCELADA"])
    )
    created_at = fields.DateTime(dump_only=True)
    reviewed_by = fields.String(dump_only=True)
    reviewed_at = fields.DateTime(dump_only=True)


class CreateRequestSchema(Schema):
    resource_id = fields.String(required=True)
    teacher = fields.String(required=True, validate=validate.Length(max=100))
    date = fields.Date(required=True)
    shift = fields.String(
        required=True,
        validate=validate.OneOf([
            "Mañana · 08:00–12:00",
            "Tarde · 13:00–17:00",
        ]),
    )
    module = fields.String(
        required=True,
        validate=validate.OneOf([
            "Módulo 1 · 08:00–09:20",
            "Módulo 2 · 09:30–10:50",
            "Módulo 3 · 11:00–12:00",
            "Módulo 1 · 13:00–14:20",
            "Módulo 2 · 14:30–15:50",
            "Módulo 3 · 16:00–17:00",
        ]),
    )
    notes = fields.String(validate=validate.Length(max=500))

    @validates_schema
    def validate_shift_module_consistency(self, data, **kwargs):
        """B-04: Validar que el módulo corresponda al turno seleccionado."""
        shift = data.get("shift")
        module = data.get("module")
        if shift and module:
            valid_modules = SHIFT_MODULES.get(shift, [])
            if module not in valid_modules:
                raise validate.ValidationError(
                    f"El módulo '{module}' no corresponde al turno '{shift}'.",
                    field_name="module"
                )

    @validates_schema
    def validate_date_not_past(self, data, **kwargs):
        """B-04: Validar que la fecha no sea anterior a hoy."""
        date_value = data.get("date")
        if date_value and date_value < date.today():
            raise validate.ValidationError(
                "La fecha no puede ser anterior a hoy.",
                field_name="date"
            )
