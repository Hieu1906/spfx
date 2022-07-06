import { Modal } from "antd";
import * as React from "react";

export interface ICustomPanelState {
  saving: boolean;
}

export interface ICustomPanelProps {
  onClose: () => void;
  isOpen: boolean;
  currentTitle: string;
  itemId: number;
  listId: string;
}

export default class ModalUploadFile extends React.Component<
  ICustomPanelProps,
  ICustomPanelState
> {
  private editedTitle: string = null;

  constructor(props: ICustomPanelProps) {
    super(props);
    this.state = {
      saving: false,
    };
  }

  public render(): React.ReactElement<ICustomPanelProps> {
    let { isOpen, currentTitle } = this.props;
    return (
      <Modal
        destroyOnClose={true}
        onCancel={() => {
          this.props.onClose();
        }}
        visible={isOpen}
      >
        <div>Hello world</div>
      </Modal>
    );
  }
}
