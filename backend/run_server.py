"""
Entry point for the Landslide Early Warning System backend.

Usage:
    python run_server.py
"""
import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import create_app

if __name__ == '__main__':
    print("=" * 60)
    print("  AI-Based Landslide Early Warning System")
    print("  Backend Server")
    print("=" * 60)

    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=False)
