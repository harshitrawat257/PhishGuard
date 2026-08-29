import sys
import os

# Add backend directory to sys.path so modules like analyzers, auth, database are found
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from main import app
