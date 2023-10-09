FROM lambci/lambda:build-python3.8

# Define environment variables
ENV TA_LIB_VERSION=0.4.0
ENV TA_LIB_DOWNLOAD_URL=http://prdownloads.sourceforge.net/ta-lib/ta-lib-${TA_LIB_VERSION}-src.tar.gz

# Install TA-Lib C library
RUN yum -y install tar xz
RUN curl -L ${TA_LIB_DOWNLOAD_URL} | tar xvz
RUN cd ta-lib/ && \
    ./configure && \
    make && \
    make install && \
    cd ../ && rm -rf ta-lib/
COPY requirement.txt .
# Install TA-Lib Python wrapper
RUN pip install -r requirement.txt -t /var/task

# Copy the compiled libraries to the defined path
WORKDIR /var/task