import * as React from "react";
import * as ReactDom from "react-dom";
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from "@microsoft/sp-property-pane";

import * as strings from "HomepageWebPartStrings";
import Homepage from "./components/Homepage";
import { IHomepageProps } from "./components/IHomepageProps";
import { sp } from "@pnp/sp";
import { SPComponentLoader } from "@microsoft/sp-loader";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import "jquery";
export interface IHomepageWebPartProps {
  description: string;
  wrapperClass: string;
}

export default class HomepageWebPart extends BaseClientSideWebPart<IHomepageWebPartProps> {
  public async onInit(): Promise<void> {
    super.onInit();
    sp.setup({
      spfxContext: this.context,
    });
    console.log(this.context);
    SPComponentLoader.loadCss(
      "https://cdnjs.cloudflare.com/ajax/libs/antd/3.26.19/antd.css"
    );
    SPComponentLoader.loadCss(
      `${this.context.pageContext.site.absoluteUrl}/apps/rfa/khoctkt/Shared%20Documents/hidenNavDefault.css`
    );
  }
  public render(): void {
    if (this.properties.wrapperClass) {
      console.log(this.properties.wrapperClass)
      $(`.${this.properties.wrapperClass}`).css("max-width", "100%");
    }
    const element: React.ReactElement<IHomepageProps> = React.createElement(
      Homepage,
      {
        description: this.properties.description,
        wrapperClass: this.properties.wrapperClass,
        context: this.context,
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription,
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField("description", {
                  label: strings.DescriptionFieldLabel,
                }),
                PropertyPaneTextField("wrapperClass", {
                  label: "Tên class bọc ngoài",
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
