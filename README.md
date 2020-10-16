# useFusedState

`useFusedState` is a custom React Hook that helps handle changing logic of `prop` and `state` simply.

## Example
```javascript
import React from 'react';
import useFusedState from 'use-fused-state';

interface TimerProps {
  defaultValue?: number;
  value?: number;
  onChange?: (newValue: number) => void;
}

export default function Timer(props: TimerProps) {
  const { defaultValue, value, onChange } = props;
  const [time, onTimeChange] = useFusedState<number>(value, {
    defaultProp: defaultValue,
    onInnerStateChange: onChange,
    initialState: 0,
  });

  useClocktick(time ?? 0, onTimeChange);

  return (
    <div>(⏰ : {time})</div>
  );
}

function useClocktick(time: number, onTimeChange: (newTime: number) => void) {
  const timeRef = React.useRef<number>(time);
  timeRef.current = time;

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      onTimeChange(timeRef.current + 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);
}
```

## API
```javascript
useFusedState<T>(prop: T, option?: Option<T>)
```
| Argument | Description | Type | Default |
|-----|-----|-----|-----|
| prop | current value from `props` | `T` | |
| option? | optional setting | `Option<T>` | `{ compare: (a, b) => a === b }` |

### `Option<T>`
| Property | Description | Type | Default |
|-----|-----|-----|-----|
| defaultProp? | default value from `props` | `T` |  |
| initialState? | initial state if there is no default value from `props` | `T` |  |
| onInnerStateChange? | change callback which is only triggered by inner state (prop change won't trigger it) | `(newState: T) => void` |  |
| compare? | custom comparison function other than `===` | `(prevState: T | null, newState: T) => boolean`| `(a, b) => a === b` |

## Rules and Details
1. Priority: `prop` > `state`
2. `onInnerStateChange` won't be triggered by change of `prop`
3.  A custom comparison function is usually required if `T` is a non-primitive type. e.g. `[0, 1] === [0, 1]` is false.
4. The hook returns a tuple of state and a dispatch function, if you encounter closure problem, you can try using a callback as the argument of the dispatch function.
    ```javascript
    const [state, setState] = useFusedState<number>(value, {
      onInnerStateChange: onChange,
    });

    // set by callback
    setState((prevValue: number | null) => calculate(prevValue));
    ```
5. If the generic type is function and you want set the state directly, the second argument of the dispatch function should be `false`.
    ```javascript
    type FunctionType = () => void;

    const [fn, setFn] = useFusedState<FunctionType>(value, {
      onInnerStateChange: onChange,
    });

    // set directly
    setState(() => fn?.(), false);

    // set by callback
    setState((oldFn: FunctionType | null) => (() => oldFn?.()));
    ```

## Why use-fused-state? A basic but frequent problem: who should control the state and how to manage it properly?

### Senario 1: prop only
```javascript
// web app code
function App() {
  const [value, setValue] = React.useState(0); // <--- value state controlled by App

  return <Button value={value} onClick={() => setValue(value + 1)} />
}

// ui component library code
function Button({ value, onClick }) {
  return <button onClick={onClick}>{value}</button>;
}
```

### Senario 2: inner state only
```javascript
// web app code
function App() {
  return <Button />;
}

// ui component library code
function Button() {
  const [value, setValue] = React.useState(0); // <--- value state controlled by Button
  return <button onClick={() => setValue(value + 1)}>{value}</button>;
}
```

### Senario 3: both prop and inner state
Consider a TimePicker which is consisted of selectors to pick hour, minute, and second.

This TimePicker is empty by default and display only. Since we can select and display time, there have to be a time state inside the component. (Senario 2)
```jsx
const timePicker = <TimePicker />;
```


I want to get selected value from the TimePicker. (Senario 2)
```jsx
const timePicker = <TimePicker onValueChange={console.log} />;
```

NOW, I WANT TO GIVE A NEW TIME VALUE TO THE TIMEPICKER AND WANT IT TO RENDER MY NEW TIME AS I EXPECT. (Senario 3)
```jsx
const timePicker = <TimePicker value={'14:00:00'} onValueChange={console.log} />;
```

The TimePicker has been completely controlled by the `value` in `props`.
```jsx
const [value, setValue] = React.useState('13:01:02');
const timePicker = <TimePicker value={value} onValueChange={setValue} />;
```
