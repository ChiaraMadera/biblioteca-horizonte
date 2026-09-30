from marshmallow import Schema, fields, validate


class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.String(required=True, load_only=True)
    role = fields.String(
        required=True, validate=validate.OneOf(["docente", "bibliotecaria", "admin"])
    )
