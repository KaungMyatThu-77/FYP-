import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app

def save_file(file):
    """
    Saves an uploaded file to the UPLOAD_FOLDER with a secure, unique name.
    Returns the relative URL path to the saved file.
    """
    # Check if the file has an allowed extension
    filename = secure_filename(file.filename)
    if '.' not in filename or \
       filename.rsplit('.', 1)[1].lower() not in current_app.config['ALLOWED_EXTENSIONS']:
        raise ValueError("File type not allowed.")

    # Generate a unique filename to prevent overwrites and conflicts
    # Format: <uuid>.<extension>
    extension = filename.rsplit('.', 1)[1].lower()
    unique_filename = f"{uuid.uuid4()}.{extension}"

    # Ensure the upload directory exists
    upload_folder = current_app.config['UPLOAD_FOLDER']
    os.makedirs(upload_folder, exist_ok=True)

    # Save the file
    file_path = os.path.join(upload_folder, unique_filename)
    file.save(file_path)

    # Return the URL path for storage in the database
    return f"uploads/{unique_filename}"
