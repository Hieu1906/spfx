// tslint:disable: no-any
import { Component } from 'react';

export class BaseComponent<P = {}, S = {}> extends Component<P, S> {
  mounted = false;
  onUnmounts: ((eventArgs?: any) => any)[] = [];
  onMounts: ((eventArgs?: any) => any)[] = [];

  componentDidMount() {
    this.mounted = true;
    this.onMounts.forEach((onMount) => onMount());
  }

  componentWillUnmount() {
    this.mounted = false;
    this.onUnmounts.forEach((onUnmount) => onUnmount());
  }

  onMount(callback: (eventArgs?: any) => any) {
    this.onMounts.push(callback);
  }

  onUnmount(callback: (eventArgs?: any) => any) {
    this.onUnmounts.push(callback);
  }

  setState<K extends keyof S>(
    state: ((prevState: Readonly<S>, props: Readonly<P>) => Pick<S, K> | S | null) | (Pick<S, K> | S | null),
  ): Promise<void> {
    return new Promise((resolve: () => void) => {
      if (this.mounted) {
        super.setState(state as any, () => {
          resolve();
        });
      }
    });
  }

  safeUpdate() {
    return new Promise<void>((resolve) => {
      if (this.mounted) {
        this.forceUpdate(() => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}
