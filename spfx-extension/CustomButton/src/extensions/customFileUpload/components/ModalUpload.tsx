import { ListViewCommandSetContext } from "@microsoft/sp-listview-extensibility";
import { Modal } from "antd";
import * as React from "react";
import { BaseComponent } from "../../common/components/BaseComponent";
import { BoPhan } from "../../common/models/BoPhan";
import { ChiNhanh } from "../../common/models/ChiNhanh";
import { DuAn } from "../../common/models/DuAn";
import { LoaiChungTu } from "../../common/models/LoaiChungTu";
import { LoaiChungTuKeToan } from "../../common/models/LoaiChungTuKeToan";
import { MaChungKhoan } from "../../common/models/MaChungKhoan";
import { NhaCungCap } from "../../common/models/NhaCungCap";
import { NhomChungTu } from "../../common/models/NhomChungTu";
import { TaiKhoanNganHang } from "../../common/models/TaiKhoanNganHang";
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
          raiseOnChange={() => {
            this.props.raiseOnChange();
          }}
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
