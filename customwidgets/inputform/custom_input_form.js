class SyntaxFioriForm extends HTMLElement {
  connectedCallback() {
    const container = document.createElement("div");
    container.id = "fiori-form-" + Math.random().toString(36).substr(2, 9);
    this.appendChild(container);

    // Inject Horizon CSS scoped only to this widget
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://ui5.sap.com/1.120.0/resources/sap/m/themes/sap_horizon/library.css";
    this.appendChild(link);

    const linkLayout = document.createElement("link");
    linkLayout.rel = "stylesheet";
    linkLayout.href = "https://ui5.sap.com/1.120.0/resources/sap/ui/layout/themes/sap_horizon/library.css";
    this.appendChild(linkLayout);

    const linkCore = document.createElement("link");
    linkCore.rel = "stylesheet";
    linkCore.href = "https://ui5.sap.com/1.120.0/resources/sap/ui/core/themes/sap_horizon/library.css";
    this.appendChild(linkCore);

    sap.ui.getCore().loadLibrary("sap.ui.layout", { async: true }).then(() => {
      sap.ui.require([
        "sap/ui/layout/form/SimpleForm",
        "sap/ui/layout/form/ResponsiveGridLayout",
        "sap/m/Label",
        "sap/m/Input",
        "sap/m/Button"
      ], (SimpleForm, ResponsiveGridLayout, Label, Input, Button) => {

        const oForm = new SimpleForm({
          editable: true,
          layout: "ResponsiveGridLayout",
          content: [
            new Label({ text: "Customer Delivery Region" }),
            new Input({ value: "Canada" }),

            new Label({ text: "Churn Risk" }),
            new Input({ value: "High" }),
          ]
        });

        oForm.placeAt(container.id);
      });
    });
  }
}

customElements.define("com-sidya-fioriform", SyntaxFioriForm);