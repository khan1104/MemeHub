from fastapi import FastAPI,Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from database.config.mongo import create_indexes
from database.config.redis import initialize_redis
from routes.v1.auth import route as auth_route
from routes.v1.user import route as user_rote
from routes.v1.post import route as post_route
from routes.v1.post_actions import route as post_action_route
from routes.v1.friends import route as friend_route
from routes.v1.comment_actions import route as comment_action_route
from core.rateLimiter import limiter


import uvicorn

app=FastAPI(title="MeemHub Backend")
app.state.limiter = limiter

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    first_error = exc.errors()[0]   
    field = first_error["loc"][-1]
    message = first_error["msg"]

    return JSONResponse(
        status_code=422,
        content={
            "field": field,
            "message": message
        }
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await create_indexes()
    await initialize_redis()

app.include_router(auth_route,prefix="/api/auth",tags=["Auth"])
app.include_router(user_rote,prefix="/api/users",tags=["users"])
app.include_router(post_route,prefix="/api/posts",tags=["posts"])
app.include_router(post_action_route,prefix="/api/posts_actions",tags=["postActions"])
app.include_router(comment_action_route,prefix="/api/comments_actions",tags=["commentActions"])
app.include_router(friend_route,prefix="/api/friends",tags=["friends"])


@app.get("/")
def health():
    return {"message":"server is healthy and running fine"}

if __name__=="__main__":
    uvicorn.run("main:app",reload=True)

