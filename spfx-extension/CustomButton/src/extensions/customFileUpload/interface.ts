import { Guid } from "@microsoft/sp-core-library";
import { ListViewCommandSetContext } from "@microsoft/sp-listview-extensibility";
import { IFolder } from "@pnp/spfx-controls-react/lib/FolderExplorer";
import { FormComponentProps } from "antd/lib/form/Form";
import * as moment from "moment";
import { BoPhan } from "../common/models/BoPhan";
import { ChiNhanh } from "../common/models/ChiNhanh";
import { DuAn } from "../common/models/DuAn";
import { LoaiChungTu } from "../common/models/LoaiChungTu";
import { LoaiChungTuKeToan } from "../common/models/LoaiChungTuKeToan";
import { MaChungKhoan } from "../common/models/MaChungKhoan";
import { NhaCungCap } from "../common/models/NhaCungCap";
import { NhomChungTu } from "../common/models/NhomChungTu";
import { TaiKhoanNganHang } from "../common/models/TaiKhoanNganHang";

export interface ICustomPanelState {
  chinhanh: ChiNhanh[];
  duAn: DuAn[];
  boPhan: BoPhan[];
  nhaCungCap: NhaCungCap[];
  nhomChungTu: NhomChungTu[];
  loaiChungTuKeToan: LoaiChungTuKeToan[];
  loaiChungTu: LoaiChungTu[];
  maCK: MaChungKhoan[];
  tKNH: TaiKhoanNganHang[];
}

export interface ICustomPanelProps {
  onClose: () => Promise<void>;
  raiseOnChange: () => void;
  isOpen: boolean;
  formValues?: FormValue;
  listId: string;
  context: ListViewCommandSetContext;
}

export interface FormUploadProps extends FormComponentProps {
  context: ListViewCommandSetContext;
  search: (value: any) => Promise<void>;
  onclose: () => Promise<void>;
  formValues?: FormValue;
}

export interface FileCheck {
  exists: boolean;
  fileName: string;
}
export interface FormUploadState {
  yearSelected: number;
  chinhanh: ChiNhanh[];
  duAn: DuAn[];
  boPhan: BoPhan[];
  nhaCungCap: NhaCungCap[];
  nhomChungTu: NhomChungTu[];
  loaiChungTuKeToan: LoaiChungTuKeToan[];
  loaiChungTu: LoaiChungTu[];
  maCK: MaChungKhoan[];
  tKNH: TaiKhoanNganHang[];
  loading: boolean;
  BoPhanThucHienId?: number;
}
/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface ICustomFileUploadCommandSetProperties {
  // This is an example; replace with your own properties
  sampleTextOne: string;
  sampleTextTwo: string;
}

export interface FormValue {
  BoPhanThucHien: any;
  ChiNhanhId: number;
  DuAnId: number;
  FileLeafRef: string;
  ID: string;
  LoaiChungTuId: number;
  LoaiChungTuKeToanId: number;
  MaChungKhoanId: number;
  NgayChungTu: moment.Moment;
  NgayChungTuKeToan: moment.Moment;
  NhaCungCapId: number;
  NhomChungTuId: number;
  RequestCode: string;
  SoChungTu: string;
  SoChungTuKeToan: string;
  TaiKhoanNganHangId: number;
  Title: string;
  extension: string;
  FileRef:string;
  UniqueId:string;
}
export interface SPField {
  /**
   * The GUID identifier for this field.
   */
  readonly id: Guid;
  /**
   * The internal name of the field. This name is usually used to find the field.
   */
  readonly internalName: string;
  /**
   * The type of the field represented as a string
   */
  readonly fieldType: string;
  /**
   * Whether the field is required for each list item in the list
   */
  readonly isRequired: boolean;
  /**
   * The display name of the field. This name is shown as column name in UI.
   */
  readonly displayName: string;
  /**
   * The unique identifier of the client-side component associated with the field.
   */
  readonly clientSideComponentId: Guid | undefined;
  /**
   * This property is only used when a `ClientSideComponentId` is specified.  It is optional.
   *
   * @remarks
   * If non-empty, the string must contain a JSON object with custom initialization properties
   * whose format and meaning are defined by the client-side component.
   */
  readonly clientSideComponentProperties: string;
  /* Excluded from this release type: __constructor */
}
