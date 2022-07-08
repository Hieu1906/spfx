import { sp } from "@pnp/sp";
import "@pnp/sp/files/folder";
import "@pnp/sp/folders";
import "@pnp/sp/items";
import "@pnp/sp/lists";
import "@pnp/sp/webs";

import { Icon, message, Table, Tag } from "antd";
import * as React from "react";
import { BaseComponent } from "../../common/components/BaseComponent";
import { FormSearch, FormSearchComp } from "./FormSearch";
import { ISearchDocumentsProps } from "./ISearchDocumentsProps";
import styles from "./SearchDocuments.module.scss";

import { flatten, trim } from "lodash";
import * as moment from "moment";
import { emptyIcon } from "./svgIcon";
import Patiantion from "./Patination";
import { Global } from "../../../common/functions/globalConstants";
interface ResultFile {
  BoPhanThucHienId: number;
  BoPhanThucHienStringId: string;
  ChiNhanhId?: number;
  DuAnId: number;
  LoaiChungTuId: number;
  LoaiChungTuKeToanId: number;
  MaChungKhoanId: number;
  NgayChungTu: Date;
  NgayChungTuKeToan: Date;
  NhaCungCapId: number;
  NhomChungTuId: number;
  ServerRedirectedEmbedUrl: string;
  SoChungTu: string;
  SoChungTuKeToan: string;
  TaiKhoanNganHangId: number;
  Title: string;
  TrangThai: boolean;
  extension: string;
  uuid: string;
  NhomChungTu?: { NhomChungTu: string; ID: number };
  DuAn: { TenDuAn: string; ID: number };
  ChiNhanh: { TenChiNhanh: string; ID: number };
  LoaiChungTuKeToan: { TenLoaiChungTuKeToan: string; ID: number };
  BoPhanThucHien: { Title: string; ID: number };
  RequestCode: string;
  File: { Name: string };
}
interface ISearchDocumentsState {
  withTable: number;
  loading: boolean;
  DataSource: ResultFile[];
  isLoadData: boolean;
}

export default class SearchDocuments extends BaseComponent<
  ISearchDocumentsProps,
  ISearchDocumentsState
