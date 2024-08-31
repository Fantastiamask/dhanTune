from flask import Flask, render_template, jsonify, Response, request, redirect, session
import sqlite3
con = sqlite3.connect("static/dhanvinify.db", check_same_thread=False)
cur = con.cursor()
from flask_session import Session
app = Flask(__name__)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"]="filesystem"
Session(app)
song = []

allsong = []
playlist = []
playlist_name = 0
playlists = 0


def hehe(playlist_id):
    global playlist, playlist_name, songs
    cur.execute("SELECT count(*) FROM playlists WHERE rowid=?", (playlist_id))
    check = cur.fetchone()
    if check[0] == 0:
        return False
    cur.execute("SELECT name FROM playlists WHERE rowid=?", (playlist_id))
    playlist_name = cur.fetchone()
    playlist_name = playlist_name[0]
    cur.execute("SELECT count(*) FROM playlists_data WHERE playlist_id=?", (playlist_id))
    check = cur.fetchone()
    if check[0] == 0:
        return "none"
    cur.execute("SELECT song_id FROM playlists_data WHERE playlist_id=?",  (playlist_id))
    playlist_songs = cur.fetchall()
    playlist_data = []
    for id in playlist_songs:
        cur.execute("SELECT id, name, artist, url, image FROM songs WHERE rowid= (?)", (id))
        playlist_data.append(cur.fetchone())
    playlist = [
    {
        "id": row[0],
        "name": row[1],
        "artist": row[2],
        "url": row[3],
        "image": row[4]
    }
    for row in playlist_data
    ]
    cur.execute("SELECT song_id FROM playlists_data WHERE playlist_id=?", (playlist_id,))
    songs_id = cur.fetchall()
    songs_data = []
    for id in songs_id:
        cur.execute("SELECT rowid, name, artist, url, image FROM songs WHERE rowid= (?)", (id))
        songs_data.append(cur.fetchone())
    songs = [
    {
        "id": row[0],
        "name": row[1],
        "artist": row[2],
    }
    for row in songs_data
    ]
    return True

    # with open(f'static/{file}') as f:
    #     playlist = json.load(f)
# Load playlist from Database
def songPlay(song_id):
    global playlist, playlist_name
    cur.execute("SELECT count(*) FROM songs WHERE rowid=?", (song_id, ))
    check = cur.fetchone()
    if check[0] == 0:
        return False
    # cur.execute("SELECT name FROM playlists WHERE id=?", (song_id))
    # playlist_name = cur.fetchone()
    # playlist_name = playlist_name[0]
    cur.execute("SELECT rowid FROM songs WHERE rowid=?",  (song_id, ))
    playlist_songs = cur.fetchall()
    playlist_data = []
    for id in playlist_songs:
        cur.execute("SELECT rowid, name, artist, url, image FROM songs WHERE rowid= (?)", (id))
        playlist_data.append(cur.fetchone())
    playlist = [
    {
        "id": row[0],
        "name": row[1],
        "artist": row[2],
        "url": row[3],
        "image": row[4]
    }
    for row in playlist_data
    ]
    return True

def all_songs():
    global song, allsong
    # cur.execute("SELECT name FROM playlists WHERE id=?", (song_id))
    # playlist_name = cur.fetchone()
    # playlist_name = playlist_name[0]
    cur.execute("SELECT rowid FROM songs")
    playlist_songs = cur.fetchall()
    playlist_data = []
    for id in playlist_songs:
        cur.execute("SELECT rowid, name, artist, url, image FROM songs WHERE rowid= (?)", (id))
        playlist_data.append(cur.fetchone())
    allsong = [
    {
        "id": row[0],
        "name": row[1],
        "artist": row[2],
    }
    for row in playlist_data
    ]
    return True

def auth_user(name, pin):
    cur.execute("SELECT COUNT(*) FROM users WHERE email=?", (name, ))
    res = cur.fetchone()
    result = res[0]
    if result == 0:
        return "No Account"
    cur.execute("SELECT password FROM users WHERE email=?", (name, ))
    res = cur.fetchone()
    result = res[0]
    if result != pin:
        return "Incorrect pin"
    if result == pin:
        return True
@app.route('/')
def index():
    message1 = request.args.get("message")
    if message1:
        message = message1
    else:
        message="" 
    if session.get("username", False):
        username = session.get("username")
        pin = session.get("pin")
        return redirect(f"/home?message={message}")
    return render_template('login.html', message=message)
@app.route('/login', methods=['POST', 'GET'])
def login():
    name = request.form.get("email", "Not Found")
    pin = request.form.get("password", "Not F0und")

    auth = auth_user(name, pin)
    if auth == "Incorrect pin":
        return redirect("/?message=Incorrect+Password!")
    elif auth == "No Account":
        return redirect("/?message=Account+Not+Found!")
    else:
        session["username"] = name
        session["pin"] = pin
        cur.execute("SELECT username FROM users WHERE email=?", (session["username"], ))
        username = cur.fetchone()
        session["name"] = username[0]
        return redirect("/home")

@app.route('/home')
def home():
    username = session.get("name")
    message1 = request.args.get("message")
    if message1:
        message = message1
    else:
        message="" 
    cur.execute("SELECT rowid, name FROM playlists WHERE username = ?", (username, ))
    playlists = cur.fetchall()
    return render_template('index.html', name=username, playlist=playlists, message=message)
