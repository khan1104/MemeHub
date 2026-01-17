from pymongo import MongoClient


client=MongoClient("mongodb://localhost:27017/")

dev_database=client["MemeHub_dev"]

prod_database=client["MemeHub"]

user_collection=dev_database["users"]
refresh_tokens=dev_database["refresh_tokens"]
meme_collection=dev_database["memes"]
like_collection=dev_database["likes"]
comments_collection=dev_database["comments"]
liked_comment_collection=dev_database["liked_comments"]
follow_collection=dev_database["follow"]