rm -rf dependencies/python
rm -rf dependencies/lib
mkdir dependencies/lib
docker build -t ta-lib-lambda .
docker run -itd --name talib-container ta-lib-lambda /bin/bash
docker cp talib-container:/var/task dependencies/python
docker cp talib-container:/usr/local/lib/libta_lib.so.0.0.0 dependencies/lib/libta_lib.so.0
docker stop talib-container
docker rm talib-container