import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';
import { sp } from "@pnp/sp";
import * as strings from 'DocumentAndSiteWebPartStrings';
import DocumentAndSite from './components/DocumentAndSite';
import { IDocumentAndSiteProps } from './components/IDocumentAndSiteProps';
import { SPComponentLoader } from '@microsoft/sp-loader';

export interface IDocumentAndSiteWebPartProps {
  description: string;
}

export default class DocumentAndSiteWebPart extends BaseClientSideWebPart<IDocumentAndSiteWebPartProps> {
  public async onInit(): Promise<void> {
    super.onInit();
    sp.setup({
      spfxContext: this.context,
    });
    SPComponentLoader.loadCss(
      "https://cdnjs.cloudflare.com/ajax/libs/antd/3.26.19/antd.css"
    );
    console.log(this.context);

 
  }
  public render(): void {
    const element: React.ReactElement<IDocumentAndSiteProps > = React.createElement(
      DocumentAndSite,
      {
        description: this.properties.description,
        context:this.context
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
