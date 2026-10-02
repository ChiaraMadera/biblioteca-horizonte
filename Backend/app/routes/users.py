from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.schemas.user import UserSchema, CreateUserSchema, UpdateUserSchema
from app.services import user_service
from app.utils.decorators import role_required

users_bp = Blueprint("users", __name__)
user_schema = UserSchema()
users_schema = UserSchema(many=True)
create_user_schema = CreateUserSchema()
update_user_schema = UpdateUserSchema()


@users_bp.route("/", methods=["GET"])
@jwt_required()
@role_required("admin", "bibliotecaria")
def list_users():
    role = request.args.get("role")
    status = request.args.get("status")
    search = request.args.get("search")
    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 10, type=int)

    users, total = user_service.get_users(
        role=role, status=status, search=search, page=page, limit=limit
    )
    return jsonify({"data": users_schema.dump(users), "total": total}), 200


@users_bp.route("/<user_id>", methods=["GET"])
@jwt_required()
@role_required("admin", "bibliotecaria")
def get_user(user_id):
    user = user_service.get_user_by_id(user_id)
    if not user:
        return jsonify({"error": "Not Found", "message": "Usuario no encontrado."}), 404
    return jsonify(user_schema.dump(user)), 200


@users_bp.route("/", methods=["POST"])
@jwt_required()
@role_required("admin")
def create_user():
    data = create_user_schema.load(request.get_json())
    actor_id = get_jwt_identity()

    user, error = user_service.create_user(data, actor_id=actor_id)
    if error:
        return jsonify({"error": "Conflict", "message": error}), 409

    return jsonify(user_schema.dump(user)), 201


@users_bp.route("/<user_id>", methods=["PUT"])
@jwt_required()
@role_required("admin")
def update_user(user_id):
    data = update_user_schema.load(request.get_json())
    actor_id = get_jwt_identity()

    user, error = user_service.update_user(user_id, data, actor_id=actor_id)
    if error:
        return jsonify({"error": "Not Found", "message": error}), 404

    return jsonify(user_schema.dump(user)), 200


@users_bp.route("/<user_id>", methods=["DELETE"])
@jwt_required()
@role_required("admin")
def delete_user(user_id):
    actor_id = get_jwt_identity()
    user, error = user_service.delete_user(user_id, actor_id=actor_id)
    if error:
        return jsonify({"error": "Not Found", "message": error}), 404

    return jsonify({"message": "Usuario dado de baja."}), 200
