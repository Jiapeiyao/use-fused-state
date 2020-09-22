import React from 'react';
import useFusedState from '../useFusedState';

interface TimerProps {
  defaultValue?: number;
  value?: number;
  onChange?: (newValue: number) => void;
}

export default function Timer(props: TimerProps) {
  const { defaultValue, value, onChange } = props;
  const [time, onTimeChange] = useFusedState<number>({
    prop: value,
    defaultProp: defaultValue,
    onInnerStateChange: onChange,
    initialState: 0,
  });

  useClocktick(time ?? 0, onTimeChange);

  return (
    <div>time: {time}</div>
  );
}

function useClocktick(time: number, onTimeChange: (newTime: number) => void) {
  const timeRef = React.useRef<number>(time);
  timeRef.current = time;

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      onTimeChange(timeRef.current + 1);
    }, 100);

    return () => clearInterval(intervalId);
  }, []);
}
