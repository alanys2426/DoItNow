
// This is to check if an email looks valid
// Checks for: something@something.something
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MIN_PASSWORD_LENGTH = 8

// Function to check if an email is valid
export const isValidEmail = (value: string) => {
    // Remove extra spaces from start/end of the input
    const trimmedValue = value.trim()

    // Test trimmed email against the pattern
    // test() --> a regex function that returns true/false depending
    // on whether the string matches the pattern
    return EMAIL_PATTERN.test(trimmedValue);
}
