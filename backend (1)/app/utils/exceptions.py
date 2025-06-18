class AuthError(Exception):
    """Base class for authentication-related exceptions."""
    def __init__(self, message, status_code=401):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

class InvalidCredentials(AuthError):
    """Exception raised for invalid login credentials."""
    def __init__(self, message="Invalid email or password."):
        super().__init__(message, status_code=401)

class AccountLocked(AuthError):
    """Exception raised when a user's account is locked."""
    def __init__(self, message="Account locked due to too many failed login attempts. Please contact support."):
        super().__init__(message, status_code=403)

class UserNotFound(AuthError):
    """Exception raised when a user is not found."""
    def __init__(self, message="User not found."):
        super().__init__(message, status_code=404)

class TokenRevoked(AuthError):
    """Exception raised when a JWT token has been revoked."""
    def __init__(self, message="Token has been revoked."):
        super().__init__(message, status_code=401)

class MissingToken(AuthError):
    """Exception raised when a JWT token is missing."""
    def __init__(self, message="Request does not contain an access token."):
        super().__init__(message, status_code=401)

class InvalidToken(AuthError):
    """Exception raised when a JWT token is invalid."""
    def __init__(self, message="Signature verification failed."):
        super().__init__(message, status_code=401)

class ForbiddenError(AuthError):
    """Exception raised when a user does not have the necessary permissions."""
    def __init__(self, message="You do not have permission to access this resource."):
        super().__init__(message, status_code=403)
