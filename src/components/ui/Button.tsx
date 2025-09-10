import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export default function Button({ children, className = '', ...rest }: ButtonProps) {
  return (
    <button
      className={`rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
