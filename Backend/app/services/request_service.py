from datetime import datetime, date
from zoneinfo import ZoneInfo

from app.extensions import db
from app.models.request import Request
from app.models.resource import Resource
from app.models.audit_log import AuditLog
from sqlalchemy.exc import IntegrityError
from app.models.user import User

ARGENTINA_TZ = ZoneInfo("America/Argentina/Cordoba")
FERIADOS = {
    date(2026, 1, 1),
    date(2026, 2, 16),
    date(2026, 2, 17),
    date(2026, 3, 24),
    date(2026, 4, 2),
    date(2026, 4, 3),
    date(2026, 5, 1),
    date(2026, 5, 25),
    date(2026, 6, 15),
    date(2026, 6, 20),
    date(2026, 7, 9),
    date(2026, 8, 17),
    date(2026, 10, 12),
    date(2026, 11, 20),
    date(2026, 12, 8),
    date(2026, 12, 25),
}

def get_requests(status=None, user_id=None, resource_id=None, page=1, per_page=10):
    query = Request.query

    if status:
        query = query.filter_by(status=status)
    if user_id:
        query = query.filter_by(user_id=user_id)
    if resource_id:
        query = query.filter_by(resource_id=resource_id)

    return query.order_by(Request.created_at.desc()).paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )
def get_availability(resource_id: str, date: str, include_details: bool = False):
    requests = Request.query.filter(
        Request.resource_id == resource_id,
        Request.date == date,
        Request.status.in_(["PENDIENTE", "CONFIRMADA"]),
    ).all()

    # Una solicitud PENDIENTE NO garantiza la disponibilidad: solo una
    # CONFIRMADA ocupa el cupo. Se conservan las pendientes para poder
    # informarlas (include_details) sin marcar el slot como ocupado.
    by_slot = {}
    for req in requests:
        key = (req.shift, req.module)
        actual = by_slot.get(key)
        if actual is None or (actual.status != "CONFIRMADA" and req.status == "CONFIRMADA"):
            by_slot[key] = req

    slots = [
        ("Mañana · 08:00–12:00", "Módulo 1 · 08:00–09:20"),
        ("Mañana · 08:00–12:00", "Módulo 2 · 09:30–10:50"),
        ("Mañana · 08:00–12:00", "Módulo 3 · 11:00–12:00"),
        ("Tarde · 13:00–17:00", "Módulo 1 · 13:00–14:20"),
        ("Tarde · 13:00–17:00", "Módulo 2 · 14:30–15:50"),
        ("Tarde · 13:00–17:00", "Módulo 3 · 16:00–17:00"),
    ]

    result = []

    for shift, module in slots:
        request = by_slot.get((shift, module))
        confirmed = request is not None and request.status == "CONFIRMADA"

        slot = {
            "shift": shift,
            "module": module,
            "available": not confirmed,
        }

        if include_details and request:
            slot["reason"] = request.status
            slot["request_id"] = request.id

        result.append(slot)

    return result

def get_request_by_id(request_id: str):
    return Request.query.get(request_id)


