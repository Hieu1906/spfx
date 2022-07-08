import { ListViewCommandSetContext } from "@microsoft/sp-listview-extensibility";
import { IFolder } from "@pnp/spfx-controls-react/lib/FolderExplorer";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/files";
import "@pnp/sp/lists";
import "@pnp/sp/folders";
import {
  PeoplePicker,
  PrincipalType,
} from "@pnp/spfx-controls-react/lib/PeoplePicker";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Icon,
  Input,
  message,
  Row,
  Select,
  Spin,
  Upload,
} from "antd";
import { FormComponentProps } from "antd/lib/form/Form";
import * as moment from "moment";
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
import { chiNhanhService } from "../../common/services/chiNhanhService";
import { duAnService } from "../../common/services/duAnService";
import { loaiCTKTService } from "../../common/services/loaiChungTuKeToanService";
import { loaiCTService } from "../../common/services/loaiChungTuService";
import { maCKService } from "../../common/services/maChungKhoanService";
import { nhaCungCapService } from "../../common/services/nhaCungCapService";
import { nhomCTService } from "../../common/services/nhomChungTuService";
import { tKNHService } from "../../common/services/taiKhoanNganHangService";
import styles from "./FormUpload.module.scss";
import { FolderPicker } from "@pnp/spfx-controls-react";
import { cloneDeep } from "lodash";
import { IFileAddResult } from "@pnp/sp/files";

interface FormUploadProps extends FormComponentProps {
  context: ListViewCommandSetContext;
  search: (value: any) => Promise<void>;
  onclose: () => Promise<void>;
  raiseOnChange: () => void;
}
interface FormUploadState {
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
  selectedFolder: IFolder;
}
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 20 },
  },
};

const years: number[] = [];
for (let i = 2020; i <= 2030; i++) {
  years.push(i);
}
const fieldCanReset = [
  "ChiNhanhId",
  "DuAnId",
  "LoaiChungTuId",
  "LoaiChungTuKeToanId",
  "MaChungKhoanId",
  "NgayChungTuFrom",
  "NgayChungTuKTFrom",
  "NgayChungTuKTTo",
  "NgayChungTuTo",
  "NhaCungCapId",
  "NhomChungTuId",
  "TaiKhoanNganHangId",
];

export class FormUploadComp extends BaseComponent<
  FormUploadProps,
  FormUploadState
