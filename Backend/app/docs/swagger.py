"""Swagger UI para Biblioteca Horizonte.

Sirve:
- GET /api/docs/          -> Swagger UI (flask-swagger-ui)
- GET /openapi.yaml       -> especificación OpenAPI 3.0 (fuente única)

La especificación vive en app/docs/openapi.yaml y se valida en tests.
"""

import os
from flask import Blueprint, send_from_directory
from flask_swagger_ui import get_swaggerui_blueprint

SWAGGER_URL = "/api/docs"
OPENAPI_URL = "/openapi.yaml"

swagger_ui_bp = get_swaggerui_blueprint(
    SWAGGER_URL,
    OPENAPI_URL,
    config={"app_name": "Biblioteca Horizonte API"},
)

docs_bp = Blueprint("docs", __name__)


@docs_bp.route("/openapi.yaml", methods=["GET"])
def openapi_yaml():
    directory = os.path.join(os.path.dirname(__file__))
    return send_from_directory(directory, "openapi.yaml", mimetype="text/yaml")
