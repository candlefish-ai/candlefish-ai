"""Google API Authentication Module"""

import os

from google.oauth2.credentials import Credentials
from google.oauth2.service_account import Credentials as ServiceAccountCredentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import Resource, build

# Required scopes for calendar and group management
SCOPES = [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/admin.directory.group.readonly",
]


def get_credentials() -> Credentials:
    """Get Google API credentials from environment or ADC.

    Returns:
        Credentials: Authenticated Google credentials
    """
    creds = None

    # First check for service account JSON path
    service_account_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
    if service_account_path and os.path.exists(service_account_path):
        creds = ServiceAccountCredentials.from_service_account_file(
            service_account_path, scopes=SCOPES
        )
        return creds

    # Try using Application Default Credentials (ADC)
    try:
        import google.auth

        creds, project = google.auth.default(scopes=SCOPES)
        return creds
    except Exception as e:
        print(f"ADC authentication failed: {e}")

    # Fall back to OAuth2 flow if available
    if os.path.exists("credentials.json"):
        flow = InstalledAppFlow.from_client_secrets_file("credentials.json", SCOPES)
        creds = flow.run_local_server(port=0)

    if not creds:
        raise ValueError(
            "No valid authentication method found. Please set up ADC or provide credentials.json"
        )

    return creds


def verify_scopes(creds: Credentials) -> bool:
    """Verify that credentials have required scopes.

    Args:
        creds: Google credentials to verify

    Returns:
        bool: True if all required scopes are present
    """
    if hasattr(creds, "scopes"):
        return all(scope in creds.scopes for scope in SCOPES)
    return True  # Service accounts don't expose scopes attribute


def build_calendar_service() -> Resource:
    """Build Google Calendar API service.

    Returns:
        Resource: Calendar API service instance
    """
    creds = get_credentials()
    return build("calendar", "v3", credentials=creds)


def build_directory_service() -> Resource:
    """Build Google Directory API service.

    Returns:
        Resource: Directory API service instance
    """
    creds = get_credentials()
    return build("admin", "directory_v1", credentials=creds)