> {
  protected peoplePickerRef: React.RefObject<PeoplePicker> = React.createRef();
  protected folderPickerRef: React.RefObject<FolderPicker> = React.createRef();

  constructor(props: FormUploadProps) {
    super(props);
    this.state = {
      chinhanh: [],
      duAn: [],
      yearSelected: moment().year(),
      boPhan: [],
      nhaCungCap: [],
      nhomChungTu: [],
      loaiChungTuKeToan: [],
      loaiChungTu: [],
      maCK: [],
      tKNH: [],
      loading: false,
      selectedFolder: {
        Name: "Chứng từ lưu tạm",
        ServerRelativeUrl: `Chng t lu tm`,
      },
    };
    this.onMount(async () => {
      this.setState({
        loading: true,
      });
      await this.loadMetaData();

      this.setState({
        loading: false,
      });
    });
  }

  async saveFile() {
    this.props.form.validateFields(async (err, formvalues) => {
      console.log(formvalues);
      if (!err) {
        try {
          this.setState({
            loading: true,
          });
          if (this.state.BoPhanThucHienId) {
            formvalues.BoPhanThucHienId = this.state.BoPhanThucHienId;
          }
          let serverRelativeUrl = this.state.selectedFolder
            ? this.state.selectedFolder.ServerRelativeUrl
            : "Chng t lu tm";
          let result: IFileAddResult[] = await Promise.all(
            formvalues.FileUpload?.fileList.map((file) => {
              return sp.web
                .getFolderByServerRelativePath(serverRelativeUrl)
                .files.add(file.name, file.originFileObj, false);
            })
          );

          await Promise.all(
            result.map(async (item) => {
              await this.addMedadataToFile(
                item?.data.ServerRelativeUrl,
                formvalues,
                item.data.Name
              );
            })
          );

          message.success("Thêm mới chúng từ thành công", 3);
          this.props.raiseOnChange();
          await this.props.onclose();
          window.location.reload();
        } catch (e) {
          message.error("Đã có lỗi xảy ra trong quá trình tải tài liệu", 5);
          this.setState({
            loading: false,
          });
        } finally {
          this.setState({
            loading: false,
          });
        }
      }
    });
  }

  getExtension(path: string) {
    var basename = path.split(/[\\/]/).pop(), // extract file name from full path ...
      // (supports `\\` and `/` separators)
      pos = basename.lastIndexOf("."); // get last position of `.`

    if (basename === "" || pos < 1)
      // if file name is empty or ...
      return ""; //  `.` not found (-1) or comes first (0)

    return basename.slice(pos + 1); // extract extension ignoring `.`
  }

  async addMedadataToFile(
    ServerRelativeUrl: string,
    formvalues: any,
    nameFile: string
  ) {
    let item = await sp.web
      .getFileByServerRelativePath(ServerRelativeUrl)
      .getItem<{ Id: number; Title: string }>("Id", "Title");

    // see if we got something
    if (item?.Id) {
      try {
        let itemSave = cloneDeep(formvalues);
        delete itemSave.FileUpload;
        delete itemSave.Path;
        itemSave.Title = nameFile;
        itemSave.extension = this.getExtension(nameFile);

        await sp.web.lists
          .getByTitle("Chứng từ lưu tạm")
          .items.getById(item.Id)
          .update(itemSave);
      } catch (error) {
        message.error(
          "Đã có lỗi xảy ra trong quá trình thêm thuộc tính cho tài liệu",
          5
        );
      }
    }
  }

  async loadMetaData() {
    await Promise.all([
      this.getChiNhanh(),
      this.getDuAn(),
      this.getNhaCungCap(),
      this.getNhomChungTu(),
      this.getLoaiChungTuKeToan(),
      this.getLoaiChungTu(),
      this.getMaCK(),
      this.getTKNH(),
    ]);
  }

  async getChiNhanh() {
    let chinhanh = await chiNhanhService.getAll();
    this.setState({
      chinhanh,
    });
  }

  async getDuAn() {
    let duAn = await duAnService.getAll();

    this.setState({
      duAn,
    });
  }

  async getNhaCungCap() {
    let nhaCungCap = await nhaCungCapService.getAll();

    this.setState({
      nhaCungCap,
    });
  }

  async getNhomChungTu() {
    let nhomChungTu = await nhomCTService.getAll();
    this.setState({
      nhomChungTu,
    });
  }

  async getLoaiChungTuKeToan() {
    let loaiChungTuKeToan = await loaiCTKTService.getAll();
    this.setState({
      loaiChungTuKeToan,
    });
  }

  async getLoaiChungTu() {
    let loaiChungTu = await loaiCTService.getAll();
    this.setState({
      loaiChungTu,
    });
  }

  async getMaCK() {
    let maCK = await maCKService.getAll();
    this.setState({
      maCK,
    });
  }

  async getTKNH() {
    let tKNH = await tKNHService.getAll();
    this.setState({
      tKNH,
    });
  }

  reset() {
    this.setState({
      BoPhanThucHienId: undefined,
    });
    this.peoplePickerRef!.current!.setState({
      selectedPersons: [],
    });
    this.props.form.resetFields();
    this.props.form.setFieldsValue({ TypeDoc: "LT" });
    this.props.form.setFieldsValue({ Year: moment().year() });
    this.saveFile();
  }

  public render(): React.ReactElement<FormUploadProps> {
    const { getFieldDecorator } = this.props.form;

    return (
      <Spin spinning={this.state.loading}>
        <div className={styles.searchDocuments__searchForm}>
          <Form
            labelAlign={"left"}
            {...formItemLayout}
            className={styles.searchDocuments__searchForm__form}
          >
            <div
              className={
                styles.searchDocuments__searchForm__form__wrapperByGroup
              }
            >
              <Row>
                <Col span={12}>
                  <Form.Item
                    wrapperCol={{ span: 16 }}
                    labelCol={{ span: 8 }}
                    label="Tài liệu"
                  >
                    {getFieldDecorator("FileUpload", {
                      rules: [
                        {
                          required: true,
                          message: "Trường bắt buộc",
                        },
                      ],
                    })(
                      <Upload multiple={true} style={{ width: "100%" }}>
                        <Button>
                          <Icon type="upload" /> Tải chứng từ lưu tạm
                        </Button>
                      </Upload>
                    )}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    wrapperCol={{ span: 16 }}
                    labelCol={{ span: 8 }}
                    label="Đường dẫn"
                  >
                    {getFieldDecorator(
                      "Path",
                      {}
                    )(
                      <FolderPicker
                        key={"id"}
                        context={this.props.context}
                        label=""
                        required={false}
                        rootFolder={{
                          Name: "Chứng từ lưu tạm",
                          ServerRelativeUrl: `Chng t lu tm`,
                        }}
                        defaultFolder={this.state.selectedFolder}
                        onSelect={(folder) => {
                          this.setState({
                            selectedFolder: folder,
                          });
                        }}
                        ref={this.folderPickerRef}
                        canCreateFolders={true}
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>

              <Row>
                <Col span={12}>
                  <Form.Item
                    wrapperCol={{ span: 16 }}
                    labelCol={{ span: 8 }}
                    label="Chi nhánh"
                  >
                    {getFieldDecorator(
                      "ChiNhanhId",
                      {}
                    )(
                      <Select
                        showSearch
                        allowClear
                        disabled={
                          this.state.chinhanh?.length > 0 ? false : true
                        }
                      >
                        {this.state.chinhanh?.map((item) => (
                          <Select.Option key={item.Id} value={item.Id}>
                            {item.TenChiNhanh}
                          </Select.Option>
                        ))}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    wrapperCol={{ span: 16 }}
                    labelCol={{ span: 8 }}
                    label="Dự án"
                  >
                    {getFieldDecorator(
                      "DuAnId",
                      {}
                    )(
                      <Select
                        showSearch
                        allowClear
                        disabled={this.state.duAn?.length > 0 ? false : true}
                      >
                        {this.state.duAn?.map((item) => (
                          <Select.Option
                            value={item.Id}
                            key={item.Id.toString()}
                          >
                            {item.TenDuAn}
                          </Select.Option>
                        ))}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    wrapperCol={{ span: 16 }}
                    labelCol={{ span: 8 }}
                    label="Bộ phận"
                  >
                    {getFieldDecorator(
                      "BoPhanThucHienId",
                      {}
                    )(
                      <div style={{ marginTop: -23 }}>
                        {" "}
                        <PeoplePicker
                          ref={this.peoplePickerRef}
                          key={"id"}
                          context={this.props.context}
                          personSelectionLimit={1}
                          showtooltip={false}
                          disabled={false}
                          onChange={(items: any[]) => {
                            if (items?.length > 0) {
                              console.log(items);
                              this.setState({
                                BoPhanThucHienId: parseInt(items[0].id),
                              });
                            } else {
                            }
                          }}
                          showHiddenInUI={true}
                          principalTypes={[PrincipalType.SharePointGroup]}
                          resolveDelay={500}
                        />
                      </div>
                    )}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    wrapperCol={{ span: 16 }}
                    labelCol={{ span: 8 }}
                    label="Nhà cung cấp"
                  >
                    {getFieldDecorator(
                      "NhaCungCapId",
                      {}
                    )(
                      <Select
                        showSearch
                        allowClear
                        disabled={
                          this.state.nhaCungCap?.length > 0 ? false : true
                        }
                      >
                        {this.state.nhaCungCap?.map((item) => (
                          <Select.Option
                            value={item.Id}
                            key={item.Id.toString()}
                          >
                            {item.TenNCC}
                          </Select.Option>
                        ))}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </div>
            <div
              className={
                styles.searchDocuments__searchForm__form__wrapperByGroup
              }
            >
              <Row>
                <Col span={24}>
                  {" "}
                  <Form.Item label="Nhóm chứng từ">
                    {getFieldDecorator(
                      "NhomChungTuId",
                      {}
                    )(
                      <Select
                        showSearch
                        allowClear
                        disabled={
                          this.state.nhomChungTu?.length > 0 ? false : true
                        }
                      >
                        {this.state.nhomChungTu?.map((item) => (
                          <Select.Option
                            value={item.Id}
                            key={item.Id.toString()}
                          >
                            {item.NhomChungTu}
                          </Select.Option>
                        ))}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
                <Col span={24}>
                  {" "}
                  <Form.Item label="Loại chứng từ:">
                    {getFieldDecorator(
                      "LoaiChungTuId",
                      {}
                    )(
                      <Select
                        showSearch
                        allowClear
                        disabled={
                          this.state.loaiChungTu?.length > 0 ? false : true
                        }
                      >
                        {this.state.loaiChungTu?.map((item) => (
                          <Select.Option
                            value={item.Id}
                            key={item.Id.toString()}
                          >
                            {item.TenLoaiChungTu}
                          </Select.Option>
                        ))}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    wrapperCol={{ span: 16 }}
                    labelCol={{ span: 8 }}
                    label="Số chứng từ:"
                  >
                    {getFieldDecorator("SoChungTu", {})(<Input />)}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  {" "}
                  <Form.Item
                    wrapperCol={{ span: 16 }}
                    labelCol={{ span: 8 }}
                    label={"Ngày chứng từ:"}
                    style={{ paddingBottom: 0 }}
                  >
                    {getFieldDecorator("NgayChungTu", {
                      rules: [],
                    })(
                      <DatePicker
                        format="DD/MM/YYYY"
                        placeholder={"Từ ngày:"}
                        style={{ width: `100%` }}
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </div>
            <div
              className={
                styles.searchDocuments__searchForm__form__wrapperByGroup
              }
            >
              <Row>
                <Col span={24}>
                  {" "}
                  <Form.Item label="Loại chứng từ KT:">
                    {getFieldDecorator(
                      "LoaiChungTuKeToanId",
                      {}
                    )(
                      <Select
                        showSearch
                        allowClear
                        disabled={
                          this.state.loaiChungTuKeToan?.length > 0
                            ? false
                            : true
                        }
                      >
                        {this.state.loaiChungTuKeToan?.map((item) => (
                          <Select.Option
                            value={item.Id}
                            key={item.Id.toString()}
                          >
                            {item.TenLoaiChungTuKeToan}
                          </Select.Option>
                        ))}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  {" "}
                  <Form.Item
                    wrapperCol={{ span: 16 }}
                    labelCol={{ span: 8 }}
                    label={"Ngày chứng từ KT:"}
                    style={{ paddingBottom: 0 }}
                  >
                    {getFieldDecorator("NgayChungTuKeToan", {
                      rules: [],
                    })(
                      <DatePicker
                        format="DD/MM/YYYY"
                        placeholder={"Từ ngày:"}
                        style={{ width: `100%` }}
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    wrapperCol={{ span: 16 }}
                    labelCol={{ span: 8 }}
                    label="Số chứng từ KT:"
                  >
                    {getFieldDecorator("SoChungTuKeToan", {})(<Input />)}
                  </Form.Item>
                </Col>
              </Row>
            </div>
            <div
              className={
                styles.searchDocuments__searchForm__form__wrapperByGroup
              }
            >
              <Form.Item label="Mã chứng khoán:">
                {getFieldDecorator(
                  "MaChungKhoanId",
                  {}
                )(
                  <Select
                    showSearch
                    allowClear
                    disabled={this.state.maCK?.length > 0 ? false : true}
                  >
                    {this.state.maCK?.map((item) => (
                      <Select.Option value={item.Id} key={item.Id.toString()}>
                        {item.MaChungKhoan}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
              <Form.Item label="Mã phiếu yêu cầu:">
                {getFieldDecorator("RequestCode", {})(<Input />)}
              </Form.Item>
              <Form.Item label="TK ngân hàng:">
                {getFieldDecorator(
                  "TaiKhoanNganHangId",
                  {}
                )(
                  <Select
                    showSearch
                    allowClear
                    disabled={this.state.tKNH?.length > 0 ? false : true}
                  >
                    {this.state.tKNH?.map((item) => (
                      <Select.Option value={item.Id} key={item.Id.toString()}>
                        {item.SoTaiKhoan}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Row gutter={48} key="footer">
                <Col span={24} style={{ textAlign: "right" }}>
                  <Button
                    type={"primary"}
                    onClick={async () => {
                      await this.saveFile();
                    }}
                    style={{ marginRight: 16 }}
                  >
                    Thêm mới
                  </Button>
                  <Button
                    onClick={() => {
                      this.props.onclose();
                    }}
                    style={{ marginRight: 16 }}
                  >
                    Đóng
                  </Button>
                </Col>
              </Row>
            </div>
          </Form>
        </div>
      </Spin>
    );
  }
}
export const FormUpload = Form.create<FormUploadProps>()(FormUploadComp);
