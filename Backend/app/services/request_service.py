from datetime import datetime, date

from app.extensions import db
from app.models.request import Request
from app.models.resource import Resource
from app.models.audit_log import AuditLog


def get_requests(status=None, user_id=None, resource_id=None):
    query = Request.query
    if status:
        query = query.filter_by(status=status)
    if user_id:
        query = query.filter_by(user_id=user_id)
    if resource_id:
        query = query.filter_by(resource_id=resource_id)
    return query.order_by(Request.created_at.desc()).all()


def get_request_by_id(request_id: str):
    return Request.query.get(request_id)


def create_request(data: dict, user_id: str):
    resource = Resource.query.get(data["resource_id"])
    if not resource:
        return None, "Recurso no encontrado."

    if not resource.available:
        return None, "El recurso no está disponible."

    # Validar fecha no pasada
    if data["date"] < date.today():
        return None, "La fecha no puede ser anterior a hoy."

    # Verificar conflictos de horario
    conflict = Request.query.filter_by(
        resource_id=data["resource_id"],
        date=data["date"],
        shift=data["shift"],
        module=data["module"],
        status="CONFIRMADA",
    ).first()

    if conflict:
        return None, "El recurso ya está reservado en ese horario."

    # Generar ID secuencial BH-XXXX
    last_request = Request.query.order_by(Request.id.desc()).first()
    next_number = 1
    if last_request and last_request.id.startswith("BH-"):
        try:
            next_number = int(last_request.id.split("-")[1]) + 1
        except (IndexError, ValueError):
            next_number = 1

    request = Request(
        id=f"BH-{next_number:04d}",
        resource_id=data["resource_id"],
        user_id=user_id,
        teacher=data["teacher"],
        date=data["date"],
        shift=data["shift"],
        module=data["module"],
        notes=data.get("notes"),
    )
    db.session.add(request)
    db.session.flush()

    _log_audit(user_id, "CREATE_REQUEST", "Request", request.id, {"resource_id": request.resource_id})
    db.session.commit()
    return request, None


def review_request(request_id: str, new_status: str, reviewer_id: str):
    request = Request.query.get(request_id)
    if not request:
        return None, "Solicitud no encontrada."

    if new_status not in ["CONFIRMADA", "RECHAZADA", "CANCELADA"]:
        return None, "Estado inválido."

    # B-01 & B-02: Re-verificar conflictos al confirmar
    if new_status == "CONFIRMADA":
        conflict = Request.query.filter(
            Request.resource_id == request.resource_id,
            Request.date == request.date,
            Request.shift == request.shift,
            Request.module == request.module,
            Request.status == "CONFIRMADA",
            Request.id != request.id,
        ).first()

        if conflict:
            return None, "El recurso ya está reservado en ese horario por otra solicitud confirmada."

    old_status = request.status
    request.status = new_status
    request.reviewed_by = reviewer_id
    request.reviewed_at = datetime.utcnow()

    _log_audit(reviewer_id, "CHANGE_STATUS", "Request", request.id, {
        "old_status": old_status,
        "new_status": new_status,
    })
    db.session.commit()
    return request, None


def cancel_request(request_id: str, user_id: str):
    """Permite a un docente cancelar sus propias solicitudes PENDIENTES o CONFIRMADAS."""
    request = Request.query.get(request_id)
    if not request:
        return None, "Solicitud no encontrada."

    if request.user_id != user_id:
        return None, "No tenés permiso para cancelar esta solicitud."

    if request.status not in ["PENDIENTE", "CONFIRMADA"]:
        return None, "Solo se pueden cancelar solicitudes pendientes o confirmadas."

    old_status = request.status
    request.status = "CANCELADA"
    request.reviewed_by = user_id
    request.reviewed_at = datetime.utcnow()

    _log_audit(user_id, "CANCEL_REQUEST", "Request", request.id, {
        "old_status": old_status,
        "new_status": "CANCELADA",
    })
    db.session.commit()
    return request, None


def _log_audit(actor_id, action, target_entity, target_id, details):
    log = AuditLog(
        actor_id=actor_id,
        action=action,
        target_entity=target_entity,
        target_id=target_id,
        details=details,
    )
    db.session.add(log)
