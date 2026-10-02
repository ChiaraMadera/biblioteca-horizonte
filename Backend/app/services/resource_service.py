from app.extensions import db
from app.models.resource import Resource
from app.models.audit_log import AuditLog


def get_resources(category=None, available=None, page=None, limit=None):
    query = Resource.query
    if category:
        query = query.filter_by(category=category)
    if available is not None:
        query = query.filter_by(available=available)
    query = query.order_by(Resource.name)

    # B-06: Paginación
    if page is not None and limit is not None:
        return query.paginate(page=page, per_page=limit, error_out=False)

    return query.all()


def get_resource_by_id(resource_id: str):
    return Resource.query.get(resource_id)


def create_resource(data: dict, actor_id: str = None):
    if Resource.query.get(data["id"]):
        return None, "Ya existe un recurso con ese ID."

    resource = Resource(**data)
    db.session.add(resource)
    db.session.flush()

    _log_audit(actor_id, "CREATE_RESOURCE", "Resource", resource.id, {"name": resource.name})
    db.session.commit()
    return resource, None


def update_resource(resource_id: str, data: dict, actor_id: str = None):
    resource = Resource.query.get(resource_id)
    if not resource:
        return None, "Recurso no encontrado."

    for field in [
        "name", "category", "description", "info", "icon",
        "available", "condition", "serial_number", "location", "tone",
    ]:
        if field in data:
            setattr(resource, field, data[field])

    _log_audit(actor_id, "UPDATE_RESOURCE", "Resource", resource.id, data)
    db.session.commit()
    return resource, None


def delete_resource(resource_id: str, actor_id: str = None):
    resource = Resource.query.get(resource_id)
    if not resource:
        return None, "Recurso no encontrado."

    resource.available = False  # Baja lógica
    _log_audit(actor_id, "DELETE_RESOURCE", "Resource", resource.id, {"name": resource.name})
    db.session.commit()
    return resource, None


def _log_audit(actor_id, action, target_entity, target_id, details):
    log = AuditLog(
        actor_id=actor_id,
        action=action,
        target_entity=target_entity,
        target_id=target_id,
        details=details,
    )
    db.session.add(log)