@app.route('/playlist')
def selecter():
    playlist_id = request.args.get("p")
    if playlist_id:
        he = hehe(playlist_id)
        if he == True:
            name = playlist_name
            username = session.get("name")
            cur.execute("SELECT rowid, name FROM playlists WHERE username = ?", (username, ))
            playlists = cur.fetchall()
            if all_songs():
                username = session.get("name")
            return render_template('play.html', name=username, song_name=name, playlist=playlists, check=0, songs=playlist, list=songs, all_songs=allsong)
        if he == "none":
            return redirect("/?message=That+playlist+is+empty!+Add+some+songs!")
        else:
            return redirect("/?message=Playlist+Not+Found!")
    return redirect("/?message=Error!")
# @app.route('/songs')
# def songs():
#     name = playlist_name
#     return render_template('play.html', name=name)

@app.route('/playlist_data')
def get_playlist():
    return jsonify (playlist)
@app.route('/browse')
def browse():
    if all_songs():
        username = session.get("name")
        cur.execute("SELECT rowid, name FROM playlists WHERE username = ?", (username, ))
        playlists = cur.fetchall()
        return render_template('browse.html', songs=allsong, check=1, playlist=playlists, name=username)
    else:
        return redirect("/")
    return redirect("/")

    return render_template('browse.html')
@app.route('/play')
def play_song():
    playlist_id = request.args.get("p")
    if playlist_id:
        if songPlay(playlist_id):
            name = "PLAYING"
            username = session.get("name")
            cur.execute("SELECT rowid, name FROM playlists WHERE username = ?", (username, ))
            playlists = cur.fetchall()
            # return playlist
            return render_template('play.html', name=username, song_name=name, playlist=playlists, check=1)
        else:
            return redirect("/")
    return redirect("/")
if __name__ == '__main__':
    app.run(debug=True)

@app.route('/logout', methods=['POST', 'GET'])
def logout():
    session.clear()
    return redirect("/")
@app.route("/search")
def search():
    search_term = request.args.get("search", False)
    if not search_term:
        return redirect("/")
    search = "%" + search_term + "%"
    cur.execute("SELECT rowid FROM songs WHERE name LIKE ?", (search,))
    songs_id = cur.fetchall()
    songs_data = []
    for id in songs_id:
        cur.execute("SELECT rowid, name, artist, url, image FROM songs WHERE rowid= (?)", (id))
        songs_data.append(cur.fetchone())
    songs = [
    {
        "id": row[0],
        "name": row[1],
        "artist": row[2],
    }
    for row in songs_data
    ]
    username = session.get("name")
    cur.execute("SELECT rowid, name FROM playlists WHERE username = ?", (username, ))
    playlists = cur.fetchall()
    return render_template("search.html", search=search_term, songs=songs, name=username, playlist=playlists)
@app.route("/add_playlist")
def add_playlist():
    username = session.get("name")
    cur.execute("SELECT rowid, name FROM playlists WHERE username = ?", (username, ))
    playlists = cur.fetchall()
    return render_template("new_playlist.html", name=username, playlist=playlists)
@app.route("/new_playlist")
def new_playlist():
    name = request.args.get("name", False)
    username = session.get("name")
    if not name:
        return redirect("/")
    cur.execute("INSERT INTO playlists(name, username) VALUES(?, ?)", (name, username))
    con.commit()
    return redirect("/browse")
@app.route("/add_song")
def add_song():
    name = request.args.get("name", False)
    artist = request.args.get("artist", False)
    track = request.args.get("track", False)
    image = request.args.get("image", False)
    if not name:
        return redirect("/")
    if not artist:
        return redirect("/")
    if not track:
        return redirect("/")
    if not image:
        return redirect("/")
    cur.execute("INSERT INTO songs(name, artist, url, image) VALUES(?, ?, ?, ?)", (name, artist, track, image))
    con.commit()
    return redirect("/?message=Added!")
@app.route("/add_song_render")
def add_song_render():
    username = session.get("name")
    cur.execute("SELECT rowid, name FROM playlists WHERE username = ?", (username, ))
    playlists = cur.fetchall()
    return render_template("add_song.html", name=username, playlist=playlists)
@app.route("/add_user")
def add_user():
    username = request.args.get("username", False)
    email = request.args.get("email", False)
    password = request.args.get("password", False)
    if not username:
        return redirect("/")
    if not email:
        return redirect("/")
    if not password:
        return redirect("/")
    cur.execute("INSERT INTO users(username, email, password) VALUES(?, ?, ?)", (username, email, password))
    con.commit()
    return redirect("/?message=Added!")
@app.route("/add_user_render")
def add_user_render():
    username = session.get("name")
    cur.execute("SELECT rowid, name FROM playlists WHERE username = ?", (username, ))
    playlists = cur.fetchall()
    return render_template("add_user.html", name=username, playlist=playlists)
@app.route("/add")
def add():
    song = request.args.get("song", False)
    playlist = request.args.get("list", False)
    if not song:
        return redirect("/?message=error1")
    if not playlist:
        return redirect("/?message=error2")
    cur.execute("SELECT count(*) FROM songs WHERE rowid=?", (song, ))
    check = cur.fetchone()
    if check[0] == 0:
        return redirect("/?message=error3")
    cur.execute("SELECT count(*) FROM playlists WHERE rowid=?", (playlist, ))
    check = cur.fetchone()
    if check[0] == 0:
        return redirect("/?message=error4")
    cur.execute("SELECT count(*) FROM playlists_data WHERE song_id=? AND playlist_id=?", (song, playlist))
    check = cur.fetchone()
    if check[0] != 0:
        cur.execute("DELETE FROM playlists_data WHERE song_id=?", (song, ))
        con.commit()
        return redirect(f"playlist?p={playlist}")
    cur.execute("INSERT INTO playlists_data(playlist_id, song_id) VALUES(?, ?)", (playlist, song))
    con.commit()
    return redirect(f"playlist?p={playlist}")

    
