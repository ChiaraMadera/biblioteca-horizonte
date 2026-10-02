from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy import func, extract

from app.extensions import db
from app.models.user import User
from app.models.resource import Resource
from app.models.request import Request
from app.models.audit_log import AuditLog
from app.utils.decorators import role_required

admin_bp = Blueprint("admin", __name__)


@admin_bp.route("/dashboard", methods=["GET"])
@jwt_required()
@role_required("admin", "bibliotecaria")
def dashboard():
    """Métricas para el panel de administración."""
    total_resources = Resource.query.count()
    active_users = User.query.filter_by(status="ACTIVO").count()

    # Solicitudes del mes actual
    current_month = func.extract("month", Request.created_at)
    current_year = func.extract("year", Request.created_at)
    total_requests_this_month = Request.query.filter(
        current_month == func.extract("month", func.now()),
        current_year == func.extract("year", func.now()),
    ).count()

    pending = Request.query.filter_by(status="PENDIENTE").count()
    confirmed = Request.query.filter_by(status="CONFIRMADA").count()
    rejected = Request.query.filter_by(status="RECHAZADA").count()

    # Recursos más solicitados
    most_requested = (
        db.session.query(
            Request.resource_id,
            Resource.name.label("resource_name"),
            func.count(Request.id).label("request_count"),
        )
        .join(Resource, Request.resource_id == Resource.id)
        .group_by(Request.resource_id, Resource.name)
        .order_by(func.count(Request.id).desc())
        .limit(5)
        .all()
    )

    return jsonify(
        {
            "totalResources": total_resources,
            "activeUsers": active_users,
            "totalRequestsThisMonth": total_requests_this_month,
            "pendingRequests": pending,
            "confirmedRequests": confirmed,
            "rejectedRequests": rejected,
            "mostRequestedResources": [
                {
                    "resourceId": r.resource_id,
                    "resourceName": r.resource_name,
                    "requestCount": r.request_count,
                }
                for r in most_requested
            ],
        }
    ), 200


@admin_bp.route("/audit-logs", methods=["GET"])
@jwt_required()
@role_required("admin")
def audit_logs():
    """Listado de logs de auditoría."""
    logs = AuditLog.query.order_by(AuditLog.timestamp.desc()).limit(100).all()
    return jsonify(
        [
            {
                "id": log.id,
                "actorId": log.actor_id,
                "action": log.action,
                "targetEntity": log.target_entity,
                "targetId": log.target_id,
                "details": log.details,
                "timestamp": log.timestamp.isoformat() if log.timestamp else None,
            }
            for log in logs
        ]
    ), 200
