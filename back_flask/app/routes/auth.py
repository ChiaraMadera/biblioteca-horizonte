from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.schemas.auth import LoginSchema
from app.schemas.user import UserSchema
from app.services import auth_service
from app.models.user import User

auth_bp = Blueprint("auth", __name__)
login_schema = LoginSchema()
user_schema = UserSchema()


@auth_bp.route("/login", methods=["POST"])
def login():
    data = login_schema.load(request.get_json())
    result, error = auth_service.authenticate_user(
        email=data["email"], password=data["password"], role=data["role"]
    )

    if error:
        return jsonify({"error": "Unauthorized", "message": error}), 401

    return jsonify({"token": result["token"], "user": user_schema.dump(result["user"])}), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Not Found", "message": "Usuario no encontrado."}), 404
    return jsonify(user_schema.dump(user)), 200
