from flask import jsonify
from marshmallow import ValidationError
from sqlalchemy.exc import IntegrityError


def register_error_handlers(app):
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({"error": "Bad Request", "message": str(error)}), 400

    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({"error": "Unauthorized", "message": "Autenticación requerida."}), 401

    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({"error": "Forbidden", "message": "Acceso denegado."}), 403

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Not Found", "message": "Recurso no encontrado."}), 404

    @app.errorhandler(409)
    def conflict(error):
        return jsonify({"error": "Conflict", "message": str(error)}), 409

    @app.errorhandler(ValidationError)
    def handle_validation_error(error):
        return (
            jsonify(
                {
                    "error": "Validation Error",
                    "message": "Datos inválidos.",
                    "fieldErrors": error.messages,
                }
            ),
            422,
        )

    @app.errorhandler(IntegrityError)
    def handle_integrity_error(error):
        return (
            jsonify(
                {
                    "error": "Conflict",
                    "message": "Conflicto de datos. Verificá que no existan duplicados.",
                }
            ),
            409,
        )

    @app.errorhandler(Exception)
    def handle_generic_error(error):
        return (
            jsonify({"error": "Internal Server Error", "message": "Ocurrió un error inesperado."}),
            500,
        )
