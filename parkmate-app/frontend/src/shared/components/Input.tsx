import { TextField, TextFieldProps } from '@mui/material';
import { FC } from 'react';

const Input: FC<TextFieldProps> = (props) => {
  return (
    <TextField
      fullWidth
      variant="outlined"
      {...props}
    />
  );
};

export default Input;
