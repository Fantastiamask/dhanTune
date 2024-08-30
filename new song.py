import sqlite3
from music import songs
con = sqlite3.connect("static/dhanvinify.db", check_same_thread=False)
cur = con.cursor()

for song in songs:
    print(song['name'])
    cur.execute("INSERT INTO songs(name, artist, url, image) VALUES(?, ?, ?, ?)", (song['name'], song['artist'], song['path'], song['image']))
    con.commit()
    print("Added", song['name'], "\n")
# number = input("")
# if int(number) > 0 :
#     count = 0
#     while count != int(number):
#         name = input("Name: ")
#         artist = input("artist: ")
#         image = input("Image: ")
#         track = input("track: ")
#         cur.execute("INSERT INTO songs(name, artist, url, image) VALUES(?, ?, ?, ?)", (name, artist, track, image))
#         con.commit()
#         print("Added", name, "\n")
#         count += 1