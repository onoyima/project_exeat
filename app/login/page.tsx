'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { GraduationCap, Eye, EyeOff, AlertCircle } from 'lucide-react';


// Password strength calculation
function getPasswordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (password.length >= 12) score++;
  return score;
}
function getStrengthColor(score: number): string {
  if (score <= 1) return 'bg-red-500';
  if (score <= 3) return 'bg-yellow-400';
  return 'bg-green-500';
}
function getStrengthLabel(score: number): string {
  if (score <= 1) return 'Weak';
  if (score <= 3) return 'Medium';
  return 'Strong';
}
function isValidEmail(email: string): boolean {
  // Simple email regex
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * LoginPage component renders the login form and handles API-based authentication.
 */
export default function LoginPage() {
  // State for storing user credentials (email and password)
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  // State to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);
  // State to show loading spinner during login
  const [isLoading, setIsLoading] = useState(false);
  // State to display error messages
  const [error, setError] = useState('');
  // State to display success messages
  const [success, setSuccess] = useState('');

  // Email validity (memoized to prevent unnecessary recalculations)
  const emailIsValid = credentials.email.length > 0 ? isValidEmail(credentials.email) : null;
  
  // Password strength (only calculate when password changes)
  const passwordStrength = credentials.password.length > 0 ? getPasswordStrength(credentials.password) : 0;
  const passwordStrengthLabel = credentials.password.length > 0 ? getStrengthLabel(passwordStrength) : '';
  const passwordStrengthColor = getStrengthColor(passwordStrength);

  // Check if user is already authenticated and redirect (only once on mount)
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (token && userRole) {
      // Use window.location for faster redirect
      if (userRole === 'student') {
        window.location.href = '/student/dashboard';
      } else if (userRole === 'staff') {
        window.location.href = '/staff/dashboard';
      }
    }
  }, []);

  // Show loading overlay for authentication check
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  useEffect(() => {
    // Quick auth check
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (token && userRole) {
      // User is authenticated, redirect immediately
      if (userRole === 'student') {
        window.location.href = '/student/dashboard';
      } else if (userRole === 'staff') {
        window.location.href = '/staff/dashboard';
      }
    } else {
      // User is not authenticated, show login form
      setIsCheckingAuth(false);
    }
  }, []);

  /**
   * Handles login form submission with API authentication.
   * @param e React.FormEvent - form submit event
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    
    // Prevent multiple submissions
    if (isLoading) return;
    
    setError(''); // Clear any previous error
    setSuccess(''); // Clear any previous success
    setIsLoading(true); // Show loading spinner
    
    try {
      const res = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        credentials: "omit", // Explicitly prevent cookies
        body: JSON.stringify(credentials),
      });
      
      if (!res.ok) {
        let errorMessage = "Login failed";
        let errorCode = res.status;
        let errorData: any = null;
        try {
          errorData = await res.clone().json();
        } catch {
          // Not JSON, try to get text
          try {
            const text = await res.text();
            if (text) errorMessage = text;
          } catch {
            // Ignore
          }
        }
        if (errorData && errorData.message) {
          if (errorCode === 404 && errorData.message.toLowerCase().includes('email not found')) {
            errorMessage = 'Email not valid';
          } else if (errorCode === 401 && errorData.message.toLowerCase().includes('incorrect password')) {
            errorMessage = 'Incorrect password';
          } else {
            errorMessage = errorData.message;
          }
        } else if (errorCode === 404) {
          errorMessage = 'Email not valid';
        } else if (errorCode === 401) {
          errorMessage = 'Incorrect password';
        } else if (res.statusText && res.statusText !== '') {
          errorMessage = res.statusText;
        } else {
          errorMessage = `Error ${errorCode}`;
        }
        setError(errorMessage);
        setSuccess("");
        setIsLoading(false);
        return; // Exit early on error
      }
      
      // Only parse JSON if response is ok
      const data = await res.json();
      
      // Additional check to ensure we have valid data
      if (!data.token || !data.role) {
        setError("Invalid response from server");
        setSuccess("");
        setIsLoading(false);
        return;
      }
      
      // Store token and user data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userRole", data.role);
      localStorage.setItem("userRoles", JSON.stringify(data.roles || []));
      
      setError("");
      setSuccess(data.message || "Login successful! Redirecting...");
      
      // Redirect by role immediately
      if (data.role === "student") {
        window.location.href = "/student/dashboard";
      } else if (data.role === "staff") {
        window.location.href = "/staff/dashboard";
      } else {
        window.location.href = "/student/dashboard"; // Fallback
      }
      
    } catch (err) {
      setError("Network error. Please try again.");
      setSuccess("");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading overlay while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        {/* Background Pattern for visual appeal */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 gradient-bg"></div>
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23114629' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          />
        </div>

        {/* Loading Card */}
        <Card className="w-full max-w-md relative z-10 shadow-2xl border-0">
          <CardHeader className="text-center space-y-4 pb-8">
            {/* University Logo Circle */}
            <div className="mx-auto w-20 h-20 gradient-bg rounded-full flex items-center justify-center mb-4">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-university-primary">Veritas University</CardTitle>
              <CardDescription className="text-gray-600">Checking authentication...</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 text-sm">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    // Center the login card on the page
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-university-light">
      {/* Background Pattern for visual appeal */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-10 max-h-screen overflow-hidden">
        <div className="absolute inset-0 gradient-bg"></div>
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23114629' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")`
          }}
        />
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 bg-white/95 backdrop-blur-md">
        <CardHeader className="text-center space-y-4 pb-8">
          {/* University Logo Circle */}
          <div className="mx-auto w-20 h-20 gradient-bg rounded-full flex items-center justify-center mb-4">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-university-primary">Veritas University</CardTitle>
            <CardDescription className="text-lg font-medium text-university-secondary mt-2">
              Digital Exeat System
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error and Success Messages */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </Alert>
          )}
          {success && (
            <Alert variant="default" className="mb-4">
              <span>{success}</span>
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Email/Username Input */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                Email Address or Matric Number
              </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter Your Email"
              value={credentials.email}
              onChange={(e) => setCredentials({...credentials, email: e.target.value})}
              className="h-12 border-2 border-gray-200 focus:border-university-primary"
              required
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              title={credentials.email.length > 0 && !emailIsValid ? 'Please enter a valid email address' : ''}
            />
              <p className="text-xs text-gray-500">
                Students: e.g: vug/coc/23/1232@hd.veritas.edu.ng <br/>
                Staff: e.g: surnameb@veritas.edu.ng 
              </p>
              {credentials.email.length > 0 && (
                <div className={`text-xs mt-1 ${emailIsValid ? 'text-green-600' : 'text-red-600'}`}>{emailIsValid ? 'Valid email address' : 'Not a valid email address (plain string or invalid email)'}</div>
              )}
          </div>

            {/* Password Input with show/hide toggle */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
              <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              className={`h-12 border-2 pr-12 ${!emailIsValid && credentials.email.length > 0 ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'border-gray-200 focus:border-university-primary'}`}
              required
              autoComplete="current-password"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              disabled={credentials.email.length > 0 && !emailIsValid}
              tabIndex={credentials.email.length > 0 && !emailIsValid ? -1 : 0}
              title={credentials.email.length > 0 && !emailIsValid ? 'Enter a valid email address to enable password input' : ''}
            />
                {/* Button to toggle password visibility */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {/* Password strength bar */}
            <div className="mt-2 h-2 w-full bg-gray-200 rounded">
              <div
                  className={`h-2 rounded transition-all duration-300 ${passwordStrengthColor}`}
                style={{ width: `${(passwordStrength / 5) * 100}%` }}
              />
            </div>
            <div className="text-xs mt-1 text-gray-500">
                {credentials.password.length === 0 ? '' : passwordStrengthLabel + ' password'}
              </div>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading || !credentials.email || !credentials.password}
              className="w-full h-12 gradient-bg text-white font-semibold text-base hover:opacity-90 transition-all duration-300"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  {/* Loading spinner */}
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Additional Links and Support Info */}
          <div className="text-center space-y-3 pt-4 border-t">
            {/* <Button variant="ghost" className="text-university-primary hover:text-university-secondary">
              Forgot Password?
            </Button> */}
            {/* <div className="text-xs text-gray-500 space-y-1">
              <p>Having trouble logging in?</p>
              <p>Email: support@veritas.edu.ng | Phone: +234 XXX XXX XXXX</p>
            </div> */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}