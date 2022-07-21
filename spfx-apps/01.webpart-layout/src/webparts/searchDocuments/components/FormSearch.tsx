import { WebPartContext } from "@microsoft/sp-webpart-base";
import {
  PeoplePicker,
  PrincipalType,
} from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { Button, DatePicker, Form, Input, message, Select, Spin } from "antd";
import { FormComponentProps } from "antd/lib/form/Form";
import * as moment from "moment";
import { IPersonaProps } from "office-ui-fabric-react";
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
import styles from "./SearchDocuments.module.scss";

interface FormSearchProps extends FormComponentProps {
  context: WebPartContext;
  search: (value: any) => Promise<void>;
}
interface FormSearchState {
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
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 7 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 17 },
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

export class FormSearchComp extends BaseComponent<
  FormSearchProps,
  FormSearchState
> {
  protected peoplePickerRef: React.RefObject<PeoplePicker> = React.createRef();

  constructor(props: FormSearchProps) {
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
      await this.loadMetaData(this.state.yearSelected);

      this.setState({
        loading: false,
      });
    });
  }

  getFormValue() {
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

          await this.props.search(formvalues);
        } catch (e) {
          message.error("Đã có lỗi xảy ra", 3);
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

  async loadMetaData(year: number, subsite?: string) {
    await Promise.all([
      this.getChiNhanh(year, subsite),
      this.getDuAn(year, subsite),
      this.getNhaCungCap(year, subsite),
      this.getNhomChungTu(year, subsite),
      this.getLoaiChungTuKeToan(year, subsite),
      this.getLoaiChungTu(year, subsite),
      this.getMaCK(year, subsite),
      this.getTKNH(year, subsite),
    ]);
  }

  async getChiNhanh(year: number, subsite?: string) {
    chiNhanhService.site = subsite
      ? `${this.props.context.pageContext.web.absoluteUrl}/${year}/${subsite}`
      : `${this.props.context.pageContext.web.absoluteUrl}/${year}`;
    let chinhanh = await chiNhanhService.getAll({
      filter: "TrangThai ne 0",
    });
    this.setState({
      chinhanh,
    });
  }

  async getDuAn(year: number, subsite?: string) {
    duAnService.site = subsite
      ? `${this.props.context.pageContext.web.absoluteUrl}/${year}/${subsite}`
      : `${this.props.context.pageContext.web.absoluteUrl}/${year}`;
    let duAn = await duAnService.getAll({
      filter: "TrangThai ne 0",
    });

    this.setState({
      duAn,
    });
  }

  async getNhaCungCap(year: number, subsite?: string) {
    nhaCungCapService.site = subsite
      ? `${this.props.context.pageContext.web.absoluteUrl}/${year}/${subsite}`
      : `${this.props.context.pageContext.web.absoluteUrl}/${year}`;
    let nhaCungCap = await nhaCungCapService.getAll({
      filter: "TrangThai ne 0",
    })

    this.setState({
      nhaCungCap,
    });
  }

  async getNhomChungTu(year: number, subsite?: string) {
    nhomCTService.site = subsite
      ? `${this.props.context.pageContext.web.absoluteUrl}/${year}/${subsite}`
      : `${this.props.context.pageContext.web.absoluteUrl}/${year}`;
    let nhomChungTu = await nhomCTService.getAll({
      filter: "TrangThai ne 0",
    });

    this.setState({
      nhomChungTu,
    });
  }

  async getLoaiChungTuKeToan(year: number, subsite?: string) {
    loaiCTKTService.site = subsite
      ? `${this.props.context.pageContext.web.absoluteUrl}/${year}/${subsite}`
      : `${this.props.context.pageContext.web.absoluteUrl}/${year}`;
    let loaiChungTuKeToan = await loaiCTKTService.getAll({
      filter: "TrangThai ne 0",
    });

    this.setState({
      loaiChungTuKeToan,
    });
  }

  async getLoaiChungTu(year: number, subsite?: string) {
    loaiCTService.site = subsite
      ? `${this.props.context.pageContext.web.absoluteUrl}/${year}/${subsite}`
      : `${this.props.context.pageContext.web.absoluteUrl}/${year}`;
    let loaiChungTu = await loaiCTService.getAll({
      filter: "TrangThai ne 0",
    });
    this.setState({
      loaiChungTu,
    });
  }

  async getMaCK(year: number, subsite?: string) {
    maCKService.site = subsite
      ? `${this.props.context.pageContext.web.absoluteUrl}/${year}/${subsite}`
      : `${this.props.context.pageContext.web.absoluteUrl}/${year}`;
    let maCK = await maCKService.getAll({
      filter: "TrangThai ne 0",
    });
    this.setState({
      maCK,
    });
  }

  async getTKNH(year: number, subsite?: string) {
    tKNHService.site = subsite
      ? `${this.props.context.pageContext.web.absoluteUrl}/${year}/${subsite}`
      : `${this.props.context.pageContext.web.absoluteUrl}/${year}`;
    let tKNH = await tKNHService.getAll({
      filter: "TrangThai ne 0",
    });
    this.setState({
      tKNH,
    });
  }

  async selectYear(yearSelected: number) {
    this.setState({
      loading: true,
    });
    if (this.props.form.getFieldValue("TypeDoc") == "LT") {
      await this.loadMetaData(yearSelected);
    } else {
      let subsite = this.props.form.getFieldValue("TypeDoc");
      await this.loadMetaData(yearSelected, subsite);
    }

    this.setState({
      loading: false,
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
    this.getFormValue();
  }

  public render(): React.ReactElement<FormSearchProps> {
    const { getFieldDecorator } = this.props.form;

    return (
      <Spin spinning={this.state.loading}>
        <div
          className={styles.searchDocuments__searchForm}
          style={{ height: window.innerHeight - 270 }}
        >
          <Form
            labelAlign={"left"}
            {...formItemLayout}
            className={styles.searchDocuments__searchForm__form}
          >
            <Form.Item
              className={styles.searchDocuments__searchForm__form__input}
            >
              {getFieldDecorator(
                "KeyWord",
                {}
              )(
                <Input
                  style={{ width: "100%" }}
                  placeholder="Nhập từ khóa để tìm kiếm chứng từ"
                />
              )}
            </Form.Item>
            <div
              className={
                styles.searchDocuments__searchForm__form__wrapperByGroup
              }
            >
              <Form.Item label="Năm">
                {getFieldDecorator("Year", {
                  initialValue: this.state.yearSelected,
                })(
                  <Select
                    showSearch
                    onSelect={async (value: any) => {
                      this.props.form.resetFields(fieldCanReset);
                      await this.selectYear(value);
                    }}
                  >
                    {years.map((item) => (
                      <Select.Option key={item.toString()} value={item}>
                        {item.toString()}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
              <Form.Item label="Loại tài liệu">
                {getFieldDecorator("TypeDoc", { initialValue: "LT" })(
                  <Select
                    showSearch
                    onSelect={(value) => {
                      this.props.form.resetFields(fieldCanReset);
                      this.selectYear(this.state.yearSelected);
                    }}
                  >
                    <Select.Option key={"MS"} value={"MS"}>
                      Hồ Sơ mua sắm
                    </Select.Option>
                    <Select.Option key={"TT"} value={"TT"}>
                      Hồ Sơ thanh toán
                    </Select.Option>
                    <Select.Option key={"TU"} value={"TU"}>
                      Hồ Sơ tạm ứng
                    </Select.Option>
                    <Select.Option key={"LT"} value={"LT"}>
                      Chứng từ lưu tạm
                    </Select.Option>
                  </Select>
                )}
              </Form.Item>
              <Form.Item label="Chi nhánh">
                {getFieldDecorator(
                  "ChiNhanhId",
                  {}
                )(
                  <Select
                    showSearch
                    allowClear
                    disabled={this.state.chinhanh?.length > 0 ? false : true}
                  >
                    {this.state.chinhanh?.map((item) => (
                      <Select.Option key={item.Id} value={item.Id}>
                        {item.TenChiNhanh}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
              <Form.Item label="Dự án">
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
                      <Select.Option value={item.Id} key={item.Id.toString()}>
                        {item.TenDuAn}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
              <Form.Item label="Bộ phận">
                {getFieldDecorator(
                  "BoPhanThucHienId",
                  {}
                )(
                  <PeoplePicker
                    ref={this.peoplePickerRef}
                    key={"id"}
                    context={this.props.context}
                    personSelectionLimit={1}
                    showtooltip={false}
                    disabled={false}
                    onChange={(items: IPersonaProps[]) => {
                      if (items?.length > 0) {
                        console.log(items);
                        this.setState({
                          BoPhanThucHienId: parseInt(items[0].id),
                        });
                      } 
                    }}
                    showHiddenInUI={true}
                    principalTypes={[PrincipalType.SharePointGroup]}
                    resolveDelay={500}
                  />
                )}
              </Form.Item>
              <Form.Item label="Nhà cung cấp">
                {getFieldDecorator(
                  "NhaCungCapId",
                  {}
                )(
                  <Select
                    showSearch
                    allowClear
                    disabled={this.state.nhaCungCap?.length > 0 ? false : true}
                  >
                    {this.state.nhaCungCap?.map((item) => (
                      <Select.Option value={item.Id} key={item.Id.toString()}>
                        {item.TenNCC}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </div>
            <div
              className={
                styles.searchDocuments__searchForm__form__wrapperByGroup
              }
            >
              <Form.Item label="Nhóm chứng từ">
                {getFieldDecorator(
                  "NhomChungTuId",
                  {}
                )(
                  <Select
                    showSearch
                    allowClear
                    disabled={this.state.nhomChungTu?.length > 0 ? false : true}
                  >
                    {this.state.nhomChungTu?.map((item) => (
                      <Select.Option value={item.Id} key={item.Id.toString()}>
                        {item.NhomChungTu}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
              <Form.Item label="Loại chứng từ:">
                {getFieldDecorator(
                  "LoaiChungTuId",
                  {}
                )(
                  <Select
                    showSearch
                    allowClear
                    disabled={this.state.loaiChungTu?.length > 0 ? false : true}
                  >
                    {this.state.loaiChungTu?.map((item) => (
                      <Select.Option value={item.Id} key={item.Id.toString()}>
                        {item.TenLoaiChungTu}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
              <Form.Item label="Số chứng từ:">
                {getFieldDecorator("SoChungTu", {})(<Input />)}
              </Form.Item>
              <Form.Item label={"Ngày chứng từ:"} style={{ paddingBottom: 0 }}>
                <Form.Item
                  style={{ display: "inline-block", width: "calc(50% - 12px)" }}
                >
                  {getFieldDecorator("NgayChungTuFrom", {
                    rules: [],
                  })(
                    <DatePicker
                      format="DD/MM/YYYY"
                      placeholder={"Từ ngày:"}
                      style={{ width: `100%` }}
                      disabledDate={(NgayChungTuFrom) => {
                        let dateInCalendar = NgayChungTuFrom?.startOf("day");
                        const NgayChungTuTo: moment.Moment =
                          this.props.form.getFieldValue("NgayChungTuTo");
                        if (NgayChungTuTo) {
                          let selectedEndDate = NgayChungTuTo.startOf("day");
                          return !!(
                            selectedEndDate &&
                            dateInCalendar &&
                            dateInCalendar > selectedEndDate
                          );
                        } else {
                          return false;
                        }
                      }}
                    />
                  )}
                </Form.Item>
                <span
                  style={{
                    display: "inline-block",
                    width: "24px",
                    textAlign: "center",
                  }}
                >
                  -
                </span>
                <Form.Item
                  style={{ display: "inline-block", width: "calc(50% - 12px)" }}
                >
                  {getFieldDecorator("NgayChungTuTo", {
                    rules: [],
                  })(
                    <DatePicker
                      format="DD/MM/YYYY"
                      placeholder={"Đến ngày:"}
                      style={{ width: `100%` }}
                      disabledDate={(NgayChungTuTo) => {
                        let dateInCalendar = NgayChungTuTo?.startOf("day");
                        const NgayChungTuFrom: moment.Moment =
                          this.props.form.getFieldValue("NgayChungTuFrom");
                        if (NgayChungTuFrom) {
                          let selectedEndDate = NgayChungTuFrom.startOf("day");
                          return !!(
                            selectedEndDate &&
                            dateInCalendar &&
                            dateInCalendar < selectedEndDate
                          );
                        } else {
                          return false;
                        }
                      }}
                    />
                  )}
                </Form.Item>
              </Form.Item>
            </div>
            <div
              className={
                styles.searchDocuments__searchForm__form__wrapperByGroup
              }
            >
              <Form.Item label="Loại chứng từ KT:">
                {getFieldDecorator(
                  "LoaiChungTuKeToanId",
                  {}
                )(
                  <Select
                    showSearch
                    allowClear
                    disabled={
                      this.state.loaiChungTuKeToan?.length > 0 ? false : true
                    }
                  >
                    {this.state.loaiChungTuKeToan?.map((item) => (
                      <Select.Option value={item.Id} key={item.Id.toString()}>
                        {item.TenLoaiChungTuKeToan}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>

              <Form.Item
                label={"Ngày chứng từ KT:"}
                style={{ paddingBottom: 0 }}
              >
                <Form.Item
                  style={{ display: "inline-block", width: "calc(50% - 12px)" }}
                >
                  {getFieldDecorator("NgayChungTuKTFrom", {
                    rules: [],
                  })(
                    <DatePicker
                      format="DD/MM/YYYY"
                      placeholder={"Từ ngày:"}
                      style={{ width: `100%` }}
                      disabledDate={(NgayChungTuKTFrom) => {
                        let dateInCalendar = NgayChungTuKTFrom?.startOf("day");
                        const NgayChungTuKTTo: moment.Moment =
                          this.props.form.getFieldValue("NgayChungTuKTTo");
                        if (NgayChungTuKTTo) {
                          let selectedEndDate = NgayChungTuKTTo.startOf("day");
                          return !!(
                            selectedEndDate &&
                            dateInCalendar &&
                            dateInCalendar > selectedEndDate
                          );
                        } else {
                          return false;
                        }
                      }}
                    />
                  )}
                </Form.Item>
                <span
                  style={{
                    display: "inline-block",
                    width: "24px",
                    textAlign: "center",
                  }}
                >
                  -
                </span>
                <Form.Item
                  style={{ display: "inline-block", width: "calc(50% - 12px)" }}
                >
                  {getFieldDecorator("NgayChungTuKTTo", {
                    rules: [],
                  })(
                    <DatePicker
                      format="DD/MM/YYYY"
                      placeholder={"Đến ngày:"}
                      style={{ width: `100%` }}
                      disabledDate={(NgayChungTuKTTo) => {
                        let dateInCalendar = NgayChungTuKTTo?.startOf("day");
                        const NgayChungTuKTFrom: moment.Moment =
                          this.props.form.getFieldValue("NgayChungTuKTFrom");
                        if (NgayChungTuKTFrom) {
                          let selectedEndDate =
                            NgayChungTuKTFrom.startOf("day");
                          return !!(
                            selectedEndDate &&
                            dateInCalendar &&
                            dateInCalendar < selectedEndDate
                          );
                        } else {
                          return false;
                        }
                      }}
                    />
                  )}
                </Form.Item>
              </Form.Item>
              <Form.Item label="Số chứng từ KT:">
                {getFieldDecorator("SoChungTuKeToan", {})(<Input />)}
              </Form.Item>
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
          </Form>
          <div className={styles.searchDocuments__searchForm__button}>
            <Button
              onClick={() => {
                this.reset();
              }}
              className={
                styles.searchDocuments__searchForm__button__buttonReset
              }
            >
              Nhập lại
            </Button>
            <Button
              onClick={() => {
                this.getFormValue();
              }}
              icon="search"
              className={
                styles.searchDocuments__searchForm__button__buttonSearch
              }
            >
              Tìm kiếm
            </Button>
          </div>
        </div>
      </Spin>
    );
  }
}
export const FormSearch = Form.create<FormSearchProps>()(FormSearchComp);
