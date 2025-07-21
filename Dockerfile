FROM python:3.11-slim
WORKDIR /app

RUN apt-get update && apt-get install -y wget tar curl \
 && wget https://fastdl.mongodb.org/tools/db/mongodb-database-tools-debian12-x86_64-100.12.2.tgz \
 && tar -xzf mongodb-database-tools-debian12-x86_64-100.12.2.tgz \
 && mv mongodb-database-tools-*/bin/* /usr/local/bin/ \
 && rm mongodb-database-tools-debian12-x86_64-100.12.2.tgz \
 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN sed -i 's/\r$//' scripts/start.sh && chmod +x scripts/start.sh

CMD ["bash", "./scripts/start.sh"]
