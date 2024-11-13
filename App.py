from flask import Flask, render_template, request, redirect, url_for, session, flash
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import UserMixin, LoginManager, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///user.db'
app.config['SECRET_KEY'] = 'RHBGERGILhrthrEBVWertrtI75erge2t6AWCergerg'
app.config['SQLALCHEMY_BINDS'] = {
    'form': 'sqlite:///form.db',
    'reviews': 'sqlite:///reviews.db'
}
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

# Модели
class Reviews(db.Model):
    __bind_key__ = 'reviews'
    id = db.Column(db.Integer, primary_key=True)
    rew_name = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text, nullable=False)

class Form(db.Model):
    __bind_key__ = 'form'
    id = db.Column(db.Integer, primary_key=True)
    req_email = db.Column(db.String(300), nullable=False)
    req_name = db.Column(db.String(100), nullable=False)
    req_message = db.Column(db.Text, nullable=False)

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(300), nullable=False, unique=True)
    password = db.Column(db.String(128), nullable=False)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Маршруты
@app.route('/', methods=['POST', 'GET'])
def index():
    if request.method == 'POST':
        rew_name = request.form['rew_name']
        message = request.form['message']
        post = Reviews(rew_name=rew_name, message=message)
        try:
            db.session.add(post)
            db.session.commit()
            flash("Ваш отзыв успешно отправлен")
            return redirect(url_for('index'))
        except:
            flash("Ошибка отправки отзыва", "error")

    reviews = Reviews.query.all()
    return render_template("index.html", reviews=reviews)

@app.route('/catalog')
def catalog():
    return render_template("catalog.html")

@app.route('/contacts', methods=['POST', 'GET'])
def contacts():
    if request.method == 'POST':
        req_name = request.form['req_name']
        req_email = request.form['req_email']
        req_message = request.form['req_message']

        post = Form(req_name=req_name, req_email=req_email, req_message=req_message)
        try:
            db.session.add(post)
            db.session.commit()
            flash("Ваше сообщение успешно отправлено!", "success")
            return redirect(url_for('contacts'))
        except:
            flash("Ошибка отправки сообщения", "error")

    reqForm = Form.query.all()
    return render_template("contacts.html", reqForm=reqForm)

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        password2 = request.form.get('password2')

        if not (username and email and password and password2):
            flash('Заполните все поля', "error")
        elif password != password2:
            flash('Пароли не совпадают', "error")
        else:
            hash = generate_password_hash(password)
            new_user = User(username=username, email=email, password=hash)
            try:
                db.session.add(new_user)
                db.session.commit()
                flash("Регистрация прошла успешно!", "success")
                return redirect(url_for('login'))
            except:
                flash("Ошибка регистрации", "error")

    return render_template("register.html")

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        if email and password:
            user = User.query.filter_by(email=email).first()
            if user and check_password_hash(user.password, password):
                login_user(user)
                next_page = request.args.get('next')
                flash("Вы успешно вошли в систему!", "success")
                return redirect(next_page or url_for('index'))
            else:
                flash("", "error")
        else:
            flash("", "error")

    return render_template("login.html")

@app.route('/profile')
@login_required
def profile():

    # get = User.query.all()
    return render_template("profile.html", user=current_user)

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash("Вы успешно вышли из системы!", "success")
    return redirect(url_for('index'))

@app.after_request
def redirect_unauthorized(response):
    if response.status_code == 401:
        return redirect(url_for('login', next=request.url))
    return response

if __name__ == '__main__':
    app.run(debug=True)
