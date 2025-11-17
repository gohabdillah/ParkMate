import { Card as MuiCard, CardContent, CardProps } from '@mui/material';
import { FC, ReactNode } from 'react';

interface CustomCardProps extends CardProps {
  children: ReactNode;
}

const Card: FC<CustomCardProps> = ({ children, ...props }) => {
  return (
    <MuiCard {...props}>
      <CardContent>{children}</CardContent>
    </MuiCard>
  );
};

export default Card;
