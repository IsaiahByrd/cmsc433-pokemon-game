from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Pokemon(db.Model):
    ID=db.Column(db.Integer,primary_key=True,)
    Num=db.Column(db.Integer)
    Name=db.Column(db.String(50), nullable=False)
    Type1=db.Column(db.String(50), nullable=False)
    Type2=db.Column(db.String(50))
    Total=db.Column(db.Integer)
    HP=db.Column(db.Integer)
    Attack=db.Column(db.Integer)
    Defense=db.Column(db.Integer)
    SpAttack=db.Column(db.Integer)
    SpDefense=db.Column(db.Integer)
    Speed=db.Column(db.Integer)
    Generation=db.Column(db.Integer)
    Legendary=db.Column(db.String(10), nullable=False)

    def __repr__(self):
        return f'<Pokemon {self.Name}>'
