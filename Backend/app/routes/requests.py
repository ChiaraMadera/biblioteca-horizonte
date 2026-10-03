from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.schemas.request import RequestSchema, CreateRequestSchema
from app.services import request_service
from app.utils.decorators import role_required
from app.models.user import User

requests_bp = Blueprint("requests", __name__)
request_schema = RequestSchema()
requests_schema = RequestSchema(many=True)
create_request_schema = CreateRequestSchema()


@requests_bp.route("/", methods=["GET"])
@jwt_required()
def list_requests():
    status = request.args.get("status")
    user_id = request.args.get("user_id")
    resource_id = request.args.get("resource_id")

    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user:
        return jsonify({
            "error": "Unauthorized",
            "message": "Usuario no encontrado."
        }), 401

    if current_user.role == "docente":
        user_id = current_user_id

    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    result = request_service.get_requests(
        status=status,
        user_id=user_id,
        resource_id=resource_id,
        page=page,
        per_page=per_page,
    )

    return jsonify({
        "items": requests_schema.dump(result.items),
        "page": result.page,
        "per_page": result.per_page,
        "total": result.total,
        "pages": result.pages,
    }), 200
@requests_bp.route("/availability", methods=["GET"])
@jwt_required()
def get_availability():
    resource_id = request.args.get("resource_id")
    date = request.args.get("date")

    if not resource_id or not date:
        return jsonify({
            "error": "Bad Request",
            "message": "resource_id y date son obligatorios."
        }), 400

    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    include_details = current_user and current_user.role in ["admin", "bibliotecaria"]

    slots = request_service.get_availability(
        resource_id=resource_id,
        date=date,
        include_details=include_details
)

    return jsonify({
        "slots": slots
    }), 200

@requests_bp.route("/<request_id>", methods=["GET"])
@jwt_required()
def get_request(request_id):
    req = request_service.get_request_by_id(request_id)
    if not req:
        return jsonify({"error": "Not Found", "message": "Solicitud no encontrada."}), 404

    # B-05: Validar que el usuario sea el dueño o admin
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user:
        return jsonify({"error": "Unauthorized", "message": "Usuario no encontrado."}), 401

    is_owner = req.user_id == current_user_id
    is_admin = current_user.role in ["admin", "bibliotecaria"]

    if not is_owner and not is_admin:
        return jsonify({"error": "Forbidden", "message": "No tenés permiso para ver esta solicitud."}), 403

    return jsonify(request_schema.dump(req)), 200


@requests_bp.route("/", methods=["POST"])
@jwt_required()
def create_request():
    data = create_request_schema.load(request.get_json())
    user_id = get_jwt_identity()

    req, error = request_service.create_request(data, user_id)

    if error:
        if error == "Recurso no encontrado.":
            return jsonify({
                "error": "Not Found",
                "message": error
            }), 404

        if "reservado" in error.lower() or "disponible" in error.lower():
            return jsonify({
                "error": "Conflict",
                "message": error
            }), 409

        return jsonify({
            "error": "Unprocessable Entity",
            "message": error
        }), 422

    return jsonify(request_schema.dump(req)), 201


@requests_bp.route("/<request_id>/review", methods=["PATCH"])
@jwt_required()
@role_required("admin", "bibliotecaria")
def review_request(request_id):
    data = request.get_json()
    new_status = data.get("status")
    reviewer_id = get_jwt_identity()

    req, error = request_service.review_request(
        request_id,
        new_status,
        reviewer_id
    )

    if error:
        if error == "Solicitud no encontrada.":
            return jsonify({
                "error": "Not Found",
                "message": error
            }), 404

        if "reservado" in error.lower() or "disponible" in error.lower():
            return jsonify({
                "error": "Conflict",
                "message": error
            }), 409

        return jsonify({
            "error": "Bad Request",
            "message": error
        }), 400

    return jsonify(request_schema.dump(req)), 200