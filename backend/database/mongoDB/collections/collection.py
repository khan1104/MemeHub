from database.config.mongo import db


user_collection = db["users"]
user_reports=db["reported_users"]
followers_collection = db["followers"]
refresh_tokens_collection = db["refresh_tokens"]
friend_requests=db["friend_requests"]


posts_collection = db["posts"]
posts_reaction_collection = db["posts_reactions"] 
post_reports=db["reported_posts"]


comments_collection = db["comments"]
comments_reaction_collection = db["comments_reactions"]
comments_reports=db["reported_comments"]

friends=db["friends"]
conversation_collection=db["conversation"]
messages_collection=db["messages"]
