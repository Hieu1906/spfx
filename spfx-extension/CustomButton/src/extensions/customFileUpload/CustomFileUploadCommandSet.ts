import { override } from "@microsoft/decorators";
import { Guid, Log } from "@microsoft/sp-core-library";
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters,
} from "@microsoft/sp-listview-extensibility";
import { Dialog } from "@microsoft/sp-dialog";
import * as ReactDom from "react-dom";
import ModalUploadFile from "./components/ModalUpload";
import * as React from "react";
import { sp } from "@pnp/sp";
import {
  FormValue,
  ICustomFileUploadCommandSetProperties,
  ICustomPanelProps,
  SPField,
} from "./interface";
import * as moment from "moment";

const LOG_SOURCE: string = "CustomFileUploadCommandSet";

export default class CustomFileUploadCommandSet extends BaseListViewCommandSet<ICustomFileUploadCommandSetProperties> {
  private panelDomElement: HTMLDivElement;
  @override
  public onInit(): Promise<void> {
    console.log("init extension")
    sp.setup({
      spfxContext: this.context,
    });
    Log.info(LOG_SOURCE, "Initialized CustomFileUploadCommandSet");
    this.panelDomElement = document.body.appendChild(
      document.createElement("div")
    );

    return Promise.resolve();
  }

  @override
  public onListViewUpdated(
    event: IListViewCommandSetListViewUpdatedParameters
  ): void {
    const compareOneCommand: Command = this.tryGetCommand("COMMAND_1");
    const uploadFile: Command = this.tryGetCommand("COMMAND_2");
    if (compareOneCommand) {
      // This command should be hidden unless exactly one row is selected.
      compareOneCommand.visible = event.selectedRows.length === 1;
    }
    if (uploadFile) {
      // This command should be hidden unless exactly one row is selected.
      uploadFile.visible = this.checkVisible();
    }
  }

  checkVisible() {
    return (
      this.context.pageContext.list.title.toLocaleLowerCase() ==
      "chứng từ lưu tạm"
    );
  }
  _getformValuesFromFile(event: IListViewCommandSetExecuteEventParameters) {
    let formValues: FormValue = {} as any;
    let fieldsValue = event.selectedRows[0].fields;

    fieldsValue.map((item: SPField) => {
      if (item.fieldType == "Lookup") {
        let originValue = event.selectedRows[0].getValueByName(
          item.internalName
        );
        if (originValue?.length > 0) {
          formValues[`${item.internalName}Id`] = originValue[0]["lookupId"];
        }
      } else if (item.fieldType == "DateTime") {
        let originValue = event.selectedRows[0].getValueByName(
          item.internalName
        );

        if (originValue?.length > 0) {
          formValues[`${item.internalName}`] = moment(originValue[0]);
        }
      } else {
        formValues[`${item.internalName}`] =
          event.selectedRows[0].getValueByName(item.internalName);
      }
    });

    formValues.FileRef = event.selectedRows[0].getValueByName("FileRef");
    formValues.UniqueId= event.selectedRows[0].getValueByName("UniqueId");

    return formValues;
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.itemId) {
      case "COMMAND_1":
        console.log(event);
        let formValues = this._getformValuesFromFile(event);
        this._showPanel(formValues);
        console.log(formValues);
        break;
      case "COMMAND_2":
        this._showPanel();
        break;
      default:
        throw new Error("Unknown command");
    }
  }
  private _showPanel(formValues?: FormValue) {
    this._renderPanelComponent({
      isOpen: true,
      formValues,
      listId: this.context.pageContext.list.id.toString(),
      onClose: async () => {
        this._dismissPanel();
      },
    });
  }

  private _dismissPanel() {
    this._renderPanelComponent({
      isOpen: false,
    });
  }

  private _renderPanelComponent(props: any) {
    const element: React.ReactElement<ICustomPanelProps> = React.createElement(
      ModalUploadFile,
      {
        onClose: props.onClose && props.onClose,
        formValues: props.formValues,
        isOpen: props.isOpen,
        listId: props.props,
        context: this.context,
        raiseOnChange: this.raiseOnChange,
      }
    );
    ReactDom.render(element, this.panelDomElement);
  }
}
