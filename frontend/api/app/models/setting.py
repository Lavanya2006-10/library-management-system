from app.models import db

class SystemSetting(db.Model):
    __tablename__ = "system_settings"

    key = db.Column(db.String(100), primary_key=True)
    value = db.Column(db.String(255), nullable=False)
    description = db.Column(db.String(255), nullable=True)

    def to_dict(self):
        return {
            "key": self.key,
            "value": self.value,
            "description": self.description,
        }
