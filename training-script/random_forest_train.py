import argparse
import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
from joblib import dump, load

# inference functions ---------------
def model_fn(model_dir):
    clf = load(os.path.join(model_dir, "model.joblib"))
    return clf

if __name__ == "__main__":
    print('Training started')
    parser = argparse.ArgumentParser()
    parser.add_argument('--train', type=str, default=os.environ.get('SM_CHANNEL_TRAIN'))
    parser.add_argument('--model-dir', type=str, default=os.environ.get('SM_MODEL_DIR'))
    parser.add_argument('--output-data-dir', type=str, default=os.environ.get('SM_OUTPUT_DATA_DIR'))

    parser.add_argument('--n_estimators', type=int, default=100)
    parser.add_argument('--max_depth', type=int, default=15)
    parser.add_argument('--max_features', type=str, default='auto')
    parser.add_argument('--min_samples_split', type=int, default=10)
    parser.add_argument('--min_samples_leaf', type=int, default=20)
    parser.add_argument('--currency', type=str)
    args, _ = parser.parse_known_args()

    print('Args', args)
    currency = args.currency
    input_data = os.path.join(args.train, f'USD_{currency}_features.csv')  
    df = pd.read_csv(input_data, parse_dates=[0], index_col=0)

    df['1d_future'] = df['1d_delta'].shift(-1)
    df.dropna(inplace=True)

    ## Prepare data for model training

    scaler = StandardScaler();
    data = scaler.fit_transform(df)
    data = pd.DataFrame(data, index=df.index, columns = df.columns)
    features = np.array(data.columns).tolist()
    features.remove('1d_future')
    x = data[features]
    y = data['1d_future']
    train_size = int(0.7 * y.shape[0])
    x_train = x[:train_size]
    y_train = y[:train_size]
    x_test = x[train_size:]
    y_test = y[train_size:]

    rf_model = RandomForestRegressor(
        n_estimators=args.n_estimators,
        max_depth=args.max_depth,
        max_features=args.max_features,
        min_samples_split=args.min_samples_split,
        min_samples_leaf=args.min_samples_leaf,
        random_state=42
    )

    rf_model.fit(x_train, y_train)
    y_pred = rf_model.predict(x_test)
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    print(f'Mean Squared Error: {mse:.6f}')
    print(f'R2 Score: {r2:.6f}')
    dump(rf_model, os.path.join(args.model_dir, 'model.joblib'))