> {
  protected formSearchRef: React.RefObject<FormSearchComp> = React.createRef();
  constructor(props: ISearchDocumentsProps) {
    super(props);
    this.state = {
      withTable: 0,
      loading: false,
      DataSource: [],
      isLoadData: false,
    };
    this.onMount(async () => {
      this.getWidthViewTable();
      await this.initSearch();
    });
  }

  async initSearch() {
    let keyword = Global.Functions.getParameterByName("keyword");
    let year = Global.Functions.getParameterByName("year");
    await this.handelSearch({
      TypeDoc: "LT",
      Year: year ? parseInt(year) : moment().year(),
      KeyWord: keyword ? keyword : undefined,
    });
    if (keyword) {
      this.formSearchRef.current.props.form.setFieldsValue({
        KeyWord: keyword,
      });
    }
    if (year) {
      this.formSearchRef.current.props.form.setFieldsValue({
        Year: year,
      });
    }
  }

  getWidthViewTable() {
    let wrapperElement = document.querySelector("#searchDocuments");
    if (wrapperElement) {
      this.setState({
        withTable: wrapperElement.clientWidth - 450,
      });
    }
  }

  async getFilesInforByFolderPath(
    folderName: string,
    baseUrl: string,
    query?: string
  ) {
    let itemCollection = await sp
      .configure({}, baseUrl)
      .web.lists.getByTitle(folderName)
      .items.select(
        "*",
        "Title",
        "ChiNhanh/TenChiNhanh",
        "ChiNhanh/ID",
        "ChiNhanh/MaChiNhanh",
        "DuAn/TenDuAn",
        "DuAn/ID",
        "NhaCungCap/TenNCC",
        "NhaCungCap/ID",
        "NhomChungTu/NhomChungTu",
        "NhomChungTu/ID",
        "LoaiChungTu/TenLoaiChungTu",
        "LoaiChungTu/ID",
        "MaChungKhoan/ID",
        "MaChungKhoan/MaChungKhoan",
        "LoaiChungTuKeToan/ID",
        "LoaiChungTuKeToan/TenLoaiChungTuKeToan",
        "TaiKhoanNganHang/ID",
        "TaiKhoanNganHang/SoTaiKhoan",
        "BoPhanThucHien/Title",
        "BoPhanThucHien/ID",
        "File/Name"
      )
      .expand(
        "ChiNhanh",
        "DuAn",
        "NhaCungCap",
        "NhomChungTu",
        "LoaiChungTu",
        "LoaiChungTuKeToan",
        "MaChungKhoan",
        "TaiKhoanNganHang",
        "BoPhanThucHien",
        "File"
      )
      .filter(query)
      .getAll();
    return itemCollection;
  }

  buildQuery(formvalues: any) {
    let query = "";
    let arrQuery: string[] = [];
    if (formvalues?.KeyWord) {
      arrQuery.push(`substringof('${trim(formvalues.KeyWord)}',Title)`);
    }
    if (formvalues?.ChiNhanhId) {
      arrQuery.push(`ChiNhanhId eq ${formvalues?.ChiNhanhId}`);
    }
    if (formvalues?.DuAnId) {
      arrQuery.push(`DuAnId eq ${formvalues?.DuAnId}`);
    }
    if (formvalues?.NhaCungCapId) {
      arrQuery.push(`NhaCungCapId eq ${formvalues?.NhaCungCapId}`);
    }
    if (formvalues?.MaChungKhoanId) {
      arrQuery.push(`MaChungKhoanId eq ${formvalues?.MaChungKhoanId}`);
    }
    if (formvalues?.LoaiChungTuId) {
      arrQuery.push(`LoaiChungTuId eq ${formvalues?.LoaiChungTuId}`);
    }
    if (formvalues?.LoaiChungTuId) {
      arrQuery.push(`LoaiChungTuId eq ${formvalues?.LoaiChungTuId}`);
    }
    if (formvalues?.TaiKhoanNganHangId) {
      arrQuery.push(`TaiKhoanNganHangId eq ${formvalues?.TaiKhoanNganHangId}`);
    }
    if (formvalues?.SoChungTu) {
      arrQuery.push(`substringof('${trim(formvalues.SoChungTu)}',SoChungTu)`);
    }

    if (formvalues?.SoChungTuKeToan) {
      arrQuery.push(
        `substringof('${trim(formvalues.SoChungTuKeToan)}',SoChungTuKeToan)`
      );
    }

    if (formvalues?.LoaiChungTuKeToanId) {
      arrQuery.push(
        `LoaiChungTuKeToanId eq ${formvalues?.LoaiChungTuKeToanId}`
      );
    }
    if (formvalues?.RequestCode) {
      arrQuery.push(
        `substringof('${trim(formvalues.RequestCode)}',RequestCode)`
      );
    }
    if (formvalues.NgayChungTuFrom) {
      const isoDate = formvalues.NgayChungTuFrom.startOf("date").toJSON();
      arrQuery.push(`NgayChungTu ge datetime'${isoDate}'`);
    }
    if (formvalues.BoPhanThucHienId) {
      arrQuery.push(`BoPhanThucHienId eq ${formvalues?.BoPhanThucHienId}`);
    }

    if (formvalues.NgayChungTuTo) {
      const isoDate = formvalues.NgayChungTuTo.endOf("date").toJSON();
      arrQuery.push(`NgayChungTuTo le datetime'${isoDate}'`);
    }
    if (formvalues.NgayChungTuKTFrom) {
      const isoDate = formvalues.NgayChungTuKTFrom.startOf("date").toJSON();
      arrQuery.push(`NgayChungTuKeToan ge datetime'${isoDate}'`);
    }
    if (formvalues.NgayChungTuKTTo) {
      const isoDate = formvalues.NgayChungTuKTTo.endOf("date").toJSON();
      arrQuery.push(`NgayChungTuKeToan le datetime'${isoDate}'`);
    }

    if (arrQuery.length > 0) {
      query = arrQuery.join(" and ");
    }
    return query;
  }

  async handelSearch(formvalues: any) {
    this.setState({ loading: true, isLoadData: true });
    let allFileFilter: any[];
    let query = this.buildQuery(formvalues);
    try {
      // config site  để thực hiện search
      if (formvalues.TypeDoc == "LT") {
        let docLibName = "Chứng từ lưu tạm";
        allFileFilter = await this.getFilesInforByFolderPath(
          docLibName,
          `${this.props.context.pageContext.web.absoluteUrl}/${formvalues.Year}`,
          query
        );
      } else {
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
        let result = await Promise.all(
          arrMonth.map(async (item) => {
            return this.getFilesInforByFolderPath(
              item,
              `${this.props.context.pageContext.web.absoluteUrl}/${formvalues.Year}/${formvalues.TypeDoc}`,
              query
            );
          })
        );

        allFileFilter = flatten(result);
      }
      allFileFilter = allFileFilter.filter((item) => {
        return item.File?.Name;
      });
      console.log(allFileFilter);
      this.setState({
        DataSource: allFileFilter as any[],
      });
    } catch (error) {
      message.error("Đã có lỗi trong quá trình tìm kiếm tài liệu", 5);
    }
    this.setState({ loading: false });
  }

  getExtension(path) {
    var basename = path.split(/[\\/]/).pop(), // extract file name from full path ...
      // (supports `\\` and `/` separators)
      pos = basename.lastIndexOf("."); // get last position of `.`

    if (basename === "" || pos < 1)
      // if file name is empty or ...
      return ""; //  `.` not found (-1) or comes first (0)

    return basename.slice(pos + 1); // extract extension ignoring `.`
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
  getColumn() {
    let columns = [
      {
        title: "Tên file",
        dataIndex: "Title",
        width: 300,
        key: "Title",

        render: (text: string, record: ResultFile, index) => (
          <div
            key={index}
            onClick={() => {
              window.open(record.ServerRedirectedEmbedUrl, "_blank");
            }}
            className={styles.colTable}
          >
            {this.getIcon(record.File?.Name) ? (
              <img
                className={styles.colTable__icon}
                src={this.getIcon(record.File?.Name)}
              />
            ) : (
              <Icon className={styles.colTable__icon} type="file" />
            )}

            <div className={styles.colTable__text}>
              {record.File?.Name ? record.File?.Name : record.Title}
            </div>
          </div>
        ),
      },

      {
        title: "Mã ĐNMS/ĐNTT/ĐNTƯ",
        dataIndex: "RequestCode",
        key: "RequestCode",
        width: 200,
        render: (text: string, record: ResultFile, index) =>
          record.RequestCode && (
            <Tag color={"#dc0d15"} key={index}>
              {record.RequestCode}
            </Tag>
          ),
      },
      {
        title: "Nhóm chứng từ",
        dataIndex: "NhomChungTuId",
        key: "NhomChungTuId",
        width: 200,
        render: (text: string, record: ResultFile, index) => (
          <p>{record.NhomChungTu?.NhomChungTu}</p>
        ),
      },
      {
        title: "Số chứng từ",
        dataIndex: "SoChungTu",
        key: "SoChungTu",
        width: 200,
        render: (text: string, record: ResultFile, index) =>
          record.SoChungTu && (
            <Tag color={"#dc0d15"} key={index}>
              {record.SoChungTu}
            </Tag>
          ),
      },
      {
        title: "Ngày chứng từ",
        dataIndex: "addNgayChungTuress",
        key: "NgayChungTu",
        width: 200,

        render: (text: string, record: ResultFile, index) => (
          <p>
            {record?.NgayChungTu
              ? moment(record?.NgayChungTu).format("DD/MM/YYYY")
              : ""}
          </p>
        ),
      },

      {
        title: "Số chứng từ kế toán",
        dataIndex: "SoChungTuKeToan",
        key: "SoChungTuKeToan",
        width: 200,

        render: (text: string, record: ResultFile, index) => (
          <p>{record.SoChungTuKeToan}</p>
        ),
      },
      {
        title: "Ngày chứng từ kế toán",
        dataIndex: "NgayChungTuKeToan",
        key: "NgayChungTuKeToan",
        width: 200,

        render: (text: string, record: ResultFile, index) => (
          <p>
            {record?.NgayChungTuKeToan
              ? moment(record?.NgayChungTuKeToan).format("DD/MM/YYYY")
              : ""}
          </p>
        ),
      },
      {
        title: "Chi Nhánh",
        dataIndex: "ChiNhanh",
        key: "ChiNhanhId",
        width: 200,

        render: (text: string, record: ResultFile, index) => (
          <p>{record.ChiNhanh?.TenChiNhanh}</p>
        ),
      },
      {
        title: "Bộ phận thực hiện",
        dataIndex: "BoPhanThucHien",
        key: "BoPhanThucHien",
        width: 200,

        render: (text: string, record: ResultFile, index) => (
          <p>
            {record.BoPhanThucHien?.Title ? record.BoPhanThucHien?.Title : ""}
          </p>
        ),
      },
      {
        title: "Dự án",
        dataIndex: "DuAn",
        key: "DuAnId",
        width: 200,

        render: (text: string, record: ResultFile, index) => (
          <p>{record.DuAn?.TenDuAn}</p>
        ),
      },
      {
        title: "Loại chứng từ KT",
        dataIndex: "LoaiChungTuKeToan",
        key: "LoaiChungTuKeToan",
        width: 200,

        render: (text: string, record: ResultFile, index) => (
          <p>{record?.LoaiChungTuKeToan?.TenLoaiChungTuKeToan}</p>
        ),
      },
    ];
    return columns;
  }

  public render(): React.ReactElement<ISearchDocumentsProps> {
    console.log(this.props.PageSize);
    return (
      <div
        className={styles.searchDocuments}
        id="searchDocuments"
        style={{ height: window.innerHeight - 270 }}
      >
        <FormSearch
          search={async (formvalues) => {
            await this.handelSearch(formvalues);
          }}
          context={this.props.context}
          wrappedComponentRef={this.formSearchRef}
        />

        <div
          className={styles.searchDocuments__results}
          style={{ width: this.state.withTable }}
        >
          {this.state.isLoadData ? (
            <>
              <Table
                pagination={{
                  pageSize: this.props.PageSize ? this.props.PageSize : 10,
                }}
                rowKey={"ID"}
                loading={this.state.loading}
                scroll={{ x: "max-content", y: window.innerHeight - 395 }}
                columns={this.getColumn()}
                dataSource={this.state.DataSource}
                onChange={(
                  pagination,
                  filters,
                  sorter,
                  extra: { currentDataSource: [] }
                ) => {
                  console.log(extra.currentDataSource.length);
                }}
              />
            </>
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {emptyIcon}
            </div>
          )}
        </div>
      </div>
    );
  }
}
