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
        width: 42% !important;
        vertical-align: top !important;
        box-sizing: border-box !important;
        padding: 0 6px !important;
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
      .sapUiFormResGridEl > td:last-child {
        width: 100% !important;
      }
      .sapMHBox {
        display: flex !important;
        width: 100% !important;
        align-items: center !important;
        box-sizing: border-box !important;
        overflow: hidden !important;
      }
      .sapMHBox > .sapUiIcon {
        flex-shrink: 0 !important;
        margin-right: 8px !important;
        width: 16px !important;
      }
      .sapMHBox > .sapMInput,
      .sapMHBox > .sapMSelect,
      .sapMHBox > .sapMDatePicker {
        flex: 1 1 auto !important;
        width: 0 !important;
        min-width: 0 !important;
        max-width: 100% !important;
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
        "sap/m/HBox",
        "sap/ui/core/Icon",
        "sap/ui/core/Item"
      ], (Form, FormContainer, FormElement, ResponsiveGridLayout, Label, Input, Select, DatePicker, Button, Toolbar, ToolbarSpacer, HBox, Icon, Item) => {

        const autoFields = [
          "Customer", "Main Customer Country",
          "Customer State", "Customer City",
          "Project Stage", "Project Row Source", "Customer Row Source",
          "SOW Start Date", "SOW End Date", "SOW Nb Of Months",
          "Regional Lead", "SDM Prime", "VDI"
        ];

        const attachTruncationTooltips = () => {
          document.querySelectorAll(".sapMInputBaseInner").forEach(inputEl => {
            inputEl.removeEventListener("mouseenter", inputEl._tooltipHandler);
            inputEl._tooltipHandler = function () {
              this.title = this.scrollWidth > this.clientWidth ? this.value : "";
            };
            inputEl.addEventListener("mouseenter", inputEl._tooltipHandler);
          });

          document.querySelectorAll(".sapMSltLabel").forEach(el => {
            el.removeEventListener("mouseenter", el._tooltipHandler);
            el._tooltipHandler = function () {
              this.title = this.scrollWidth > this.clientWidth ? this.textContent.trim() : "";
            };
            el.addEventListener("mouseenter", el._tooltipHandler);
          });
        };

        const mkIcon = (labelText) => new Icon({
          src: autoFields.includes(labelText) ? "sap-icon://locked" : "sap-icon://edit",
          color: "#0070f2",
          size: "14px",
          tooltip: autoFields.includes(labelText) ? "Mapped from source system" : "Manually editable"
        });

        const mkHBox = (icon, control) => new HBox({
          renderType: "Bare",
          width: "100%",
          alignItems: "Center",
          items: [icon, control]
        });

        const mkSelect = (labelText, items, selectedKey) => mkHBox(
          mkIcon(labelText),
          new Select({
            width: "100%",
            selectedKey,
            items: items.map(([key, text]) => new Item({ key, text }))
          })
        );

        const mkInput = (labelText, value) => {
          const input = new Input({
            value: value || "",
            width: "100%",
            editable: !autoFields.includes(labelText)
          });
          if (value) input.setTooltip(value);
          input.attachChange((e) => input.setTooltip(e.getParameter("value")));
          return mkHBox(mkIcon(labelText), input);
        };

        const mkDate = (labelText, value, fmt) => {
          const dp = new DatePicker({
            value: value || "",
            valueFormat: "yyyy-MM-dd",
            displayFormat: fmt || "yyyy-MM-dd",
            width: "100%",
            editable: !autoFields.includes(labelText)
          });
          if (value) dp.setTooltip(value);
          return mkHBox(mkIcon(labelText), dp);
        };

        const oCol1 = new FormContainer({
          title: "General",
          formElements: [
            new FormElement({ label: new Label({ text: "Customer Delivery Region" }), fields: [mkSelect("Customer Delivery Region", [["canada","Canada"],["usa","USA"],["emea","EMEA"]], "canada")] }),
            new FormElement({ label: new Label({ text: "Churn Risk" }), fields: [mkSelect("Churn Risk", [["high","High"],["medium","Medium"],["low","Low"]], "high")] }),
            new FormElement({ label: new Label({ text: "Customer Time Zone" }), fields: [mkSelect("Customer Time Zone", [["eastern","Eastern"],["central","Central"],["pacific","Pacific"]], "eastern")] }),
            new FormElement({ label: new Label({ text: "Churn Risk Reason" }), fields: [mkInput("Churn Risk Reason")] }),
            new FormElement({ label: new Label({ text: "SAP System Level 1" }), fields: [mkSelect("SAP System Level 1", [["r3","R3 ECC On Premise"],["s4","S4 HANA"]], "r3")] }),
            new FormElement({ label: new Label({ text: "TMS Contract" }), fields: [mkSelect("TMS Contract", [["",""]], "")] }),
            new FormElement({ label: new Label({ text: "PCOE" }), fields: [mkSelect("PCOE", [["no","No"],["yes","Yes"]], "no")] }),
            new FormElement({ label: new Label({ text: "Ebonding" }), fields: [mkSelect("Ebonding", [["no","No"],["yes","Yes"]], "no")] }),
            new FormElement({ label: new Label({ text: "Billing Method Be" }), fields: [mkSelect("Billing Method Be", [["",""]], "")] }),
            new FormElement({ label: new Label({ text: "Status" }), fields: [mkSelect("Status", [["active","Active"],["inactive","Inactive"]], "active")] }),
            new FormElement({ label: new Label({ text: "Customer Classification" }), fields: [mkSelect("Customer Classification", [["a","A"],["b","B"],["c","C"]], "b")] }),
            new FormElement({ label: new Label({ text: "Exception Priority 1" }), fields: [mkSelect("Exception Priority 1", [["no","No"],["yes","Yes"]], "no")] }),
            new FormElement({ label: new Label({ text: "Using Customer ITSM" }), fields: [mkSelect("Using Customer ITSM", [["no","No"],["yes","Yes"]], "no")] }),
            new FormElement({ label: new Label({ text: "AI AGENT" }), fields: [mkSelect("AI AGENT", [["",""]], "")] }),
          ]
        });

        const oCol2 = new FormContainer({
          title: "Customer Details",
          formElements: [
            new FormElement({ label: new Label({ text: "Industry" }), fields: [mkInput("Industry", "Public Sector")] }),
            new FormElement({ label: new Label({ text: "Customer" }), fields: [mkInput("Customer", "Authority/L5R 3L5")] }),
            new FormElement({ label: new Label({ text: "Main Customer Country" }), fields: [mkInput("Main Customer Country", "Canada")] }),
            new FormElement({ label: new Label({ text: "Customer State" }), fields: [mkInput("Customer State", "ON")] }),
            new FormElement({ label: new Label({ text: "Customer City" }), fields: [mkInput("Customer City", "Mississauga")] }),
            new FormElement({ label: new Label({ text: "SDM Counterpart" }), fields: [mkInput("SDM Counterpart", "Rich Poweska")] }),
            new FormElement({ label: new Label({ text: "SDM Counterpart Email" }), fields: [mkInput("SDM Counterpart Email", "Rich.Poweska@electrical")] }),
            new FormElement({ label: new Label({ text: "IT Leaders" }), fields: [mkInput("IT Leaders", "Kelley Irwin")] }),
            new FormElement({ label: new Label({ text: "IT Leaders Email" }), fields: [mkInput("IT Leaders Email", "Kelley.irwin@electricalsa")] }),
            new FormElement({ label: new Label({ text: "SOW Approver Email" }), fields: [mkInput("SOW Approver Email", "Brian.Wu@electricalsafet")] }),
            new FormElement({ label: new Label({ text: "SOW Approver" }), fields: [mkInput("SOW Approver", "Brian Wu")] }),
            new FormElement({ label: new Label({ text: "Account Manager" }), fields: [mkInput("Account Manager")] }),
            new FormElement({ label: new Label({ text: "SDM Secondary" }), fields: [mkInput("SDM Secondary")] }),
            new FormElement({ label: new Label({ text: "VP" }), fields: [mkInput("VP")] }),
          ]
        });

        const oCol3 = new FormContainer({
          title: "SOW & Project",
          formElements: [
            new FormElement({ label: new Label({ text: "VDI" }), fields: [mkInput("VDI")] }),
            new FormElement({ label: new Label({ text: "SDM Prime" }), fields: [mkInput("SDM Prime", "Pedro Almeida")] }),
            new FormElement({ label: new Label({ text: "Regional Lead" }), fields: [mkInput("Regional Lead", "Marie-Noelle House")] }),
            new FormElement({ label: new Label({ text: "SOW Start Date" }), fields: [mkDate("SOW Start Date", "2025-01-01")] }),
            new FormElement({ label: new Label({ text: "SOW End Date" }), fields: [mkDate("SOW End Date", "2030-01-01")] }),
            new FormElement({ label: new Label({ text: "SOW Nb Of Months" }), fields: [mkInput("SOW Nb Of Months", "60")] }),
            new FormElement({ label: new Label({ text: "SOW Ren. Signed Date" }), fields: [mkDate("SOW Ren. Signed Date")] }),
            new FormElement({ label: new Label({ text: "Syntax Customer Since" }), fields: [mkDate("Syntax Customer Since", "1969-12-31", "MMM dd, yyyy")] }),
            new FormElement({ label: new Label({ text: "Project Stage" }), fields: [mkInput("Project Stage", "In Execution")] }),
            new FormElement({ label: new Label({ text: "Project Row Source" }), fields: [mkInput("Project Row Source", "S4")] }),
            new FormElement({ label: new Label({ text: "Customer Row Source" }), fields: [mkInput("Customer Row Source", "S4")] }),
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
            new Button({
              text: "Save",
              type: "Emphasized",
              press: () => console.log("Save clicked")
            }),
            new Button({
              text: "Cancel",
              press: () => console.log("Cancel clicked")
            })
          ]
        });

        oForm.placeAt(container.id);
        oToolbar.placeAt(container.id);

        setTimeout(attachTruncationTooltips, 500);
      });
    });
  }
}

customElements.define("com-sidya-fioriform", SyntaxFioriForm);