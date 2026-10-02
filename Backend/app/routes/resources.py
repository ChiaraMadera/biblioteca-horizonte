from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.schemas.resource import ResourceSchema, CreateResourceSchema, UpdateResourceSchema
from app.services import resource_service
from app.utils.decorators import role_required

resources_bp = Blueprint("resources", __name__)
resource_schema = ResourceSchema()
resources_schema = ResourceSchema(many=True)
create_resource_schema = CreateResourceSchema()
update_resource_schema = UpdateResourceSchema()


@resources_bp.route("/", methods=["GET"])
@jwt_required()
def list_resources():
    category = request.args.get("category")
    available = request.args.get("available")
    if available is not None:
        available = available.lower() == "true"

    # B-06: Paginación
    page = request.args.get("page", type=int)
    limit = request.args.get("limit", type=int)

    result = resource_service.get_resources(category=category, available=available, page=page, limit=limit)

    # Si es un objeto paginado
    if hasattr(result, "items"):
        return jsonify({
            "data": resources_schema.dump(result.items),
            "total": result.total,
            "page": result.page,
            "pages": result.pages,
            "per_page": result.per_page,
        }), 200

    return jsonify(resources_schema.dump(result)), 200


@resources_bp.route("/<resource_id>", methods=["GET"])
@jwt_required()
def get_resource(resource_id):
    resource = resource_service.get_resource_by_id(resource_id)
    if not resource:
        return jsonify({"error": "Not Found", "message": "Recurso no encontrado."}), 404
    return jsonify(resource_schema.dump(resource)), 200


@resources_bp.route("/", methods=["POST"])
@jwt_required()
@role_required("admin", "bibliotecaria")
def create_resource():
    data = create_resource_schema.load(request.get_json())
    actor_id = get_jwt_identity()

    resource, error = resource_service.create_resource(data, actor_id=actor_id)
    if error:
        return jsonify({"error": "Conflict", "message": error}), 409

    return jsonify(resource_schema.dump(resource)), 201


@resources_bp.route("/<resource_id>", methods=["PUT"])
@jwt_required()
@role_required("admin", "bibliotecaria")
def update_resource(resource_id):
    data = update_resource_schema.load(request.get_json())
    actor_id = get_jwt_identity()

    resource, error = resource_service.update_resource(resource_id, data, actor_id=actor_id)
    if error:
        return jsonify({"error": "Not Found", "message": error}), 404

    return jsonify(resource_schema.dump(resource)), 200


@resources_bp.route("/<resource_id>", methods=["DELETE"])
@jwt_required()
@role_required("admin")
def delete_resource(resource_id):
    actor_id = get_jwt_identity()
    resource, error = resource_service.delete_resource(resource_id, actor_id=actor_id)
    if error:
        return jsonify({"error": "Not Found", "message": error}), 404

    return jsonify({"message": "Recurso dado de baja."}), 200
