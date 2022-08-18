import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import "jquery";
import {
  IPropertyPaneConfiguration,
  PropertyPaneHorizontalRule,
  PropertyPaneSlider,
  PropertyPaneTextField,
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";

import * as strings from "SearchDocumentsWebPartStrings";
import SearchDocuments from "./components/SearchDocuments";
import { ISearchDocumentsProps } from "./components/ISearchDocumentsProps";
import { sp } from "@pnp/sp";
import { SPComponentLoader } from "@microsoft/sp-loader";

export interface ISearchDocumentsWebPartProps {
  PageSize: number;
}

export default class SearchDocumentsWebPart extends BaseClientSideWebPart<ISearchDocumentsWebPartProps> {
  public async onInit(): Promise<void> {
    super.onInit();
    sp.setup({
      spfxContext: this.context,
    });
    SPComponentLoader.loadCss(
      "https://cdnjs.cloudflare.com/ajax/libs/antd/3.26.19/antd.css"
    );
    $('[data-sp-feature-tag="PageTitle"]').css("display", "none");
    SPComponentLoader.loadCss(
      `${this.context.pageContext.site.absoluteUrl}/apps/rfa/adms/Shared%20Documents/hidenNavDefault.css`
    );
    this.customCss();
    console.log(this.context);
  }

  public render(): void {
    setTimeout(() => {
      const element: React.ReactElement<ISearchDocumentsProps> =
        React.createElement(SearchDocuments, {
          PageSize: this.properties.PageSize,
          context: this.context,
        } as any);

      ReactDom.render(element, this.domElement);
    }, 500);
  }

  customCss() {
    $(".CanvasSection").parent().css("max-width", "100%");
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: "KHO CHỨNG TỪ KẾ TOÁN",
          },
          groups: [
            {
              groupName: "Thiết lập hiển thị",
              groupFields: [
                PropertyPaneSlider("PageSize", {
                  label: "Số item phân trang",
                  min: 2,
                  max: 20,
                  step: 1,
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
