import requests
import os
import pymongo
import datetime
def handle(event, context):
    api_key = os.environ['FIXER_API_KEY']
    host = os.environ['MONGO_HOST']
    username = os.environ['MONGO_USERNAME']
    password = os.environ['MONGO_PASSWORD']
    db_name = os.environ['MONGO_DB_NAME']
    ## Euro is restricted for free plans
    response = requests.get(f"http://data.fixer.io/api/latest?access_key={api_key}&base=EUR")
    data = response.json()
    base = data['base']
    usd_rate = data['rates']['USD']
    converted_rates = [{"currency": currency, "rate": rate/usd_rate} for currency, rate in data["rates"].items()]

    
    # Connect to DocumentDB
    client = pymongo.MongoClient(f"mongodb+srv://{username}:{password}@{host}/?retryWrites=true&w=majority")
    db = client[db_name]
    collection = db['quotes']
    collection.delete_many({})
    collection.insert_many(converted_rates)
    
    quote_hist = db['quotes_history']
    quote_hist.insert_one({"updated": datetime.datetime.now(tz=datetime.timezone.utc), "rates": converted_rates})
    client.close()

    