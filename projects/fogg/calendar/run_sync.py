"""Run FOGG calendar sync"""

import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent))

from src.sync_fogg_calendar import main

if __name__ == "__main__":
    main()