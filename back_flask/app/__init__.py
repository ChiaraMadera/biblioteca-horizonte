from flask import Flask
from flask_cors import CORS

from app.config import Config
from app.extensions import db, ma, jwt, migrate
from app.utils.error_handlers import register_error_handlers


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Extensiones
    db.init_app(app)
    ma.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    CORS(app)

    # Blueprints
    from app.routes.auth import auth_bp
    from app.routes.users import users_bp
    from app.routes.resources import resources_bp
    from app.routes.requests import requests_bp
    from app.routes.admin import admin_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(resources_bp, url_prefix="/api/resources")
    app.register_blueprint(requests_bp, url_prefix="/api/requests")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    register_error_handlers(app)

    return app
