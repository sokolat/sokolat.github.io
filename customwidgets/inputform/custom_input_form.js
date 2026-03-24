class SyntaxFioriForm extends HTMLElement {
  connectedCallback() {
    // Create container
    const container = document.createElement("div");
    container.id = "fiori-form-" + Math.random().toString(36).substr(2, 9);
    this.appendChild(container);

    // Reuse SAC's existing UI5 instance — no bootstrap needed
    sap.ui.require([
      "sap/ui/layout/form/SimpleForm",
      "sap/m/Label",
      "sap/m/Input",
      "sap/m/Button"
    ], (SimpleForm, Label, Input, Button) => {

      const oForm = new SimpleForm({
        editable: true,
        layout: "ResponsiveGridLayout",
        content: [
          new Label({ text: "Customer Delivery Region" }),
          new Input({ value: "Canada" }),

          new Label({ text: "Churn Risk" }),
          new Input({ value: "High" }),

          // ... your fields
        ]
      });

      oForm.placeAt(container.id);
    });
  }
}

customElements.define("com-sap-sidya-fioriform", SyntaxFioriForm);