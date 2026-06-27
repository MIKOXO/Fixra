const errorMap = [
  [/^A user with this email already exists/, 'This email is already registered. Try logging in instead.'],
  [/^Invalid email or password/, 'Incorrect email or password. Please try again.'],
  [/^Account deactivated/, 'This account has been deactivated. Please contact support.'],
  [/^Unable to log in/, 'We could not log you in. Please check your credentials and try again.'],
  [/^Unable to register$/, 'We could not create your account. Please try again.'],
  [/^Unable to complete invite registration/, 'We could not complete your registration. Please try again.'],
  [/^Something went wrong/, 'Something went wrong on our end. Please try again.'],
  [/^User not found/, 'We could not find your account.'],
  [/^Invalid or expired access token/, 'Your session has expired. Please log in again.'],
  [/^Access token missing/, 'Your session has expired. Please log in again.'],
  [/^Invalid or expired refresh token/, 'Your session has expired. Please log in again.'],
  [/^Refresh token missing/, 'Your session has expired. Please log in again.'],
  [/^Unauthorized$/, 'Your session has expired. Please log in again.'],
  [/^Google authentication failed/, 'Google sign-in was not successful. Please try again.'],
  [/^Google OAuth is not configured yet/, 'Google sign-in is not available right now. Please use email login.'],
  [/^Route not found/, 'Something went wrong. Please try again.'],
  [/^Request failed$/, 'Something went wrong. Please check your connection and try again.'],
];

export const getUserFriendlyError = (errorMessage) => {
  if (!errorMessage) return null;
  for (const [pattern, friendly] of errorMap) {
    if (pattern.test(errorMessage)) return friendly;
  }
  return errorMessage;
};

export const ERROR_TIMEOUT = 7000;
export const SUCCESS_TIMEOUT = 4000;
