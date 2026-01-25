from datetime import datetime
from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException, status
import base64, json


class BaseActions:
    def __init__(self, collection, use_soft_delete: bool = False):
        self.collection = collection
        self.use_soft_delete = use_soft_delete

    async def create(self, data: dict):
        data["created_at"] = datetime.now()
        data["updated_at"] = None

        if self.use_soft_delete:
            data.setdefault("is_deleted", False)

        result = await self.collection.insert_one(data)
        data["_id"] = result.inserted_id
        return data

    async def get_data_by_id(self, id: str,projection:dict=None):
        query = {"_id": ObjectId(id)}

        if self.use_soft_delete:
            query["is_deleted"] = False

        return await self.collection.find_one(query,projection)

    async def get_all(self, filter: dict = None,projection: dict = None):
        filter = filter or {}

        if self.use_soft_delete:
            filter["is_deleted"] = False

        cursor = self.collection.find(filter,projection)
        return [doc async for doc in cursor]
    
    async def get_by_filter(self, filter: dict,projection: dict = None):
        if self.use_soft_delete:
            filter["is_deleted"] = False

        return await self.collection.find_one(filter,projection)

    async def updated(self, id: str, data: dict):
        update_data = {k: v for k, v in data.items() if v is not None}
        update_data["updated_at"] = datetime.now()

        query = {"_id": ObjectId(id)}
        if self.use_soft_delete:
            query["is_deleted"] = False

        result = await self.collection.update_one(query, {"$set": update_data})
        return result.modified_count > 0

    async def soft_delete(self, id: str):
        result = await self.collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": {"is_deleted": True, "deleted_at": datetime.now()}}
        )
        return result.modified_count > 0

    async def hard_delete(self, id: str = None, filter: dict = None):
        if id:
            query = {"_id": ObjectId(id)}
        elif filter:
            query = filter
        else:
            raise ValueError("Either 'id' or 'filter' must be provided")

        result = await self.collection.delete_one(query)
        return result.deleted_count > 0

    @staticmethod
    def validate_object_id(id: str):
        try:
            return ObjectId(id)
        except InvalidId:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid ID format"
            )
        

    @staticmethod
    def ensure_owner(resource_owner_id, current_user_id, message="You are not allowed to do this"):
        if str(resource_owner_id) != str(current_user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=message
            )
        
    @staticmethod
    def encode_cursor(doc, sort_by="latest"):
        payload = {
            "_id": str(doc["_id"]),
            "created_at": doc["created_at"].isoformat(),
            "like_count": doc.get("like_count", 0)
        }

        payload["sort_by"] = sort_by

        return base64.b64encode(
            json.dumps(payload).encode()
        ).decode()
    
    @staticmethod
    def decode_cursor(cursor: str):
        try:
            data = json.loads(base64.b64decode(cursor).decode())
        except Exception:
            raise HTTPException(
                status_code=403,
                detail="Invalid cursor"
            )

        return {
            "_id": ObjectId(data["_id"]),
            "created_at": datetime.fromisoformat(data["created_at"]),
            "like_count": data.get("like_count", 0),
            "sort_by": data.get("sort_by", "latest")
        }

