export interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
}

export const validateEmail = (email: string): string | null => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return null;
};

export const validatePassword = (password: string): string | null => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters long';
    if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
    return null;
};

export const validateName = (name: string, fieldName: string): string | null => {
    if (!name) return `${fieldName} is required`;
    if (name.trim().length < 2) return `${fieldName} must be at least 2 characters long`;
    if (!/^[a-zA-Z\s-']+$/.test(name)) return `${fieldName} contains invalid characters`;
    return null;
};

export const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
};

export const validateLoginForm = (email: string, password: string): ValidationResult => {
    const errors: Record<string, string> = {};
    
    const emailError = validateEmail(email);
    if (emailError) errors.email = emailError;
    
    if (!password) errors.password = 'Password is required';
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

export const validateRegisterForm = (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    confirmPassword: string
): ValidationResult => {
    const errors: Record<string, string> = {};
    
    const firstNameError = validateName(firstName, 'First name');
    if (firstNameError) errors.firstName = firstNameError;
    
    const lastNameError = validateName(lastName, 'Last name');
    if (lastNameError) errors.lastName = lastNameError;
    
    const emailError = validateEmail(email);
    if (emailError) errors.email = emailError;
    
    const passwordError = validatePassword(password);
    if (passwordError) errors.password = passwordError;
    
    const confirmPasswordError = validateConfirmPassword(password, confirmPassword);
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};
