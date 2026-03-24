class SyntaxFioriForm extends HTMLElement {
  connectedCallback() {
    const container = document.createElement("div");
    container.id = "fiori-form-" + Math.random().toString(36).substr(2, 9);
    this.appendChild(container);

    sap.ui.getCore().loadLibrary("sap.ui.layout", { async: true }).then(() => {

      // Auto-detect SAC's current theme and apply it
      const currentTheme = sap.ui.getCore().getConfiguration().getTheme();
      sap.ui.getCore().applyTheme(currentTheme);

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