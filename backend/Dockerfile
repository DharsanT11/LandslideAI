FROM python:3.12-slim

WORKDIR /app

# Copy requirements file first to leverage Docker cache
COPY requirements.txt .

# Install PyTorch CPU-only first (avoids downloading ~2GB CUDA GPU version)
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Install remaining dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose the API port
EXPOSE 5000

# Start the Flask app
CMD ["python", "run_server.py"]
