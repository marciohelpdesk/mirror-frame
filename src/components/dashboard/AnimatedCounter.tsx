import { useEffect, useRef } from 'react';
import { useSpring, animated, config } from '@react-spring/web';

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  className?: string;
}

export const AnimatedCounter = ({ value, suffix = '', className = '' }: AnimatedCounterProps) => {
  const prevValue = useRef(value);
  
  const { number } = useSpring({
    from: { number: prevValue.current },
    number: value,
    config: { ...config.gentle, duration: 600 },
    onChange: () => {
      prevValue.current = value;
    },
  });

  useEffect(() => {
    prevValue.current = value;
  }, [value]);

  return (
    <animated.span className={className}>
      {number.to((n) => `${Math.round(n)}${suffix}`)}
    </animated.span>
  );
};
