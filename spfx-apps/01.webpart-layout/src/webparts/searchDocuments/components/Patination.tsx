import { Col, Modal, Row, Spin } from "antd";
import * as moment from "moment";
import * as React from "react";
import { BaseComponent } from "../../common/components/BaseComponent";
import styles from "./SearchDocuments.module.scss";
export interface IPatinationStates {
  spining: boolean;
}
export interface IPatinationProps {
  onPrev: () => Promise<void>;
  onNext: () => Promise<void>;
  canNext: boolean;
  canPrev: boolean;
}

export default class Patiantion extends BaseComponent<
  IPatinationProps,
  IPatinationStates
> {
  constructor(props: IPatinationProps) {
    super(props);
    this.state = {
      spining: false,
    };
  }

  renderPrev() {
    return (
      <svg
        className={styles.searchDocuments__results__patination__prev}
        width="10"
        height="20"
        viewBox="0 0 5 10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4.53125 1.01172L4.92188 1.38281C5 1.48047 5 1.63672 4.92188 1.71484L1.38672 5.25L4.92188 8.80469C5 8.88281 5 9.03906 4.92188 9.13672L4.53125 9.50781C4.43359 9.60547 4.29688 9.60547 4.19922 9.50781L0.0976562 5.42578C0.0195312 5.32812 0.0195312 5.19141 0.0976562 5.09375L4.19922 1.01172C4.29688 0.914062 4.43359 0.914062 4.53125 1.01172Z"
          fill="#8C8C8C"
        />
      </svg>
    );
  }

  renderNext() {
    return (
      <svg
        onClick={async () => {
          await this.props.onNext();
        }}
        style={{ cursor: this.props.canNext ? "pointer" : "not-allowed" }}
        className={styles.searchDocuments__results__patination__next}
        width="10"
        height="20"
        viewBox="0 0 5 10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0.46875 1.01172L0.078125 1.38281C0 1.48047 0 1.63672 0.078125 1.71484L3.61328 5.25L0.078125 8.80469C0 8.88281 0 9.03906 0.078125 9.13672L0.46875 9.50781C0.566406 9.60547 0.703125 9.60547 0.800781 9.50781L4.90234 5.42578C4.98047 5.32812 4.98047 5.19141 4.90234 5.09375L0.800781 1.01172C0.703125 0.914062 0.566406 0.914062 0.46875 1.01172Z"
          fill="#262626"
        />
      </svg>
    );
  }

  public render(): React.ReactElement<IPatinationProps> {
    return (
      <div className={styles.searchDocuments__results__patination}>
        {this.renderPrev()}
        <Spin spinning={this.state.spining}>Trang</Spin>
        {this.renderNext()}
      </div>
    );
  }
}
