import React from 'react';
import { AuthForm } from './AuthForm';
import { Link } from 'react-router-dom';

export function Signup() {
  return (
    <div className="h-[calc(100vh-4rem)] mt-20 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Farm Fresh Eggs</h1>
        <p className="text-gray-300">Create an account to start ordering</p>
      </div>
      
      <AuthForm type="signup" />
      
      <p className="mt-8 text-gray-300">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-400 hover:text-blue-300">
          Sign in
        </Link>
      </p>
    </div>
  );
}