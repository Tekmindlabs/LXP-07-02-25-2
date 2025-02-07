import * as React from 'react';
import { Button } from '@/components/ui/button';
import { type ButtonProps } from '@/components/ui/button';

interface CustomButtonProps extends ButtonProps {
  children: React.ReactNode;
}

export const CustomButton = React.forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ children, className, ...props }, ref) => {
    const defaultStyle = {
      padding: '1.5rem 3rem',
      fontSize: '1.25rem',
      fontWeight: 'bold',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.2s ease-in-out',
      cursor: 'pointer',
    };

    const handleMouseOver = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.transform = 'scale(1.05)';
      props.onMouseOver?.(e);
    };

    const handleMouseOut = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.transform = 'scale(1)';
      props.onMouseOut?.(e);
    };

    return (
      <Button
        ref={ref}
        variant="default"
        size="lg"
        style={{ ...defaultStyle, ...props.style }}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

CustomButton.displayName = 'CustomButton';