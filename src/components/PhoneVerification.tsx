// src/components/PhoneVerification.tsx
'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/system/config/firebase';
import { RecaptchaService } from '@/system/services/auth/recaptcha';
import { verificationService, VerificationError } from '@/system/services/auth/verification';
import { LoadingSpinner } from './ui/feedback/LoadingSpinner';
import { ErrorMessage } from './ui/feedback/ErrorMessage';

interface PhoneVerificationProps {
  wallet: string;
  onVerificationComplete: () => void;
  onCancel?: () => void;
}

export function PhoneVerification({ 
  wallet,
  onVerificationComplete,
  onCancel 
}: PhoneVerificationProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recaptchaService] = useState(() => new RecaptchaService(auth));

  useEffect(() => {
    // Initialize reCAPTCHA when component mounts
    const initializeRecaptcha = async () => {
      try {
        await recaptchaService.initializeVerifier('recaptcha-container');
        await recaptchaService.render();
      } catch (error) {
        setError('Failed to initialize verification system');
        console.error(error);
      }
    };

    initializeRecaptcha();
    
    // Cleanup function to clear recaptcha when component unmounts
    return () => {
      try {
        recaptchaService.cleanup();
      } catch (error) {
        console.error('Error cleaning up recaptcha:', error);
      }
    };
  }, [recaptchaService]);

  const handleSendCode = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const verifier = recaptchaService.getVerifier();
      const verId = await verificationService.sendVerificationCode(
        phoneNumber,
        verifier
      );
      
      setVerificationId(verId);
      setShowCodeInput(true);
    } catch (error) {
      if (error instanceof VerificationError) {
        setError(`${error.message} (${error.code})`);
      } else {
        setError('Failed to send verification code');
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const isVerified = await verificationService.verifyCode(
        verificationId,
        verificationCode,
        wallet
      );

      if (isVerified) {
        onVerificationComplete();
      } else {
        setError('Verification failed');
      }
    } catch (error) {
      if (error instanceof VerificationError) {
        setError(`${error.message} (${error.code})`);
      } else {
        setError('Invalid verification code');
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Basic US phone number formatting
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow">
      <div className="text-lg font-medium">Phone Verification</div>
      
      <div id="recaptcha-container" className="mb-4" />
      
      {!showCodeInput ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
              placeholder="+1 (555) 555-0123"
              className="w-full px-3 py-2 border rounded-lg"
              disabled={isLoading}
            />
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-500 mt-1">
                Test numbers: +16505550001, +16505550002, +16505550003
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleSendCode}
              disabled={isLoading || !phoneNumber}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : 'Send Code'}
            </button>
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Verification Code
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter 6-digit code"
              className="w-full px-3 py-2 border rounded-lg"
              disabled={isLoading}
            />
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-500 mt-1">
                Test code: 123456
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleVerifyCode}
              disabled={isLoading || verificationCode.length !== 6}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : 'Verify'}
            </button>
            <button
              onClick={() => setShowCodeInput(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {error && (
        <ErrorMessage message={error} />
      )}
    </div>
  );
}
