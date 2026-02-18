(function () {
  class ColumnLayoutForm extends HTMLElement {
    constructor() {
      super();
      this._container = document.createElement("div");
      this.appendChild(this._container);
    }

    connectedCallback() {
      this._loadUI5().then(() => this._renderForm());
    }

    // --------------------------------------------------
    // Load SAP UI5 (only once)
    // --------------------------------------------------
    _loadUI5() {
      return new Promise((resolve) => {
        if (window.sap && sap.ui) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = "https://ui5.sap.com/resources/sap-ui-core.js";
        script.id = "sap-ui-bootstrap";
        script.setAttribute("data-sap-ui-theme", "sap_horizon");
        script.setAttribute("data-sap-ui-libs", "sap.m,sap.ui.layout");
        script.setAttribute("data-sap-ui-async", "true");

        script.onload = resolve;
        document.head.appendChild(script);
      });
    }

    // --------------------------------------------------
    // Create UI5 Form
    // --------------------------------------------------
    _renderForm() {
      const container = this._container;

      sap.ui.getCore().attachInit(function () {
        sap.ui.require(
          [
            "sap/ui/layout/form/SimpleForm",
            "sap/ui/layout/form/ColumnLayout",
            "sap/m/Input",
            "sap/m/Label",
            "sap/m/Page",
            "sap/m/App",
          ],
          function (SimpleForm, ColumnLayout, Input, Label, Page, App) {
            const form = new SimpleForm({
                editable: true,

                layout: "ColumnLayout",

                columnsM: 2,
                columnsL: 3,
                columnsXL: 4,

                content: [

                    new Label({ text: "Client Name" }),
                    new Input(),

                    new Label({ text: "Delivery Region" }),
                    new Input(),

                    new Label({ text: "Account Executive" }),
                    new Input(),

                    new Label({ text: "Vice President" }),
                    new Input()
                ]
            });

            const app = new App({
              pages: [
                new Page({
                  title: "Column Layout Form",
                  content: [form],
                }),
              ],
            });

            app.placeAt(container);
          },
        );
      });
    }
  }

  // register custom element (must match manifest tag)
  customElements.define(
    "com-sap-sidya-columnlayoutform-main",
    ColumnLayoutForm,
  );
})();
