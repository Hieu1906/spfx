import { sp } from "@pnp/sp";
import "@pnp/sp/files";
import { IFileAddResult } from "@pnp/sp/files";
import "@pnp/sp/folders";
import "@pnp/sp/lists";
import "@pnp/sp/site-groups";
import "@pnp/sp/webs";
import { FolderPicker } from "@pnp/spfx-controls-react";
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
  Modal,
  Row,
  Select,
  Spin,
  Upload,
} from "antd";
import { cloneDeep, filter } from "lodash";
import * as moment from "moment";
import * as React from "react";
import { BaseComponent } from "../../common/components/BaseComponent";
import { chiNhanhService } from "../../common/services/chiNhanhService";
import { duAnService } from "../../common/services/duAnService";
import { loaiCTKTService } from "../../common/services/loaiChungTuKeToanService";
import { loaiCTService } from "../../common/services/loaiChungTuService";
import { maCKService } from "../../common/services/maChungKhoanService";
import { nhaCungCapService } from "../../common/services/nhaCungCapService";
import { nhomCTService } from "../../common/services/nhomChungTuService";
import { tKNHService } from "../../common/services/taiKhoanNganHangService";
import { FileCheck, FormUploadProps, FormUploadState } from "../interface";
import styles from "./FormUpload.module.scss";

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
    };
    this.onMount(async () => {
      this.setState({
        loading: true,
      });
      await this.loadMetaData();
      let { formValues } = this.props;
      if (formValues) {
        this.props.form.setFieldsValue(formValues);
        if (formValues.BoPhanThucHien?.length > 0) {
          let group = await sp.web.siteGroups.getById(
            parseInt(formValues.BoPhanThucHien[0]?.id)
          )();
          this.peoplePickerRef.current.setState({
            selectedPersons: [
              {
                id: group.Id,
                loginName: group.LoginName,
                secondaryText: group.Title,
                text: group.Title,
              } as any,
            ],
          });
        }
      }
      this.setState({
        loading: false,
      });
    });
  }

  renderFile(filesExist: FileCheck[]) {
    return filesExist.map((item) => (
      <div className={styles.searchDocuments__fileRender}>
        <Icon type="file-add" style={{ marginRight: 5 }} /> {item.fileName}
      </div>
    ));
  }

  showWarning(
    filesExist: FileCheck[],
    formvalues: any,
    serverRelativeUrl: string
  ) {
    Modal.confirm({
      title:
        "Một số tài liệu tải lên đã tồn tại hoặc bị trùng tên,bạn có muốn thay thế chúng ?",
      content: this.renderFile(filesExist),
      onOk: async () => {
        await this.saveFile(formvalues, serverRelativeUrl);
      },
      cancelText: "Hủy bỏ",
      okText: "Đồng ý",
      onCancel() {
        console.log("Cancel");
      },
    });
  }

  async updateFile() {
    this.props.form.validateFields(async (err, formvalues) => {
      let { formValues } = this.props;
      if (!err) {
        try {
          this.setState({
            loading: true,
          });
          if (this.state.BoPhanThucHienId) {
            formvalues.BoPhanThucHienId = this.state.BoPhanThucHienId;
          }
          await this.updateMedadataToFile(
            formValues.FileRef,
            formvalues,
            formValues.FileLeafRef
          );
          window.location.reload();
          await this.props.onclose();
        } catch (error) {
          message.error(
            "Đã có lỗi xảy ra trong quá trình cập nhật tài liệu",
            5
          );
        } finally {
          this.setState({
            loading: false,
          });
        }
      }
    });
  }

  async checkVadlidFile() {
    this.props.form.validateFields(async (err, formvalues) => {
      console.log(formvalues);
      if (!err) {
        try {
          this.setState({
            loading: true,
          });

          let fileCheck: FileCheck[] = await Promise.all(
            formvalues.FileUpload?.fileList.map(async (file: File) => {
              const exists = await sp.web
                .getFolderByServerRelativePath("ChungTuLuuTam")
                .files.getByName(file.name)
                .exists();
              return {
                exists: exists,
                fileName: file.name,
              };
            })
          );
          this.setState({
            loading: false,
          });
          let fileEXists: FileCheck[] = filter(fileCheck, { exists: true });

          if (fileEXists?.length > 0) {
            this.showWarning(fileEXists, formvalues, "ChungTuLuuTam");
          } else {
            await this.saveFile(formvalues, "ChungTuLuuTam");
          }
        } catch (error) {
          message.error(
            "Đã có lỗi xảy ra trong quá trình kiểm tra trước khi tải tài liệu",
            5
          );
          this.setState({
            loading: false,
          });
        }
      }
    });
  }

  async saveFile(formvalues, serverRelativeUrl: string) {
    try {
      this.setState({
        loading: true,
      });

      if (this.state.BoPhanThucHienId) {
        formvalues.BoPhanThucHienId = this.state.BoPhanThucHienId;
      }

      let result: IFileAddResult[] = await Promise.all(
        formvalues.FileUpload?.fileList.map((file) => {
          return sp.web
            .getFolderByServerRelativePath(serverRelativeUrl)
            .files.add(file.name, file.originFileObj, true);
        })
      );

      await Promise.all(
        result.map(async (item) => {
          await this.updateMedadataToFile(
            item?.data.ServerRelativeUrl,
            formvalues,
            item.data.Name
          );
        })
      );
      message.success("Thêm mới chúng từ thành công", 3);
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

  getExtension(path: string) {
    var basename = path.split(/[\\/]/).pop(), // extract file name from full path ...
      // (supports `\\` and `/` separators)
      pos = basename.lastIndexOf("."); // get last position of `.`

    if (basename === "" || pos < 1)
      // if file name is empty or ...
      return ""; //  `.` not found (-1) or comes first (0)

    return basename.slice(pos + 1); // extract extension ignoring `.`
  }

  async updateMedadataToFile(
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
          .getByTitle("ChungTuLuuTam")
          .items.getById(item.Id)
          .update(itemSave);
        window.location.reload();
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
    let chinhanh = await chiNhanhService.getAll({
      filter: "TrangThai ne 1",
    });
    this.setState({
      chinhanh,
    });
  }

  async getDuAn() {
    let duAn = await duAnService.getAll({
      filter: "TrangThai ne 1",
    });

    this.setState({
      duAn,
    });
  }

  async getNhaCungCap() {
    let nhaCungCap = await nhaCungCapService.getAll({
      filter: "TrangThai ne 1",
    });

    this.setState({
      nhaCungCap,
    });
  }

  async getNhomChungTu() {
    let nhomChungTu = await nhomCTService.getAll({
      filter: "TrangThai ne 1",
    });
    this.setState({
      nhomChungTu,
    });
  }

  async getLoaiChungTuKeToan() {
    let loaiChungTuKeToan = await loaiCTKTService.getAll({
      filter: "TrangThai ne 1",
    });
    this.setState({
      loaiChungTuKeToan,
    });
  }

  async getLoaiChungTu() {
    let loaiChungTu = await loaiCTService.getAll({
      filter: "TrangThai ne 1",
    });
    this.setState({
      loaiChungTu,
    });
  }

  async getMaCK() {
    let maCK = await maCKService.getAll({
      filter: "TrangThai ne 1",
    });
    this.setState({
      maCK,
    });
  }

  async getTKNH() {
    let tKNH = await tKNHService.getAll({
      filter: "TrangThai ne 1",
    });
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
  }

  getIcon(fileName: string) {
    let extensionFile = fileName ? this.getExtension(fileName) : undefined;

    let icon: string = "";

    if (extensionFile) {
      if (["csv", "xlsx"].includes(extensionFile)) {
        icon = require("./img/iconExcel.png");
      }
      if (["doc", "docx"].includes(extensionFile)) {
        icon = require("./img/iconWord.png");
      }
      if (["pdf"].includes(extensionFile)) {
        icon = require("./img/iconPdf.png");
      }
    }

    return icon;
  }

  public render(): React.ReactElement<FormUploadProps> {
    const { getFieldDecorator } = this.props.form;
    const { formValues } = this.props;

    return (
      <Spin spinning={this.state.loading}>
        <div className={styles.searchDocuments__searchForm}>
          {formValues && (
            <div
              className={styles.searchDocuments__fileonlyView}
              onClick={() => {
                window.open(
                  `${
                    this.props.context.pageContext.web.absoluteUrl
                  }/_layouts/15/wopiframe.aspx?sourcedoc=${
                    formValues.UniqueId
                  }&action=${"view"}`,
                  "_blank"
                );
              }}
            >
              {this.getIcon(formValues?.Title) ? (
                <img
                  className={styles.searchDocuments__fileonlyView__icon}
                  src={this.getIcon(formValues?.Title)}
                />
              ) : (
                <Icon
                  className={styles.searchDocuments__fileonlyView__icon}
                  type="file"
                />
              )}
              {formValues?.Title}
            </div>
          )}
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
              {!formValues && (
                <Row gutter={16}>
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
                          <Button style={{ width: "100%" }}>
                            <Icon type="upload" /> Tải chứng từ lưu tạm
                          </Button>
                        </Upload>
                      )}
                    </Form.Item>
                  </Col>
                  {/* <Col span={12}>
                    <Form.Item
                      wrapperCol={{ span: 16 }}
                      labelCol={{ span: 8 }}
                      label="Trạng thái chứng từ"
                    >
                      {getFieldDecorator(
                        "TrangThaiTrungTu",
                        {}
                      )(
                        <Select allowClear>
                          <Select.Option
                            key={1}
                            value={"Kế toán viên xác nhận"}
                          >
                            Kế toán viên xác nhận
                          </Select.Option>
                          <Select.Option
                            key={2}
                            value={"Kiểm soát viên xác nhận"}
                          >
                            Kiểm soát viên xác nhận
                          </Select.Option>
                        </Select>
                      )}
                    </Form.Item>
                  </Col> */}
                </Row>
              )}

              <Row gutter={16}>
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
                        <PeoplePicker
                          ref={this.peoplePickerRef}
                          key={"id"}
                          context={this.props.context}
                          personSelectionLimit={1}
                          showtooltip={false}
                          disabled={false}
                          onChange={(items: any[]) => {
                            if (items?.length > 0) {
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
              <Row gutter={16}>
                <Col span={24}>
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
                            {item.TenNhomChungTu}
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
              <Row gutter={16}>
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
                      if (formValues) {
                        await this.updateFile();
                      } else {
                        await this.checkVadlidFile();
                      }
                    }}
                    style={{ marginRight: 16 }}
                  >
                    {formValues ? "Cập nhật" : "Thêm mới"}
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
