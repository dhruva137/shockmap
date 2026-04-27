FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y gcc g++ && rm -rf /var/lib/apt/lists/*

# Copy the entire project first to avoid path resolution issues in Render's builder
COPY . /app

# Install dependencies from the copied backend folder
RUN pip install --no-cache-dir -r backend/requirements.txt

# Set environment variables
ENV PORT=8080

# Run the unified backend application
CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT}"]
