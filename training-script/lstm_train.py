import argparse
import os
import pandas as pd
import numpy as np
from keras.models import Sequential
from keras.layers import LSTM
from keras.layers import Dense
from keras.layers import Dropout
from keras.metrics import MeanSquaredError
from keras.backend import sum, square, mean
from keras.models import load_model
from sklearn.preprocessing import StandardScaler

# inference functions ---------------
def model_fn(model_dir):    
    return load_model(os.path.join(model_dir, '1'))

class BaseLSTMModel():
    def r2_score(y_true, y_pred):
        SS_res = sum(square(y_true-y_pred))
        SS_tot = sum(square(y_true-mean(y_true)))
        return (1-SS_res/SS_tot)
    
    def __init__(self, units_layer1=50, units_dense1=32, dropout_rate=0.2, batch_size = 32, activation='relu', epoch=25, validation_split=0, verbose=0):
        self.units_layer1 = units_layer1
        self.units_dense1 = units_dense1
        self.dropout_rate = dropout_rate
        self.batch_size = batch_size
        self.activation = activation
        self.validation_split = validation_split
        self.epoch = epoch
        self.verbose = verbose
    
    def fit(self, X, y):       
        self.model = Sequential()
        self.model.add(LSTM(self.units_layer1, self.activation, input_shape=(X.shape[1], X.shape[2]), return_sequences=False))
        if (self.units_dense1 > 0):
            self.model.add(Dense(self.units_dense1))
        self.model.add(Dropout(self.dropout_rate))
        self.model.add(Dense(1))
        self.model.compile(loss='mean_squared_error', optimizer='adam', metrics=[BaseLSTMModel.r2_score, MeanSquaredError()]) 
        return self.model.fit(X, y, epochs=self.epoch, batch_size=self.batch_size, verbose=self.verbose, shuffle=False, validation_split=self.validation_split)
        

    def predict(self, X):
        return self.model.predict(X)
    
    def evaluate(self, x_test, y_test):
        return self.model.evaluate(x_test, y_test)
    
    def summary(self):
        self.model.summary()


if __name__ == "__main__":
    print('Training started')
    parser = argparse.ArgumentParser()
    parser.add_argument('--train', type=str, default=os.environ.get('SM_CHANNEL_TRAIN'))
    parser.add_argument('--model-dir', type=str, default=os.environ.get('SM_MODEL_DIR'))
    parser.add_argument('--output-data-dir', type=str, default=os.environ.get('SM_OUTPUT_DATA_DIR'))

    parser.add_argument('--units_layer1', type=int, default=50)
    parser.add_argument('--dropout_rate', type=float, default=0.2)
    parser.add_argument('--units_dense1', type=int, default=32)
    parser.add_argument('--window_size', type=int, default=10)
    parser.add_argument('--batch_size', type=int, default=32)
    parser.add_argument('--activation', type=str, default='sigmoid')
    parser.add_argument('--epoch', type=int, default=10)
    parser.add_argument('--currency', type=str)
    args, _ = parser.parse_known_args()

    print('Args', args)
    currency = args.currency
    
    input_data = os.path.join(args.train, f'USD_{currency}_features.csv')  
    df = pd.read_csv(input_data, parse_dates=[0], index_col=0)

    df['1d_future'] = df['1d_delta'].shift(-1)
    df.dropna(inplace=True)
    df.apply()

    ## Prepare data for model training

    scaler = StandardScaler();
    data = scaler.fit_transform(df)
    data = pd.DataFrame(data, index=df.index, columns = df.columns)
    time_steps = args.window_size
    train_percentage = 0.8
    
    features = np.array(data.columns).tolist()
    features.remove('1d_future')
    train_size = int(train_percentage * data.shape[0])
    train_data = data[:train_size]
    train_data_features = train_data[features].values
    train_delta = train_data[['1d_future']].values

    x = []
    y = []
    for i in range(time_steps, len(train_data_features)):
        x.append(train_data_features[i - time_steps: i, 0:train_data_features.shape[1]])
        y.append(train_delta[i-1:i, 0])
        
    x_train, y_train = np.array(x), np.array(y)
    
    test_data = data[train_size:]
    test_data_features = test_data[features].values
    test_delta = test_data[['1d_future']].values
    x_test = []
    y_test = []
    for i in range(time_steps, len(test_data_features)):
        x_test.append(test_data_features[i - time_steps: i, 0: test_data_features.shape[1]])
        y_test.append(test_delta[i-1:i, 0])

    x_test, y_test = np.array(x_test), np.array(y_test)

    model = BaseLSTMModel(
        units_layer1=args.units_layer1,
        units_dense1=args.units_dense1,
        dropout_rate=args.dropout_rate,
        batch_size=args.batch_size,
        epoch=args.epoch,
        activation=args.activation
    )

    model.fit(x_train, y_train)
    loss, r2, mse = model.evaluate(x_test, y_test)

    print(f'Mean Squared Error: {mse:.6f}')
    print(f'R2 Score: {r2:.6f}')
    model.model.save(os.path.join(args.model_dir, '1'))