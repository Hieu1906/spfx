import { Modal } from "antd";
import * as React from "react";
import { BaseComponent } from "../../common/components/BaseComponent";
import { ICustomPanelProps, ICustomPanelState } from "../interface";
import { FormUpload, FormUploadComp } from "./FormUpload";

export default class ModalUploadFile extends BaseComponent<
  ICustomPanelProps,
  ICustomPanelState
> {
  protected FormUploadRef: React.RefObject<FormUploadComp> = React.createRef();

  constructor(props: ICustomPanelProps) {
    super(props);
    this.state = {
      chinhanh: [],
      duAn: [],
      boPhan: [],
      nhaCungCap: [],
      nhomChungTu: [],
      loaiChungTuKeToan: [],
      loaiChungTu: [],
      maCK: [],
      tKNH: [],
    };
    this.onMount(async () => {});
  }

  public render(): React.ReactElement<ICustomPanelProps> {
    let { isOpen } = this.props;

    return (
      <Modal
        destroyOnClose={true}
        title={
          this.props.formValues
            ? "Chỉnh sửa chứng từ lưu tạm"
            : "Thêm mới chứng từ lưu tạm"
        }
        width={900}
        onCancel={async () => {
          await this.props.onClose();
        }}
        visible={isOpen}
        footer={null}
      >
        <FormUpload
          formValues={this.props.formValues ? this.props.formValues : undefined}
          onclose={async () => {
            await this.props.onClose();
          }}
          search={async (formvalues) => {}}
          context={this.props.context}
          wrappedComponentRef={this.FormUploadRef}
        />
      </Modal>
    );
  }
}
