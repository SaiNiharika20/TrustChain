FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ backend/
COPY dataset/ dataset/
COPY smart-contract/ smart-contract/

ENV FLASK_ENV=production
ENV PYTHONUNBUFFERED=1
ENV FLASK_PORT=5000

EXPOSE 5000

CMD ["python", "-m", "backend.app"]
