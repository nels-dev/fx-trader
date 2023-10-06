import json
import logging
import os
from io import StringIO
import boto3
import pandas as pd
import pandas_ta as ta
import yfinance as yf
import nasdaqdatalink


logger = logging.getLogger()
logger.setLevel(logging.INFO)

def handle(event, context):
    ## The foreign currency
    ccy = 'CAD'

    ## The inflation dataset
    inf_dataset = 'RATEINF/INFLATION_CAN'

    ## The S3 bucket
    bucket = os.environ['BUCKET_NAME']

    ## API KEY
    api_key = os.environ['NASDAQ_API_KEY']
    nasdaqdatalink.ApiConfig.api_key = api_key

    fed_rates = nasdaqdatalink.get("FED/RIFSPFF_N_D")
    fed_rates = fed_rates['2004-01-01':]
    fccy_inflation_rate = nasdaqdatalink.get(inf_dataset)
    fccy_inflation_rate = fccy_inflation_rate['2003-11-30':]
    usa_inflation_rate = nasdaqdatalink.get("RATEINF/INFLATION_USA")
    usa_inflation_rate = usa_inflation_rate['2003-11-30':]

    ticker = yf.Ticker(ccy+ '=X')
    hist = ticker.history(period='max')
    hist = hist['2004-01-01':]
    hist.rename(columns={'Close':'close', 'Open':'open', 'High':'high', 'Low':'low'}, inplace=True)
    hist.drop(columns=['Dividends', 'Stock Splits', 'Volume'], inplace=True)

    hist.index = hist.index.date

    combined = hist \
        .merge(fed_rates, how='outer', left_index=True, right_index=True, suffixes=(None, "_fed")) \
        .merge(usa_inflation_rate, how='outer', left_index=True, right_index=True, suffixes=(None, "_usa_inf")) \
        .merge(fccy_inflation_rate, how='outer', left_index=True, right_index=True, suffixes=(None, "_fccy_inf"))

    combined.rename(columns={'Value':'fed_rate', 'Value_usa_inf':'usa_inf','Value_fccy_inf':'fccy_inf'}, inplace=True)
    # forward-fill fields with no data
    combined['fed_rate'].fillna(method='ffill', inplace=True)
    combined['usa_inf'].fillna(method='ffill', inplace=True)
    combined['fccy_inf'].fillna(method='ffill', inplace=True)
    combined['relative_inf'] = combined['usa_inf']/combined['fccy_inf']

    df=combined.copy().dropna()
    csv_buffer = StringIO()
    df.to_csv(csv_buffer)

    s3_resource = boto3.resource('s3')
    s3_resource.Object(bucket, 'USD_CAD_market_data.csv').put(Body=csv_buffer.getvalue())
    
    return 'Completed'