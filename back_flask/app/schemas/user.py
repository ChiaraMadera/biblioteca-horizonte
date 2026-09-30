from marshmallow import Schema, fields, validate

from app.extensions import ma
from app.models.user import User


class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = True
        exclude = ("password_hash",)

    id = fields.String(dump_only=True)
    email = fields.Email(required=True)
    role = fields.String(validate=validate.OneOf(["docente", "bibliotecaria", "admin"]))
    status = fields.String(validate=validate.OneOf(["ACTIVO", "INACTIVO", "SUSPENDIDO"]))
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class CreateUserSchema(Schema):
    name = fields.String(required=True, validate=validate.Length(min=2, max=100))
    email = fields.Email(required=True)
    password = fields.String(required=True, validate=validate.Length(min=8), load_only=True)
    role = fields.String(
        required=True, validate=validate.OneOf(["docente", "bibliotecaria", "admin"])
    )
    dni = fields.String(validate=validate.Length(max=20))
    phone = fields.String(validate=validate.Length(max=20))


class UpdateUserSchema(Schema):
    name = fields.String(validate=validate.Length(min=2, max=100))
    email = fields.Email()
    role = fields.String(validate=validate.OneOf(["docente", "bibliotecaria", "admin"]))
    status = fields.String(validate=validate.OneOf(["ACTIVO", "INACTIVO", "SUSPENDIDO"]))
    dni = fields.String(validate=validate.Length(max=20))
    phone = fields.String(validate=validate.Length(max=20))
