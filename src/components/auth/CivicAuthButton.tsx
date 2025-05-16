import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Wallet, Shield } from "lucide-react";

interface CivicAuthButtonProps {
  onClick: () => Promise<void>;
  isLoading: boolean;
  disabled?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
  text?: string;
  showWallet?: boolean;
}

const CivicAuthButton: React.FC<CivicAuthButtonProps> = ({
  onClick,
  isLoading,
  disabled = false,
  variant = "default",
  className = "",
  text = "Sign in with Civic Auth",
  showWallet = true
}) => {  return (
    <Button
      variant={variant}
      type="button"
      className={`relative font-medium ${className}`}
      onClick={onClick}
      disabled={isLoading || disabled}
    >
      <span className="flex items-center justify-center w-full">
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <svg className="mr-2 h-4 w-4" viewBox="0 0 162 162" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M72.9 25.5c8.8 0 15.9 7.1 15.9 15.9s-7.1 15.9-15.9 15.9h-9.8c-5.5 0-9.9-4.5-9.9-9.9v-12c0-5.5 4.5-9.9 9.9-9.9h9.8z"/>
            <path fill="currentColor" d="M52.9 73.1c0-5.5 4.5-9.9 9.9-9.9h50.6c8.8 0 15.9 7.1 15.9 15.9s-7.1 15.9-15.9 15.9H62.8c-5.5 0-9.9-4.5-9.9-9.9V73.1z"/>
            <path fill="currentColor" d="M72.9 110.7c8.8 0 15.9 7.1 15.9 15.9s-7.1 15.9-15.9 15.9h-9.8c-5.5 0-9.9-4.5-9.9-9.9v-12c0-5.5 4.5-9.9 9.9-9.9h9.8z"/>
          </svg>
        )}
        {text}
        {showWallet && !isLoading && <Wallet className="ml-2 h-4 w-4" />}
        
        {/* Security badge */}
        <span className="absolute -right-2 -top-2 bg-green-100 dark:bg-green-900 rounded-full p-0.5 shadow-sm border border-green-200 dark:border-green-800">
          <Shield className="h-3 w-3 text-green-600 dark:text-green-400" />
        </span>
      </span>
    </Button>
  );
};

export default CivicAuthButton;
