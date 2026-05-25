FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY agent ./agent
COPY backtesting ./backtesting
COPY broker ./broker
COPY data ./data
COPY database ./database
COPY notifications ./notifications
COPY risk ./risk
COPY strategies ./strategies

RUN mkdir -p /data

EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.api:api --host 0.0.0.0 --port ${PORT:-8000}"]
