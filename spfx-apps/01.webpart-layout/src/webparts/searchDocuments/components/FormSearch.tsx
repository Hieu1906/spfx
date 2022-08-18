import { WebPartContext } from "@microsoft/sp-webpart-base";
import { sp } from "@pnp/sp";
import "@pnp/sp/folders";
import "@pnp/sp/items";
import "@pnp/sp/lists";
import "@pnp/sp/webs";
import {
  PeoplePicker,
  PrincipalType,
} from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { Button, DatePicker, Form, Input, message, Select, Spin } from "antd";
import { FormComponentProps } from "antd/lib/form/Form";
import * as moment from "moment";
import { IPersonaProps } from "office-ui-fabric-react";
import * as React from "react";
import { Global } from "../../../common/functions/globalConstants";
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
import { maCKService } from "../../common/services/maChungKhoanService";
import { nhaCungCapService } from "../../common/services/nhaCungCapService";
import { tKNHService } from "../../common/services/taiKhoanNganHangService";
import styles from "./SearchDocuments.module.scss";
export interface ISiteInfor {
  TypeNode: "DocLib" | "Site" | "Folder";
  RelativeUrl: string;
  AbsoluteUrl?: string;
  Created: moment.Moment;
  UniqueId: string;
  Title: string;
  IsLeaf?: boolean;
}
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
  nhomCT: ISiteInfor[];
  loaiCT: ISiteInfor[];
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
let arrMonth = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
];
const fieldCanReset = [
  "ChiNhanhId",
  "DuAnId",
  "NhaCungCapId",
  "SoChungTu",
  "NgayChungTuKTTo",
  "NgayChungTuTo",
  "LoaiChungTuKeToanId",
  "NgayChungTuFrom",
  "NgayChungTuKTFrom",
  "MaChungKhoanId",
  "RequestCode",
  "TaiKhoanNganHangId",
  "ChungTuLuuTam",
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
      nhomCT: [],
      loaiCT: [],
      loading: false,
    };
    this.onMount(async () => {
      this.setState({
        loading: true,
      });
      await this.initSearch();
      await this.loadMetaData(
        this.props.form.getFieldValue("Year"),
        this.props.form.getFieldValue("LoaiCT")
      );

      this.setState({
        loading: false,
      });
    });
  }

  async initSearch() {
    let keyword = Global.Functions.getParameterByName("keyword");
    let baseUrl = Global.Functions.getParameterByName("baseUrl");
    let urlSplitted = baseUrl.match("^[^?]*")![0].split("/");
    let year = urlSplitted[10] ? urlSplitted[10] : moment().year().toString();
    let nhomCT_Url = urlSplitted[8]
      ? `${this.props.context.pageContext.web.absoluteUrl}/${urlSplitted[8]}`
      : undefined;
    let loaiCT_Url = urlSplitted[8]
      ? `${this.props.context.pageContext.web.absoluteUrl}/${urlSplitted[8]}/${urlSplitted[9]}`
      : undefined;
    await this.getParentSite();
    if (nhomCT_Url) {
      this.props.form.setFieldsValue({
        NhomCT: nhomCT_Url,
      });
    } else {
      this.props.form.setFieldsValue({
        NhomCT: this.state.nhomCT[0].AbsoluteUrl,
      });
    }
    if (loaiCT_Url) {
      await this.getLoaiCT(loaiCT_Url);
      this.props.form.setFieldsValue({
        LoaiCT: loaiCT_Url,
      });
    } else {
      let absoluteUrl = this.state.nhomCT[0].AbsoluteUrl;
      await this.getLoaiCT(absoluteUrl);
      this.props.form.setFieldsValue({
        LoaiCT: this.state.loaiCT[0].AbsoluteUrl,
      });
    }

    if (year) {
      this.props.form.setFieldsValue({
        Year: parseInt(year),
      });
    } else {
      this.props.form.setFieldsValue({
        Year: moment().year(),
      });
    }
    if (keyword) {
      this.props.form.setFieldsValue({
        KeyWord: keyword,
      });
    }
    this.getFormValue();
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

  public async getParentSite() {
    let parentSiteUrl = `${this.props.context.pageContext.site.absoluteUrl}/apps/rfa/khoctkt`;
    let nhomCT = await this.getSubSiteInCurrentSite(parentSiteUrl);
    this.setState({
      nhomCT,
    });
  }

  public async getLoaiCT(absoluteUrl: string) {
    let loaiCT = await this.getSubSiteInCurrentSite(absoluteUrl);
    this.setState({
      loaiCT,
    });
  }

  public async getSubSiteInCurrentSite(nhomCT: string) {
    let treeItem: ISiteInfor[] = [];
    let subSites = await sp.configure({}, nhomCT).web.webs.get();
    if (subSites && subSites.length > 0) {
      subSites.forEach((item) => {
        treeItem.push({
          UniqueId: item.Id,
          RelativeUrl: item.ServerRelativeUrl,
          AbsoluteUrl: item.Url,
          Title: item.Title,
          TypeNode: "Site",
          Created: moment(item.Created),
        });
      });
    }
    return treeItem || [];
  }

  async loadMetaData(year: number, absoluteUrl: string) {
    await Promise.all([
      this.getChiNhanh(year, absoluteUrl),
      this.getDuAn(year, absoluteUrl),
      this.getNhaCungCap(year, absoluteUrl),
      this.getLoaiChungTuKeToan(year, absoluteUrl),
      this.getMaCK(year, absoluteUrl),
      this.getTKNH(year, absoluteUrl),
    ]);
  }

  async getChiNhanh(year: number, absoluteUrl: string) {
    chiNhanhService.site = `${absoluteUrl}/${year}`;
    let chinhanh = await chiNhanhService.getAll({
      filter: "TrangThai ne 1",
    });
    this.setState({
      chinhanh,
    });
  }

  async getDuAn(year: number, absoluteUrl: string) {
    duAnService.site = `${absoluteUrl}/${year}`;
    let duAn = await duAnService.getAll({
      filter: "TrangThai ne 1",
    });

    this.setState({
      duAn,
    });
  }

  async getNhaCungCap(year: number, absoluteUrl: string) {
    nhaCungCapService.site = `${absoluteUrl}/${year}`;
    let nhaCungCap = await nhaCungCapService.getAll({
      filter: "TrangThai ne 1",
    });

    this.setState({
      nhaCungCap,
    });
  }

  async getLoaiChungTuKeToan(year: number, absoluteUrl: string) {
    loaiCTKTService.site = `${absoluteUrl}/${year}`;
    let loaiChungTuKeToan = await loaiCTKTService.getAll({
      filter: "TrangThai ne 1",
    });

    this.setState({
      loaiChungTuKeToan,
    });
  }

  async getMaCK(year: number, absoluteUrl: string) {
    maCKService.site = `${absoluteUrl}/${year}`;
    let maCK = await maCKService.getAll({
      filter: "TrangThai ne 1",
    });
    this.setState({
      maCK,
    });
  }

  async getTKNH(year: number, absoluteUrl: string) {
    tKNHService.site = `${absoluteUrl}/${year}`;
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
    this.props.form.setFieldsValue({ Year: moment().year() });
    this.getFormValue();
  }

  public render(): React.ReactElement<FormSearchProps> {
    const { getFieldDecorator } = this.props.form;
    let initialValueNhomCT =
      this.state.loaiCT?.length > 0
        ? this.state.nhomCT[0].AbsoluteUrl
        : undefined;
    let initialValueLoaiCT =
      this.state.loaiCT?.length > 0
        ? this.state.loaiCT[0].AbsoluteUrl
        : undefined;
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
              <Form.Item label="Nhóm chứng từ">
                {getFieldDecorator("NhomCT", {
                  initialValue: initialValueNhomCT,
                })(
                  <Select
                    onSelect={async (value) => {
                      this.props.form.resetFields(fieldCanReset);
                      this.props.form.resetFields(["LoaiCT", "Year"]);
                      await this.getLoaiCT(value as string);
                    }}
                  >
                    {this.state.nhomCT.map((item) => (
                      <Select.Option
                        key={item.UniqueId}
                        value={item.AbsoluteUrl}
                      >
                        {item.Title}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
              <Form.Item label="Loại chứng từ">
                {getFieldDecorator("LoaiCT", {
                  initialValue: initialValueLoaiCT,
                })(
                  <Select
                    showSearch
                    onSelect={(value) => {
                      this.props.form.resetFields(fieldCanReset);
                      this.props.form.resetFields(["Year"]);
                    }}
                  >
                    {this.state.loaiCT.map((item) => (
                      <Select.Option
                        key={item.UniqueId}
                        value={item.AbsoluteUrl}
                      >
                        {item.Title}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
              <Form.Item label="Năm">
                {getFieldDecorator("Year", {
                  initialValue: this.state.yearSelected,
                })(
                  <Select
                    showSearch
                    onSelect={async (value: any) => {
                      this.props.form.resetFields(fieldCanReset);
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
              <Form.Item label="Thư mục ">
                {getFieldDecorator("Folder", {
                  initialValue: "ChungTuLuuTam",
                })(
                  <Select
                    showSearch
                    onSelect={async (value: any) => {
                      this.props.form.resetFields(fieldCanReset);
                    }}
                  >
                    <Select.Option key={100} value={"ChungTuLuuTam"}>
                      Chứng từ lưu tạm
                    </Select.Option>
                    {arrMonth.map((item) => (
                      <Select.Option key={item.toString()} value={item}>
                        Tháng {item.toString()}
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
