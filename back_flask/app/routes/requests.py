from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.schemas.request import RequestSchema, CreateRequestSchema
from app.services import request_service
from app.utils.decorators import role_required

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

    requests = request_service.get_requests(
        status=status, user_id=user_id, resource_id=resource_id
    )
    return jsonify(requests_schema.dump(requests)), 200


@requests_bp.route("/<request_id>", methods=["GET"])
@jwt_required()
def get_request(request_id):
    req = request_service.get_request_by_id(request_id)
    if not req:
        return jsonify({"error": "Not Found", "message": "Solicitud no encontrada."}), 404
    return jsonify(request_schema.dump(req)), 200


@requests_bp.route("/", methods=["POST"])
@jwt_required()
def create_request():
    data = create_request_schema.load(request.get_json())
    user_id = get_jwt_identity()

    req, error = request_service.create_request(data, user_id)
    if error:
        return jsonify({"error": "Conflict", "message": error}), 409

    return jsonify(request_schema.dump(req)), 201


@requests_bp.route("/<request_id>/review", methods=["PATCH"])
@jwt_required()
@role_required("admin", "bibliotecaria")
def review_request(request_id):
    data = request.get_json()
    new_status = data.get("status")
    reviewer_id = get_jwt_identity()

    req, error = request_service.review_request(request_id, new_status, reviewer_id)
    if error:
        return jsonify({"error": "Bad Request", "message": error}), 400

    return jsonify(request_schema.dump(req)), 200
