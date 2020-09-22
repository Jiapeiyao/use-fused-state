import React from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta } from '@storybook/react/types-6-0';
import Timer from './Timer';

export default {
  title: 'Example/Timer',
  component: Timer,
} as Meta;

export function NoPropsTimer() {
  return <Timer />;
}

export function DefaultPropTimer() {
  return <Timer defaultValue={100} />;
}

export function NoPropAndGetStateFromTimer() {
  const [value, setValue] = React.useState<number | null>(null);
  return (
    <React.Fragment>
      <Timer onChange={setValue} />
      <div>value: {value === null ? 'null' : value}</div>
    </React.Fragment>
  );
}

export function HasPropTimer() {
  const [value, setValue] = React.useState(0);
  return (
    <React.Fragment>
      <button type="button" onClick={() => setValue(value + 1)}>+</button>
      <button type="button" onClick={() => setValue(value - 1)}>-</button>
      <Timer value={value} />
    </React.Fragment>
  );
}

export function SyncPropStateTimer() {
  const [value, setValue] = React.useState<number>(0);
  return (
    <React.Fragment>
      <button type="button" onClick={() => setValue(0)}>reset</button>
      <Timer value={value} onChange={setValue} />
      <div>value: {value === null ? 'null' : value}</div>
    </React.Fragment>
  );
}
