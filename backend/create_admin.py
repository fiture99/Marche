from app import create_app, db
from app.models.user import User, UserRole

app = create_app()
app.app_context().push()

admin = User(
    email='admin@example.com',
    first_name='Admin',
    last_name='User',
    role=UserRole.ADMIN
)
admin.set_password('Admin123!')
db.session.add(admin)
db.session.commit()
