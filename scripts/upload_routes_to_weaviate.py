import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

import weaviate
from pymongo import MongoClient
from sentence_transformers import SentenceTransformer
from weaviate.classes.init import Auth
from weaviate.classes.query import Filter

try:
    from dotenv import load_dotenv

    PROJECT_ROOT = Path(__file__).resolve().parent.parent
    load_dotenv(PROJECT_ROOT / ".env", override=False)
    load_dotenv(Path(__file__).with_name(".env.weaviate"), override=False)
except ImportError:
    pass


COLLECTION = os.environ.get("WEAVIATE_ROUTES_COLLECTION", "Routes")
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/trip2guide")
MONGO_DB = os.environ.get("MONGO_DB", "trip2guide")
MONGO_COLLECTION = os.environ.get("MONGO_ROUTES_COLLECTION", "routes")

EMBEDDING_MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"


def connect_weaviate():
    missing_variables = [
        name
        for name in ("WEAVIATE_URL", "WEAVIATE_API_KEY")
        if not os.environ.get(name)
    ]

    if missing_variables:
        raise RuntimeError(
            f"Missing required environment variables: {', '.join(missing_variables)}"
        )

    return weaviate.connect_to_weaviate_cloud(
        cluster_url=os.environ["WEAVIATE_URL"],
        auth_credentials=Auth.api_key(os.environ["WEAVIATE_API_KEY"]),
    )


def connect_mongo():
    client = MongoClient(MONGO_URI)
    database_name = urlparse(MONGO_URI).path.lstrip("/") or MONGO_DB
    return client, client[database_name][MONGO_COLLECTION]


def stringify_date(value: Any) -> str | None:
    if isinstance(value, datetime):
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)

        return value.isoformat().replace("+00:00", "Z")

    if value:
        return str(value)

    return None


def normalize_route(route: dict[str, Any]) -> dict[str, Any]:
    normalized_route = {
        "route_id": str(route.get("_id", "")),
        "name": route.get("name", ""),
        "description": route.get("description", ""),
        "cover_image": route.get("cover_image", ""),
        "city": route.get("city", ""),
        "country": route.get("country", ""),
        "distance": float(route.get("distance", 0)),
        "duration": int(route.get("duration", 0)),
        "difficulty": route.get("difficulty", ""),
        "tags": route.get("tags", []),
        "user_id": str(route.get("userId", "")),
        "created_at": stringify_date(route.get("createdAt")),
        "updated_at": stringify_date(route.get("updatedAt")),
    }

    return {key: value for key, value in normalized_route.items() if value is not None}


def route_to_text(route: dict[str, Any]) -> str:
    tags = ", ".join(route.get("tags", [])) if route.get("tags") else "No tags"

    return f"""
    Route name: {route.get("name")}
    Description: {route.get("description")}
    City or region: {route.get("city")}
    Country: {route.get("country")}
    Distance: {route.get("distance")} km
    Duration: {route.get("duration")} minutes
    Difficulty: {route.get("difficulty")}
    Tags: {tags}
    """


def get_routes_collection(client):
    if not client.collections.exists(COLLECTION):
        raise RuntimeError(f"Weaviate collection '{COLLECTION}' does not exist")

    return client.collections.get(COLLECTION)


def clear_routes_collection(routes_collection):
    result = routes_collection.data.delete_many(
        where=Filter.by_property("route_id").like("*"),
    )

    deleted_count = getattr(result, "successful", None)

    if deleted_count is None:
        print("Existing routes deleted from Weaviate Cloud.")
        return

    print(f"{deleted_count} existing routes deleted from Weaviate Cloud.")


def main():
    mongo_client = None
    weaviate_client = None

    try:
        mongo_client, routes_mongo_collection = connect_mongo()
        raw_routes = list(routes_mongo_collection.find({}))

        if not raw_routes:
            raise RuntimeError(f"No routes found in Mongo collection '{MONGO_COLLECTION}'")

        weaviate_client = connect_weaviate()
        print("Weaviate ready:", weaviate_client.is_ready())

        routes_weaviate_collection = get_routes_collection(weaviate_client)
        clear_routes_collection(routes_weaviate_collection)
        embedder = SentenceTransformer(EMBEDDING_MODEL)

        for raw_route in raw_routes:
            route = normalize_route(raw_route)
            text_for_embedding = route_to_text(route)
            vector = embedder.encode(text_for_embedding).tolist()

            routes_weaviate_collection.data.insert(properties=route, vector=vector)

        print(f"{len(raw_routes)} routes uploaded to Weaviate Cloud.")

    finally:
        if weaviate_client is not None:
            weaviate_client.close()

        if mongo_client is not None:
            mongo_client.close()


if __name__ == "__main__":
    main()
