import React, { useState } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

interface AuthPageProps {
  onAuthenticate: (status: boolean, userData?: any) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthenticate }) => {
  const [isLoginView, setIsLoginView] = useState(true);  const handleLogin = (email: string, password: string, userData?: any) => {
    // Handle successful login
    onAuthenticate(true, userData);
  };

  const handleSignup = (userData: any) => {
    // After signup, typically would show a success message
    // or directly log the user in
    onAuthenticate(true, userData);
  };

  const switchToSignup = () => {
    setIsLoginView(false);
  };

  const switchToLogin = () => {
    setIsLoginView(true);
  };  return (
    <div className="flex justify-center items-center w-full mx-auto px-4 sm:px-0 sm:max-w-md">
      <div className={`w-full transition-all duration-300 ease-in-out ${isLoginView ? 'opacity-100 scale-100' : 'opacity-0 scale-95 absolute'}`}>
        {isLoginView && <LoginForm onLogin={handleLogin} onSwitchToSignup={switchToSignup} />}
      </div>
      <div className={`w-full transition-all duration-300 ease-in-out ${!isLoginView ? 'opacity-100 scale-100' : 'opacity-0 scale-95 absolute'}`}>
        {!isLoginView && <SignupForm onSignup={handleSignup} onSwitchToLogin={switchToLogin} />}
      </div>
    </div>
  );
};

export default AuthPage;
