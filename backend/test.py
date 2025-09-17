from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv("COSMOS_CONN_STR"))
db = client[os.getenv("DB_NAME")]
collection = db[os.getenv("COLLECTION_NAME")]

print("Documents in collection:", collection.count_documents({}))
first_doc = collection.find_one()
print("Sample document:", first_doc)
