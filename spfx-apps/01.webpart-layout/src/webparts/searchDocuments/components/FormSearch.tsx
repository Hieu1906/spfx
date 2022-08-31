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
import {
  Button,
  DatePicker,
  Form,
  Icon,
  Input,
  message,
  Select,
  Spin,
  Tabs,
} from "antd";
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
import { loaiCTService } from "../../common/services/loaiChungTuService";
import { maCKService } from "../../common/services/maChungKhoanService";
import { nhaCungCapService } from "../../common/services/nhaCungCapService";
import { nhomCTService } from "../../common/services/nhomChungTuService";
import { tKNHService } from "../../common/services/taiKhoanNganHangService";
import styles from "./SearchDocuments.module.scss";
const { TabPane } = Tabs;
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
  siteNhomCTs: ISiteInfor[];
  siteLoaiCTs: ISiteInfor[];
  filterBy?: "FolderChungTuLuuTam" | "SiteNhomChungTu";
}
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
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
  "KeyWord",
  "SoChungTuKeToan",
  "LoaiChungTuId",
  "NhomChungTuId"
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
      siteNhomCTs: [],
      siteLoaiCTs: [],
      loading: false,
    };
    this.onMount(async () => {
      await this.init();
    });
  }
  async init() {
    this.setState({
      loading: true,
    });
    // gọi lần đầu để láy các subsite đầu tiên từ kho chứng từ

    let filterBy = Global.Functions.getParameterByName("filterBy");
    let keyword = Global.Functions.getParameterByName("keyword");
    if (keyword) {
      this.props.form.setFieldsValue({
        KeyWord: keyword,
      });
    }
    if (filterBy == "FolderChungTuLuuTam") {
      await this.setState({
        filterBy: "FolderChungTuLuuTam",
      });
    
      await this.loadMetaData();
     
      this.getFormValue("FolderChungTuLuuTam");
    } else {
      await this.setState({
        filterBy: "SiteNhomChungTu",
      });
      await this.getInforByParam();
      await this.loadMetaData(
        this.props.form.getFieldValue("Year"),
        this.props.form.getFieldValue("SiteLoaiCT")
      );
      this.getFormValue("SiteNhomChungTu");
    }

    this.setState({
      loading: false,
    });
  }
  async getInforByParam() {
    await this.getSiteNhomCTs();
  
    let baseUrl = Global.Functions.getParameterByName("baseUrl");
    let urlSplitted = baseUrl.match("^[^?]*")![0].split("/");
    let year = urlSplitted[10] ? urlSplitted[10] : moment().year().toString();
    let nhomCT_Url = urlSplitted[8]
      ? `${this.props.context.pageContext.web.absoluteUrl}/${urlSplitted[8]}`
      : undefined;
    let loaiCT_Url = urlSplitted[9]
      ? `${this.props.context.pageContext.web.absoluteUrl}/${urlSplitted[8]}/${urlSplitted[9]}`
      : undefined;

    if (nhomCT_Url) {
      this.props.form.setFieldsValue({
        SiteNhomCT: nhomCT_Url,
      });
    } else {
      this.props.form.setFieldsValue({
        SiteNhomCT: this.state.siteNhomCTs[0].AbsoluteUrl,
      });
    }
    if (loaiCT_Url) {
      await this.getSiteLoaiCTs(nhomCT_Url);
      console.log(this.state.siteLoaiCTs);
      this.props.form.setFieldsValue({
        SiteLoaiCT: loaiCT_Url,
      });
    } else {
      let absoluteUrl = this.state.siteNhomCTs[0].AbsoluteUrl;
      await this.getSiteLoaiCTs(absoluteUrl);
      this.props.form.setFieldsValue({
        SiteLoaiCT: this.state.siteLoaiCTs[0].AbsoluteUrl,
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
  
  }

  getFormValue(filterBy: "FolderChungTuLuuTam" | "SiteNhomChungTu") {
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
          if (filterBy == "FolderChungTuLuuTam") {
            formvalues.Folder = "ChungTuLuuTam";
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

  public async getSiteNhomCTs() {
    try {
      let parentSiteUrl = `${this.props.context.pageContext.site.absoluteUrl}/apps/rfa/khoctkt`;
      let siteNhomCTs = await this.getSubSiteInCurrentSite(parentSiteUrl);
      this.setState({
        siteNhomCTs,
      });
    } catch (error) {
      console.error("Đã có lỗi xảy ra tròn quá trình lấy subsite đầu tiên");
      console.error(error);
    }
  }

  public async getSiteLoaiCTs(absoluteUrl: string) {
    let siteLoaiCTs = await this.getSubSiteInCurrentSite(absoluteUrl);
    this.setState({
      siteLoaiCTs,
    });
  }

  public async getSubSiteInCurrentSite(siteNhomCTs: string) {
    let treeItem: ISiteInfor[] = [];
    let subSites = await sp.configure({}, siteNhomCTs).web.webs.get();
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

  async loadMetaData(year?: number, absoluteUrl?: string) {
    this.setState({
      loading: true,
    });
    year = year ? year : moment().year();
    try {
      await Promise.all([
        this.getChiNhanh(year, absoluteUrl),
        this.getDuAn(year, absoluteUrl),
        this.getNhaCungCap(year, absoluteUrl),
        this.getLoaiChungTuKeToan(year, absoluteUrl),
        this.getMaCK(year, absoluteUrl),
        this.getTKNH(year, absoluteUrl),
        this.getNhomChungTu(year, absoluteUrl),
        this.getLoaiChungTu(year, absoluteUrl),
      ]);
    } catch (error) {
      console.error("Có lỗi xảy ra trong quá trình lấy thông");
    } finally {
      this.setState({
        loading: false,
      });
    }
  }

  async getChiNhanh(year: number, absoluteUrl?: string) {
    try {
      if (absoluteUrl) {
        chiNhanhService.site = `${absoluteUrl}/${year}`;
      }
      let chinhanh = await chiNhanhService.getAll({
        filter: "TrangThai ne 1",
      });
      this.setState({
        chinhanh,
      });
    } catch (error) {
      this.setState({
        chinhanh: [],
      });
    }
  }

  async getDuAn(year: number, absoluteUrl?: string) {
    if (absoluteUrl) {
      duAnService.site = `${absoluteUrl}/${year}`;
    }

    let duAn = await duAnService.getAll({
      filter: "TrangThai ne 1",
    });

    this.setState({
      duAn,
    });
  }

  async getNhaCungCap(year: number, absoluteUrl?: string) {
    try {
      if (absoluteUrl) {
        nhaCungCapService.site = `${absoluteUrl}/${year}`;
      }
      let nhaCungCap = await nhaCungCapService.getAll({
        filter: "TrangThai ne 1",
      });

      this.setState({
        nhaCungCap,
      });
    } catch (error) {
      this.setState({
        nhaCungCap: [],
      });
    }
  }

  async getLoaiChungTuKeToan(year: number, absoluteUrl?: string) {
    try {
      if (absoluteUrl) {
        loaiCTKTService.site = `${absoluteUrl}/${year}`;
      }

      let loaiChungTuKeToan = await loaiCTKTService.getAll({
        filter: "TrangThai ne 1",
      });

      this.setState({
        loaiChungTuKeToan,
      });
    } catch (error) {
      this.setState({
        loaiChungTuKeToan: [],
      });
    }
  }

  async getMaCK(year: number, absoluteUrl?: string) {
    try {
      if (absoluteUrl) {
        maCKService.site = `${absoluteUrl}/${year}`;
      }

      let maCK = await maCKService.getAll({
        filter: "TrangThai ne 1",
      });
      this.setState({
        maCK,
      });
    } catch (error) {
      this.setState({
        maCK: [],
      });
    }
  }

  async getTKNH(year: number, absoluteUrl?: string) {
    try {
      if (absoluteUrl) {
        tKNHService.site = `${absoluteUrl}/${year}`;
      }

      let tKNH = await tKNHService.getAll({
        filter: "TrangThai ne 1",
      });
      this.setState({
        tKNH,
      });
    } catch (error) {
      this.setState({
        tKNH: [],
      });
    }
  }

  async getNhomChungTu(year: number, absoluteUrl?: string) {
    try {
      if (absoluteUrl) {
        nhomCTService.site = `${absoluteUrl}/${year}`;
      }

      let nhomChungTu = await nhomCTService.getAll({
        filter: "TrangThai ne 1",
      });

      this.setState({
        nhomChungTu,
      });
    } catch (error) {
      this.setState({
        nhomChungTu: [],
      });
    }
  }

  async getLoaiChungTu(year: number, absoluteUrl?: string) {
    try {
      if (absoluteUrl) {
        loaiCTService.site = `${absoluteUrl}/${year}`;
      }

      let loaiChungTu = await loaiCTService.getAll({
        filter: "TrangThai ne 1",
      });
      this.setState({
        loaiChungTu,
      });
    } catch (error) {
      this.setState({
        loaiChungTu: [],
      });
    }
  }

  reset() {
    this.setState({
      BoPhanThucHienId: undefined,
    });
    this.peoplePickerRef!.current!.setState({
      selectedPersons: [],
    });
    this.props.form.resetFields(fieldCanReset);
    this.getFormValue(this.state.filterBy);
  }

  renderFormItem(
    getFieldDecorator: any,
    filterBy: "FolderChungTuLuuTam" | "SiteNhomChungTu"
  ) {
    return (
      <div className={styles.searchDocuments__searchForm__form}>
        {filterBy == "SiteNhomChungTu" && (
          <div
            className={styles.searchDocuments__searchForm__form__wrapperByGroup}
          >
            <Form.Item label="Nhóm chứng từ">
              {getFieldDecorator(
                "SiteNhomCT",
                {}
              )(
                <Select
                  onSelect={async (value) => {
                    this.props.form.resetFields(fieldCanReset);
                    this.props.form.resetFields(["SiteLoaiCT", "Year"]);
                    await this.getSiteLoaiCTs(value as string);
                    await this.loadMetaData(
                      moment().year(),
                      this.state.siteLoaiCTs[0].AbsoluteUrl
                    );
                    this.props.form.setFieldsValue({
                      SiteLoaiCT: this.state.siteLoaiCTs[0].AbsoluteUrl,
                    });
                  }}
                >
                  {this.state.siteNhomCTs.map((item) => (
                    <Select.Option key={item.UniqueId} value={item.AbsoluteUrl}>
                      {item.Title}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            <Form.Item label="Loại chứng từ">
              {getFieldDecorator(
                "SiteLoaiCT",
                {}
              )(
                <Select
                  showSearch
                  onSelect={async (value) => {
                    this.props.form.resetFields(fieldCanReset);
                    this.props.form.resetFields(["Year"]);
                    await this.loadMetaData(moment().year(), value as string);
                  }}
                >
                  {this.state.siteLoaiCTs.map((item) => (
                    <Select.Option key={item.UniqueId} value={item.AbsoluteUrl}>
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
                    await this.loadMetaData(
                      value,
                      this.props.form.getFieldValue("SiteLoaiCT")
                    );
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
            <Form.Item label="Tháng">
              {getFieldDecorator("Folder", {
                initialValue: arrMonth[moment().month()],
              })(
                <Select
                  showSearch
                  onSelect={async (value: any) => {
                    this.props.form.resetFields(fieldCanReset);
                  }}
                >
                  {arrMonth.map((item) => (
                    <Select.Option key={item.toString()} value={item}>
                      Tháng {item.toString()}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </div>
        )}

        <div
          className={styles.searchDocuments__searchForm__form__wrapperByGroup}
        >
          {filterBy == "FolderChungTuLuuTam" && (
            <>
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
                        {item.TenNhomChungTu}
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
            </>
          )}
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
          className={styles.searchDocuments__searchForm__form__wrapperByGroup}
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

          <Form.Item label={"Ngày chứng từ KT:"} style={{ paddingBottom: 0 }}>
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
                      let selectedEndDate = NgayChungTuKTFrom.startOf("day");
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
          className={styles.searchDocuments__searchForm__form__wrapperByGroup}
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
      </div>
    );
  }

  async onTabClick(key: "FolderChungTuLuuTam" | "SiteNhomChungTu") {
    this.setState({
      filterBy: key,
    });
    if (key == "FolderChungTuLuuTam") {
      await this.loadMetaData();
      this.getFormValue(this.state.filterBy);
    } else {
      await this.getInforByParam();
      await this.loadMetaData(
        this.props.form.getFieldValue("Year"),
        this.props.form.getFieldValue("SiteLoaiCT")
      );
    }
    this.props.form.resetFields(fieldCanReset);
  }

  public render(): React.ReactElement<FormSearchProps> {
    const { getFieldDecorator } = this.props.form;

    return (
      <Spin spinning={this.state.loading}>
        <Form labelAlign={"left"} {...formItemLayout}>
          <Form.Item className={styles.input}>
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
          <Tabs
            onTabClick={async (
              key: "FolderChungTuLuuTam" | "SiteNhomChungTu",
              event: MouseEvent
            ) => {
              await this.onTabClick(key);
            }}
            defaultActiveKey={this.state.filterBy}
            activeKey={this.state.filterBy}
          >
            <TabPane
              tab={
                <span>
                  <Icon type="hdd" />
                  Chứng từ theo loại
                </span>
              }
              key="SiteNhomChungTu"
            ></TabPane>
            <TabPane
              tab={
                <span>
                  <Icon type="container" />
                  Chứng từ lưu tạm
                </span>
              }
              key="FolderChungTuLuuTam"
            ></TabPane>
          </Tabs>
          <div
            className={styles.searchDocuments__searchForm}
            style={{ height: window.innerHeight - 300 }}
          >
            {" "}
            {this.renderFormItem(getFieldDecorator, this.state.filterBy)}
          </div>
        </Form>
        <div className={styles.searchDocuments__searchForm__button}>
          <Button
            onClick={() => {
              this.reset();
            }}
            className={styles.searchDocuments__searchForm__button__buttonReset}
          >
            Nhập lại
          </Button>
          <Button
            onClick={() => {
              this.getFormValue(this.state.filterBy);
            }}
            icon="search"
            className={styles.searchDocuments__searchForm__button__buttonSearch}
          >
            Tìm kiếm
          </Button>
        </div>
      </Spin>
    );
  }
}
export const FormSearch = Form.create<FormSearchProps>()(FormSearchComp);
