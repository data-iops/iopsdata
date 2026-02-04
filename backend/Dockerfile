FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY backend/pyproject.toml backend/poetry.lock* /app/

RUN pip install --no-cache-dir --upgrade pip \
    && if [ -f poetry.lock ]; then pip install --no-cache-dir poetry && poetry config virtualenvs.create false && poetry install --no-interaction --no-ansi; fi

COPY backend/src /app/src

ENV PYTHONPATH=/app/src

EXPOSE 8000

CMD ["uvicorn", "iopsdata.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