def create_request(data: dict, user_id: str):
    resource = Resource.query.get(data["resource_id"])

    user = User.query.get(user_id)

    if not user:
        return None, "Usuario no encontrado."

    if user.role != "docente":
        return None, "Solo los docentes pueden crear solicitudes."

    if user.status != "ACTIVO":
        return None, "El usuario no está activo."
    

    

    if not resource:
        return None, "Recurso no encontrado."

    if not resource.available or resource.condition in ["EN_MANTENIMIENTO", "FUERA_DE_SERVICIO"]:
        return None, "El recurso no está disponible."

    # Fecha actual en horario de Argentina
    hoy = datetime.now(ARGENTINA_TZ).date()

    # La fecha no puede ser anterior a hoy
    if data["date"] < hoy:
        return None, "La fecha no puede ser anterior a hoy."

    # No permitir fines de semana
    if data["date"].weekday() >= 5:
        return None, "La fecha debe ser un día hábil."

    # No permitir feriados
    if data["date"] in FERIADOS:
        return None, "La fecha seleccionada es un feriado."

    # No permitir reservas con más de 60 días de anticipación
    if (data["date"] - hoy).days > 60:
        return None, "La fecha no puede superar los 60 días desde hoy."

    # Validar que el módulo corresponda al turno
    modulos_manana = {
        "Módulo 1 · 08:00–09:20",
        "Módulo 2 · 09:30–10:50",
        "Módulo 3 · 11:00–12:00",
    }

    modulos_tarde = {
        "Módulo 1 · 13:00–14:20",
        "Módulo 2 · 14:30–15:50",
        "Módulo 3 · 16:00–17:00",
    }

    if (
        data["shift"] == "Mañana · 08:00–12:00"
        and data["module"] not in modulos_manana
    ):
        return None, "El módulo seleccionado no corresponde al turno mañana."

    if (
        data["shift"] == "Tarde · 13:00–17:00"
        and data["module"] not in modulos_tarde
    ):
        return None, "El módulo seleccionado no corresponde al turno tarde."

    # Si la reserva es para hoy, verificar que el módulo todavía no haya comenzado
    if data["date"] == hoy:
        ahora = datetime.now(ARGENTINA_TZ).time()

        horarios = {
            "Módulo 1 · 08:00–09:20": (8, 0, 9, 20),
            "Módulo 2 · 09:30–10:50": (9, 30, 10, 50),
            "Módulo 3 · 11:00–12:00": (11, 0, 12, 0),
            "Módulo 1 · 13:00–14:20": (13, 0, 14, 20),
            "Módulo 2 · 14:30–15:50": (14, 30, 15, 50),
            "Módulo 3 · 16:00–17:00": (16, 0, 17, 0),
        }

        horario = horarios.get(data["module"])

        if not horario:
            return None, "El módulo seleccionado no tiene un horario válido."

        hora_inicio = datetime.min.time().replace(
            hour=horario[0],
            minute=horario[1]
        )

        hora_fin = datetime.min.time().replace(
            hour=horario[2],
            minute=horario[3]
        )

        if ahora >= hora_fin:
            return None, "El horario seleccionado ya pasó."

        if ahora >= hora_inicio:
            return None, "El horario seleccionado ya comenzó."

    # Verificar conflictos de horario (solo CONFIRMADA bloquea; PENDIENTE no garantiza disponibilidad)
    conflict = Request.query.filter(
        Request.resource_id == data["resource_id"],
        Request.date == data["date"],
        Request.shift == data["shift"],
        Request.module == data["module"],
        Request.status == "CONFIRMADA",
    ).first()

    if conflict:
        return None, "El recurso ya está reservado en ese horario."

    # Generar ID secuencial BH-XXXX sin depender del orden lexicográfico
    ids = db.session.query(Request.id).filter(
        Request.id.like("BH-%")
    ).all()

    maximum = 0

    for (request_id,) in ids:
        try:
            number = int(request_id[3:])
            maximum = max(maximum, number)
        except (TypeError, ValueError):
            continue

    next_number = maximum + 1

    request = Request(
        id=f"BH-{next_number:04d}",
        resource_id=data["resource_id"],
        user_id=user_id,
        teacher=user.name,
        date=data["date"],
        shift=data["shift"],
        module=data["module"],
        notes=data.get("notes"),
    )

    db.session.add(request)
    db.session.flush()

    _log_audit(
        user_id,
        "CREATE_REQUEST",
        "Request",
        request.id,
        {"resource_id": request.resource_id}
    )

    db.session.commit()

    return request, None


