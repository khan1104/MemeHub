
from enum import Enum

class AuthProviders(str,Enum):
    PROVIDER_GOOGLE = "google"
    PROVIDER_EMAIL = "email"
    PROVIDER_EMAIL_GOOGLE = "email+google" 

