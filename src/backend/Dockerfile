FROM python:3.11-slim

WORKDIR /app/src/backend

RUN apt-get update && apt-get install -y wget tar curl \
 && wget https://fastdl.mongodb.org/tools/db/mongodb-database-tools-debian12-x86_64-100.12.2.tgz \
 && tar -xzf mongodb-database-tools-debian12-x86_64-100.12.2.tgz \
 && mv mongodb-database-tools-*/bin/* /usr/local/bin/ \
 && rm -rf mongodb-database-tools* /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONPATH=/app/src/backend
EXPOSE 8080

CMD ["bash", "./scripts/start.sh"]
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8080", "--reload"]
