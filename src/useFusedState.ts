import React from 'react';

interface Option<T> {
  /** current value in `props` */
  prop?: T;

  /** default value in `props` */
  defaultProp?: T;

  /** initial state if there is no default value from `props` */
  initialState?: T;

  /** change callback which is only triggered by inner state (prop change won't trigger it) */
  onInnerStateChange?: (newState: T) => void;

  /** custom comparison function other than `===` */
  compare?: (state0: T | null, state1: T) => boolean;
}

export default function useFusedState<T>({
  prop,
  defaultProp,
  initialState,
  onInnerStateChange,
  compare = defaultCompare,
}: Option<T>): [T | null, (newStateOrCallback: T | ((prevState: T | null) => T)) => void] {
  const update = useUpdate();
  const fusedStateRef = React.useRef<T | null>(defaultProp ?? initialState ?? null);
  fusedStateRef.current = prop === undefined ? fusedStateRef.current : prop;

  React.useEffect(() => {
    if (typeof prop !== 'undefined' && !compare(fusedStateRef.current, prop)) {
      fusedStateRef.current = prop;
    }
  }, [prop]);

  const setInnerState = (
    newStateOrCallback: T | ((prevState: T | null) => T),
    /**
     * indicate if the first parameter is a callback function
     */
    isCallback = true,
  ) => {
    const newState: T = isSetStateCallback<T>(newStateOrCallback, isCallback) ?
      newStateOrCallback(fusedStateRef.current) :
      newStateOrCallback;
    if (!compare(fusedStateRef.current, newState)) {
      fusedStateRef.current = newState
      onInnerStateChange?.(newState);
      update();
    }
  }

  return [fusedStateRef.current, setInnerState];
}

function isSetStateCallback<T>(
  value: any,
  isCallback: boolean,
): value is ((prevState: T | null) => T) {
  return typeof value === 'function' && isCallback;
}

function defaultCompare<T>(prevState: T | null, newState: T) {
  return prevState === newState;
}

/**
 * @return a callback that can force rerender
 */
function useUpdate() {
  const [, setState] = React.useState({});
  const update = React.useCallback(() => setState({}), []);
  return update;
}
