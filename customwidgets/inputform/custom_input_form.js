class SyntaxFioriForm extends HTMLElement {
  connectedCallback() {
    // 1. Create a div for UI5 to render into
    this.innerHTML = `
      <div id="ui5-container"></div>
      <script id="sap-ui-bootstrap"
        src="https://ui5.sap.com/1.120.0/resources/sap-ui-core.js"
        data-sap-ui-libs="sap.ui.layout, sap.m"
        data-sap-ui-theme="sap_horizon"
        data-sap-ui-compatVersion="edge"
        data-sap-ui-async="true">
      </script>
    `;

    // 2. Wait for UI5 to boot then render the form
    sap.ui.getCore().attachInit(() => {
      sap.ui.require([
        "sap/ui/layout/form/SimpleForm",
        "sap/m/Label",
        "sap/m/Input",
        "sap/m/Select",
        "sap/m/Button"
      ], (SimpleForm, Label, Input, Select, Button) => {

        const oForm = new SimpleForm({
          editable: true,
          layout: "ResponsiveGridLayout",
          content: [
            new Label({ text: "Customer Delivery Region" }),
            new Input({ value: "Canada" }),

            new Label({ text: "Churn Risk" }),
            new Select({}),

            new Label({ text: "SDM Prime" }),
            new Input({ value: "Pedro Almeida" }),

            // ... rest of your fields
          ]
        });

        oForm.placeAt("ui5-container");
      });
    });
  }
}

customElements.define("com-syntax-fioriform", SyntaxFioriForm);