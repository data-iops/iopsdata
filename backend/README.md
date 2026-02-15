# iOpsData Backend

AI-native data workspace backend - Query, analyze, and visualize your data with natural language.

## Setup

### 1. Install Dependencies

```bash
pip install -e .
```

For development with additional tools:
```bash
pip install -e ".[dev]"
```

### 2. Environment Configuration

Copy the example environment file:
```bash
copy .env.example .env
```

Generate a FERNET_KEY for encryption:
```bash
python -c "from cryptography.fernet import Fernet; print('FERNET_KEY=' + Fernet.generate_key().decode())"
```

Add the generated key to your `.env` file along with other required variables.

### 3. Running the Server

```bash
python -m uvicorn iopsdata.api.main:app --reload
```

The server will be available at http://127.0.0.1:8000

### 4. API Documentation

Once running, visit:
- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc

## Development

### Running Tests
```bash
pytest
```

### Code Formatting
```bash
ruff check .
ruff format .
```

### Type Checking
```bash
mypy src/
```