class SyntaxFioriForm extends HTMLElement {
  connectedCallback() {
    this.style.display = "block";
    this.style.height = "100%";
    this.style.overflowY = "auto";

    const container = document.createElement("div");
    container.id = "fiori-form-" + Math.random().toString(36).substr(2, 9);
    this.appendChild(container);

    const cssFiles = [
      "https://ui5.sap.com/1.120.0/resources/sap/ui/core/themes/sap_horizon/library.css",
      "https://ui5.sap.com/1.120.0/resources/sap/m/themes/sap_horizon/library.css",
      "https://ui5.sap.com/1.120.0/resources/sap/ui/layout/themes/sap_horizon/library.css"
    ];

    cssFiles.forEach(href => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      this.appendChild(link);
    });

    const style = document.createElement("style");
    style.textContent = `
      .sapUiFormResGridCont {
        display: inline-block !important;
        width: 32% !important;
        vertical-align: top !important;
        box-sizing: border-box !important;
        padding: 0 12px !important;
      }
      .sapUiFormResGridMainCont {
        width: 100% !important;
        display: block !important;
      }
      .sapUiFormElementLbl {
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }
      /* Use 90% width so inputs fit inside their column */
      .sapMInput, .sapMSelect, .sapMInputBase, .sapUiDPInn, .sapMDatePicker {
        width: 90% !important;
        max-width: 90% !important;
        min-width: unset !important;
        box-sizing: border-box !important;
      }
    `;
    this.appendChild(style);

