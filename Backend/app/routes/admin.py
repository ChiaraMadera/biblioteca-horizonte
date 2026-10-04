from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy import func, extract
from datetime import datetime
from zoneinfo import ZoneInfo

from app.extensions import db
from app.models.user import User
from app.models.resource import Resource
from app.models.request import Request
from app.models.audit_log import AuditLog
from app.utils.decorators import role_required

admin_bp = Blueprint("admin", __name__)
ARGENTINA_TZ = ZoneInfo("America/Argentina/Cordoba")


@admin_bp.route("/dashboard", methods=["GET"])
@jwt_required()
@role_required("admin", "bibliotecaria")
def dashboard():
    """Métricas para el panel de administración."""
    total_resources = Resource.query.count()
    active_users = User.query.filter_by(status="ACTIVO").count()

    # Solicitudes del mes actual (usando fecha actual del sistema)
    from datetime import date
    current_month = datetime.now(ARGENTINA_TZ).month
    total_requests_this_month = Request.query.filter(
        extract("month", Request.created_at) == current_month,
        extract("year", Request.created_at) == datetime.now(ARGENTINA_TZ).year,
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


@admin_bp.route("/reporte-usuarios", methods=["GET"])
@jwt_required()
@role_required("admin")
def reporte_usuarios():
    """Reporte completo de usuarios con estado de baja/mantenimiento."""
    # Usuarios por rol
    usuarios_por_rol = {}
    for rol in ["admin", "bibliotecaria", "docente"]:
        count = User.query.filter_by(role=rol, status="ACTIVO").count()
        count_baja = User.query.filter_by(role=rol, status="INACTIVO").count()
        usuarios_por_rol[rol] = {
            "activos": count,
            "dados_de_baja": count_baja,
            "total": count + count_baja,
        }

    # Recursos por estado
    recursos_por_estado = {}
    for estado in ["EXCELENTE", "BUENO", "EN_MANTENIMIENTO", "FUERA_DE_SERVICIO"]:
        count = Resource.query.filter_by(condition=estado, available=True).count()
        count_mantenimiento = Resource.query.filter_by(condition=estado, available=False).count()
        recursos_por_estado[estado] = {
            "disponibles": count,
            "en_mantenimiento": count_mantenimiento,
            "total": count + count_mantenimiento,
        }

    # Solicitudes por estado
    solicitudes_por_estado = {
        "pendientes": Request.query.filter_by(status="PENDIENTE").count(),
        "confirmadas": Request.query.filter_by(status="CONFIRMADA").count(),
        "rechazadas": Request.query.filter_by(status="RECHAZADA").count(),
        "canceladas": Request.query.filter_by(status="CANCELADA").count(),
    }

    return jsonify(
        {
            "usuariosPorRol": usuarios_por_rol,
            "recursosPorEstado": recursos_por_estado,
            "solicitudesPorEstado": solicitudes_por_estado,
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