def review_request(request_id: str, new_status: str, reviewer_id: str):
    request = Request.query.get(request_id)
    if not request:
        return None, "Solicitud no encontrada."

    if new_status not in ["CONFIRMADA", "RECHAZADA", "CANCELADA"]:
        return None, "Estado inválido."

    if request.status != "PENDIENTE":
        return None, "Solo se pueden revisar solicitudes pendientes."

    if new_status == "CONFIRMADA":
        resource = Resource.query.get(request.resource_id)
        hoy = datetime.now(ARGENTINA_TZ).date()

        if request.date < hoy:
            return None, "No se puede confirmar una solicitud cuyo horario ya pasó."

        if request.date == hoy:
            ahora = datetime.now(ARGENTINA_TZ).time()

            horarios = {
                "Módulo 1 · 08:00–09:20": (8, 0, 9, 20),
                "Módulo 2 · 09:30–10:50": (9, 30, 10, 50),
                "Módulo 3 · 11:00–12:00": (11, 0, 12, 0),
                "Módulo 1 · 13:00–14:20": (13, 0, 14, 20),
                "Módulo 2 · 14:30–15:50": (14, 30, 15, 50),
                "Módulo 3 · 16:00–17:00": (16, 0, 17, 0),
            }

            horario = horarios.get(request.module)

            if not horario:
                return None, "El módulo seleccionado no tiene un horario válido."

            hora_fin = datetime.min.time().replace(
                hour=horario[2],
                minute=horario[3]
            )

            if ahora >= hora_fin:
                return None, "No se puede confirmar una solicitud cuyo horario ya pasó."

        if not resource:
            return None, "Recurso no encontrado."

        if not resource.available or resource.condition in ["EN_MANTENIMIENTO", "FUERA_DE_SERVICIO"]:
            return None, "El recurso no está disponible para ser confirmado."

        conflict = Request.query.filter(
            Request.resource_id == request.resource_id,
            Request.date == request.date,
            Request.shift == request.shift,
            Request.module == request.module,
            Request.status == "CONFIRMADA",
            Request.id != request.id,
        ).first()

        if conflict:
            return None, "El recurso ya está reservado en ese horario."

    old_status = request.status
    request.status = new_status
    request.reviewed_by = reviewer_id
    request.reviewed_at = datetime.now(ARGENTINA_TZ)

    _log_audit(reviewer_id, "CHANGE_STATUS", "Request", request.id, {
        "old_status": old_status,
        "new_status": new_status,
    })

    # Al confirmarse, se avisa al docente y se verifican las demás
    # solicitudes PENDIENTE para el mismo recurso/fecha/turno/módulo:
    # como el cupo ya está ocupado, esas pendientes pasan a CANCELADA.
    if new_status == "CONFIRMADA":
        send_notification(
            target_user_id=request.user_id,
            subject="Solicitud confirmada",
            message=(
                f"Tu solicitud {request.id} para {request.resource_id} "
                f"del {request.date} ({request.module}) fue CONFIRMADA."
            ),
            reference=request.id,
        )

        otras = Request.query.filter(
            Request.resource_id == request.resource_id,
            Request.date == request.date,
            Request.shift == request.shift,
            Request.module == request.module,
            Request.status == "PENDIENTE",
            Request.id != request.id,
        ).all()

        for otra in otras:
            otra.status = "CANCELADA"
            otra.reviewed_by = reviewer_id
            otra.reviewed_at = datetime.now(ARGENTINA_TZ)

            _log_audit(reviewer_id, "AUTO_CANCEL_PENDING", "Request", otra.id, {
                "old_status": "PENDIENTE",
                "new_status": "CANCELADA",
                "reason": f"El cupo fue ocupado por la solicitud {request.id}",
            })

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return None, "El recurso ya está reservado en ese horario."

    return request, None


def send_notification(target_user_id, subject, message, reference=None):
    """Notificación al docente.

    Hoy queda registrada como traza de auditoría (acción NOTIFICATION).
    El punto de extensión para enviar un correo real está acá.
    """
    log = AuditLog(
        actor_id=target_user_id,
        action="NOTIFICATION",
        target_entity="Request",
        target_id=reference,
        details={"subject": subject, "message": message},
    )
    db.session.add(log)
    return log


def cancel_request(request_id: str, user_id: str):
    """Permite a un docente cancelar sus propias solicitudes PENDIENTES o CONFIRMADAS."""
    request = Request.query.get(request_id)

    if not request:
        return None, "Solicitud no encontrada."

    user = User.query.get(user_id)

    if not user:
        return None, "Usuario no encontrado."

    if user.status != "ACTIVO":
        return None, "El usuario no está activo."

    if request.user_id != user_id and user.role != "bibliotecaria":
        return None, "No tenés permiso para cancelar esta solicitud."

    if request.status not in ["PENDIENTE", "CONFIRMADA"]:
        return None, "Solo se pueden cancelar solicitudes pendientes o confirmadas."

    # No permitir cancelar una solicitud cuyo turno ya pasó
    hoy = datetime.now(ARGENTINA_TZ).date()

    if request.date < hoy:
        return None, "No se puede cancelar una solicitud cuyo horario ya pasó."

    if request.date == hoy:
        ahora = datetime.now(ARGENTINA_TZ).time()

        horarios = {
            "Módulo 1 · 08:00–09:20": (8, 0, 9, 20),
            "Módulo 2 · 09:30–10:50": (9, 30, 10, 50),
            "Módulo 3 · 11:00–12:00": (11, 0, 12, 0),
            "Módulo 1 · 13:00–14:20": (13, 0, 14, 20),
            "Módulo 2 · 14:30–15:50": (14, 30, 15, 50),
            "Módulo 3 · 16:00–17:00": (16, 0, 17, 0),
        }

        horario = horarios.get(request.module)

        if not horario:
            return None, "El módulo seleccionado no tiene un horario válido."

        hora_fin = datetime.min.time().replace(
            hour=horario[2],
            minute=horario[3]
        )

        if ahora >= hora_fin:
            return None, "No se puede cancelar una solicitud cuyo horario ya pasó."

    old_status = request.status
    request.status = "CANCELADA"
    request.reviewed_by = user_id
    request.reviewed_at = datetime.now(ARGENTINA_TZ)

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