    sap.ui.getCore().loadLibrary("sap.ui.layout", { async: true }).then(() => {
      sap.ui.require([
        "sap/ui/layout/form/Form",
        "sap/ui/layout/form/FormContainer",
        "sap/ui/layout/form/FormElement",
        "sap/ui/layout/form/ResponsiveGridLayout",
        "sap/m/Label",
        "sap/m/Input",
        "sap/m/Select",
        "sap/m/DatePicker",
        "sap/m/Button",
        "sap/m/Toolbar",
        "sap/m/ToolbarSpacer",
        "sap/ui/core/Item"
      ], (Form, FormContainer, FormElement, ResponsiveGridLayout, Label, Input, Select, DatePicker, Button, Toolbar, ToolbarSpacer, Item) => {

        const mkSelect = (items, selectedKey) => new Select({
          width: "90%",
          selectedKey,
          items: items.map(([key, text]) => new Item({ key, text }))
        });

        const mkInput = (value) => new Input({
          value: value || "",
          width: "90%"
        });

        const mkDate = (value, fmt) => new DatePicker({
          value: value || "",
          valueFormat: "yyyy-MM-dd",
          displayFormat: fmt || "yyyy-MM-dd",
          width: "90%"
        });

        const oCol1 = new FormContainer({
          title: "General",
          formElements: [
            new FormElement({ label: new Label({ text: "Customer Delivery Region" }), fields: [mkSelect([["canada","Canada"],["usa","USA"],["emea","EMEA"]], "canada")] }),
            new FormElement({ label: new Label({ text: "Churn Risk" }), fields: [mkSelect([["high","High"],["medium","Medium"],["low","Low"]], "high")] }),
            new FormElement({ label: new Label({ text: "Customer Time Zone" }), fields: [mkSelect([["eastern","Eastern"],["central","Central"],["pacific","Pacific"]], "eastern")] }),
            new FormElement({ label: new Label({ text: "Churn Risk Reason" }), fields: [mkInput()] }),
            new FormElement({ label: new Label({ text: "SAP System Level 1" }), fields: [mkSelect([["r3","R3 ECC On Premise"],["s4","S4 HANA"]], "r3")] }),
            new FormElement({ label: new Label({ text: "TMS Contract" }), fields: [mkSelect([["",""]], "")] }),
            new FormElement({ label: new Label({ text: "PCOE" }), fields: [mkSelect([["no","No"],["yes","Yes"]], "no")] }),
            new FormElement({ label: new Label({ text: "Ebonding" }), fields: [mkSelect([["no","No"],["yes","Yes"]], "no")] }),
            new FormElement({ label: new Label({ text: "Billing Method Be" }), fields: [mkSelect([["",""]], "")] }),
            new FormElement({ label: new Label({ text: "Status" }), fields: [mkSelect([["active","Active"],["inactive","Inactive"]], "active")] }),
            new FormElement({ label: new Label({ text: "Customer Classification" }), fields: [mkSelect([["a","A"],["b","B"],["c","C"]], "b")] }),
            new FormElement({ label: new Label({ text: "Exception Priority 1" }), fields: [mkSelect([["no","No"],["yes","Yes"]], "no")] }),
            new FormElement({ label: new Label({ text: "Using Customer ITSM" }), fields: [mkSelect([["no","No"],["yes","Yes"]], "no")] }),
            new FormElement({ label: new Label({ text: "AI AGENT" }), fields: [mkSelect([["",""]], "")] }),
          ]
        });

        const oCol2 = new FormContainer({
          title: "Customer Details",
          formElements: [
            new FormElement({ label: new Label({ text: "Industry" }), fields: [mkInput("Public Sector")] }),
            new FormElement({ label: new Label({ text: "Customer" }), fields: [mkInput("Authority/L5R 3L5")] }),
            new FormElement({ label: new Label({ text: "Main Customer Country" }), fields: [mkInput("Canada")] }),
            new FormElement({ label: new Label({ text: "Customer State" }), fields: [mkInput("ON")] }),
            new FormElement({ label: new Label({ text: "Customer City" }), fields: [mkInput("Mississauga")] }),
            new FormElement({ label: new Label({ text: "SDM Counterpart" }), fields: [mkInput("Rich Poweska")] }),
            new FormElement({ label: new Label({ text: "SDM Counterpart Email" }), fields: [mkInput("Rich.Poweska@electrical")] }),
            new FormElement({ label: new Label({ text: "IT Leaders" }), fields: [mkInput("Kelley Irwin")] }),
            new FormElement({ label: new Label({ text: "IT Leaders Email" }), fields: [mkInput("Kelley.irwin@electricalsa")] }),
            new FormElement({ label: new Label({ text: "SOW Approver Email" }), fields: [mkInput("Brian.Wu@electricalsafet")] }),
            new FormElement({ label: new Label({ text: "SOW Approver" }), fields: [mkInput("Brian Wu")] }),
            new FormElement({ label: new Label({ text: "Account Manager" }), fields: [mkInput()] }),
            new FormElement({ label: new Label({ text: "SDM Secondary" }), fields: [mkInput()] }),
            new FormElement({ label: new Label({ text: "VP" }), fields: [mkInput()] }),
          ]
        });

        const oCol3 = new FormContainer({
          title: "SOW & Project",
          formElements: [
            new FormElement({ label: new Label({ text: "VDI" }), fields: [mkInput()] }),
            new FormElement({ label: new Label({ text: "SDM Prime" }), fields: [mkInput("Pedro Almeida")] }),
            new FormElement({ label: new Label({ text: "Regional Lead" }), fields: [mkInput("Marie-Noelle House")] }),
            new FormElement({ label: new Label({ text: "SOW Start Date" }), fields: [mkDate("2025-01-01")] }),
            new FormElement({ label: new Label({ text: "SOW End Date" }), fields: [mkDate("2030-01-01")] }),
            new FormElement({ label: new Label({ text: "SOW Nb Of Months" }), fields: [mkInput("60")] }),
            new FormElement({ label: new Label({ text: "SOW Ren. Signed Date" }), fields: [new DatePicker({ placeholder: "e.g. 12/31/26", width: "90%" })] }),
            new FormElement({ label: new Label({ text: "Syntax Customer Since" }), fields: [mkDate("1969-12-31", "MMM dd, yyyy")] }),
            new FormElement({ label: new Label({ text: "Project Stage" }), fields: [mkInput("In Execution")] }),
            new FormElement({ label: new Label({ text: "Project Row Source" }), fields: [mkInput("S4")] }),
            new FormElement({ label: new Label({ text: "Customer Row Source" }), fields: [mkInput("S4")] }),
          ]
        });

        const oForm = new Form({
          editable: true,
          layout: new ResponsiveGridLayout({
            labelSpanL: 12,
            labelSpanM: 12,
            emptySpanL: 0,
            emptySpanM: 0,
            columnsL: 3,
            columnsM: 2,
            singleContainerFullSize: false
          }),
          formContainers: [oCol1, oCol2, oCol3]
        });

        const oToolbar = new Toolbar({
          content: [
            new ToolbarSpacer(),
            new Button({ text: "Save", type: "Emphasized", press: () => console.log("Save") }),
            new Button({ text: "Cancel", press: () => console.log("Cancel") })
          ]
        });

        oForm.placeAt(container.id);
        oToolbar.placeAt(container.id);
      });
    });
  }
}

customElements.define("com-sidya-fioriform", SyntaxFioriForm);