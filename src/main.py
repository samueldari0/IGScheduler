'''settings'''
import os
from instabot import Bot
import sys

import pymongo
import os
from os.path import join, dirname
from dotenv import load_dotenv
from pymongo import MongoClient
from bson.objectid import ObjectId

path= os.getcwd()
path_parent = os.path.dirname(path)
dotenv_path = path_parent +"\\" + '.env'
load_dotenv(dotenv_path)

IG_PASSWORD = os.environ.get("IG_PASSWORD")
IG_USERNAME = os.environ.get("IG_USERNAME")
DB_CLIENT = os.environ.get("DB_CLIENT")
DB_NAME = os.environ.get("DB_NAME")
DB_COLPOSTS = os.environ.get("DB_COLPOSTS")

bot = Bot()

username = IG_USERNAME
password = IG_PASSWORD

client = DB_CLIENT
db = DB_NAME

def connect_db():
    client = MongoClient("localhost", 27017)
    return client

myclient = connect_db()
mydb = myclient.igscheduler
mycol = mydb.posts

'''_id posts MongoDB'''
post_id = sys.argv[1]

post = mycol.find_one({"_id": ObjectId(post_id)})

'''Function'''
try:
    bot.login(username=username,
              password=password)

    img = post['img']

    caption = post['post']

    relatedpath = path+"\src\static\img\\" + img

    bot.upload_photo(relatedpath, caption = caption )

    print("el post ha sido publicado")

except:
    print("Error")

