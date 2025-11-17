import { Button as MuiButton, ButtonProps, CircularProgress } from '@mui/material';
import { FC } from 'react';

interface CustomButtonProps extends ButtonProps {
  loading?: boolean;
}

const Button: FC<CustomButtonProps> = ({ loading, children, disabled, ...props }) => {
  return (
    <MuiButton
      {...props}
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : props.startIcon}
    >
      {children}
    </MuiButton>
  );
};

export default Button;
