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

        // --- Store control references for setData ---
        const controls = {};

        const mkSelectRef = (key, labelText, items, selectedKey) => {
          const hbox = mkSelect(labelText, items, selectedKey);
          controls[key] = hbox.getItems()[1]; // Select is second item after icon
          return hbox;
        };

        const mkInputRef = (key, labelText, value) => {
          const hbox = mkInput(labelText, value);
          controls[key] = hbox.getItems()[1]; // Input is second item after icon
          return hbox;
        };

        const mkDateRef = (key, labelText, value, fmt) => {
          const hbox = mkDate(labelText, value, fmt);
          controls[key] = hbox.getItems()[1]; // DatePicker is second item after icon
          return hbox;
        };

        const oCol1 = new FormContainer({
          title: "General",
          formElements: [
            new FormElement({ label: new Label({ text: "Customer Delivery Region" }), fields: [mkSelectRef("customerDeliveryRegion", "Customer Delivery Region", [["canada","Canada"],["usa","USA"],["emea","EMEA"]], "canada")] }),
            new FormElement({ label: new Label({ text: "Churn Risk" }), fields: [mkSelectRef("churnRisk", "Churn Risk", [["high","High"],["medium","Medium"],["low","Low"]], "high")] }),
            new FormElement({ label: new Label({ text: "Customer Time Zone" }), fields: [mkInputRef("customerTimeZone", "Customer Time Zone", "")] }),
            new FormElement({ label: new Label({ text: "Churn Risk Reason" }), fields: [mkInputRef("churnRiskReason", "Churn Risk Reason", "")] }),
            new FormElement({ label: new Label({ text: "SAP System Level 1" }), fields: [mkSelectRef("sapSystemLevel1", "SAP System Level 1", [["r3","R3 ECC On Premise"],["s4","S4 HANA"]], "r3")] }),
            new FormElement({ label: new Label({ text: "TMS Contract" }), fields: [mkSelectRef("tmsContract", "TMS Contract", [["",""]], "")] }),
            new FormElement({ label: new Label({ text: "PCOE" }), fields: [mkSelectRef("pcoe", "PCOE", [["no","No"],["yes","Yes"]], "no")] }),
            new FormElement({ label: new Label({ text: "Ebonding" }), fields: [mkSelectRef("ebonding", "Ebonding", [["no","No"],["yes","Yes"]], "no")] }),
            new FormElement({ label: new Label({ text: "Billing Method Be" }), fields: [mkSelectRef("billingMethod", "Billing Method Be", [["",""]], "")] }),
            new FormElement({ label: new Label({ text: "Status" }), fields: [mkSelectRef("status", "Status", [["active","Active"],["inactive","Inactive"]], "active")] }),
            new FormElement({ label: new Label({ text: "Customer Classification" }), fields: [mkSelectRef("customerClassification", "Customer Classification", [["a","A"],["b","B"],["c","C"]], "b")] }),
            new FormElement({ label: new Label({ text: "Exception Priority 1" }), fields: [mkSelectRef("exceptionPriority1", "Exception Priority 1", [["no","No"],["yes","Yes"]], "no")] }),
            new FormElement({ label: new Label({ text: "Using Customer ITSM" }), fields: [mkSelectRef("usingCustomerITSM", "Using Customer ITSM", [["no","No"],["yes","Yes"]], "no")] }),
            new FormElement({ label: new Label({ text: "AI AGENT" }), fields: [mkSelectRef("aiAgent", "AI AGENT", [["",""]], "")] }),
          ]
        });

        const oCol2 = new FormContainer({
          title: "Customer Details",
          formElements: [
            new FormElement({ label: new Label({ text: "Industry" }), fields: [mkInputRef("industry", "Industry", "")] }),
            new FormElement({ label: new Label({ text: "Customer" }), fields: [mkInputRef("customer", "Customer", "")] }),
            new FormElement({ label: new Label({ text: "Main Customer Country" }), fields: [mkInputRef("mainCustomerCountry", "Main Customer Country", "")] }),
            new FormElement({ label: new Label({ text: "Customer State" }), fields: [mkInputRef("customerState", "Customer State", "")] }),
            new FormElement({ label: new Label({ text: "Customer City" }), fields: [mkInputRef("customerCity", "Customer City", "")] }),
            new FormElement({ label: new Label({ text: "SDM Counterpart" }), fields: [mkInputRef("sdmCounterpart", "SDM Counterpart", "")] }),
            new FormElement({ label: new Label({ text: "SDM Counterpart Email" }), fields: [mkInputRef("sdmCounterpartEmail", "SDM Counterpart Email", "")] }),
            new FormElement({ label: new Label({ text: "IT Leaders" }), fields: [mkInputRef("itLeaders", "IT Leaders", "")] }),
            new FormElement({ label: new Label({ text: "IT Leaders Email" }), fields: [mkInputRef("itLeadersEmail", "IT Leaders Email", "")] }),
            new FormElement({ label: new Label({ text: "SOW Approver Email" }), fields: [mkInputRef("sowApproverEmail", "SOW Approver Email", "")] }),
            new FormElement({ label: new Label({ text: "SOW Approver" }), fields: [mkInputRef("sowApprover", "SOW Approver", "")] }),
            new FormElement({ label: new Label({ text: "Account Manager" }), fields: [mkInputRef("accountManager", "Account Manager", "")] }),
            new FormElement({ label: new Label({ text: "SDM Secondary" }), fields: [mkInputRef("sdmSecondary", "SDM Secondary", "")] }),
            new FormElement({ label: new Label({ text: "VP" }), fields: [mkInputRef("vp", "VP", "")] }),
          ]
        });

        const oCol3 = new FormContainer({
          title: "SOW & Project",
          formElements: [
            new FormElement({ label: new Label({ text: "VDI" }), fields: [mkInputRef("vdi", "VDI", "")] }),
            new FormElement({ label: new Label({ text: "SDM Prime" }), fields: [mkInputRef("sdmPrime", "SDM Prime", "")] }),
            new FormElement({ label: new Label({ text: "Regional Lead" }), fields: [mkInputRef("regionalLead", "Regional Lead", "")] }),
            new FormElement({ label: new Label({ text: "SOW Start Date" }), fields: [mkDateRef("sowStartDate", "SOW Start Date", "")] }),
            new FormElement({ label: new Label({ text: "SOW End Date" }), fields: [mkDateRef("sowEndDate", "SOW End Date", "")] }),
            new FormElement({ label: new Label({ text: "SOW Nb Of Months" }), fields: [mkInputRef("sowNbMonths", "SOW Nb Of Months", "")] }),
            new FormElement({ label: new Label({ text: "SOW Ren. Signed Date" }), fields: [mkDateRef("sowRenSignedDate", "SOW Ren. Signed Date", "")] }),
            new FormElement({ label: new Label({ text: "Syntax Customer Since" }), fields: [mkDateRef("syntaxCustomerSince", "Syntax Customer Since", "", "MMM dd, yyyy")] }),
            new FormElement({ label: new Label({ text: "Project Stage" }), fields: [mkInputRef("projectStage", "Project Stage", "")] }),
            new FormElement({ label: new Label({ text: "Project Row Source" }), fields: [mkInputRef("projectRowSource", "Project Row Source", "")] }),
            new FormElement({ label: new Label({ text: "Customer Row Source" }), fields: [mkInputRef("customerRowSource", "Customer Row Source", "")] }),
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

        // --- Expose setData method for SAC scripts ---
        this.setData = (data) => {
          const set = (key, value) => {
            if (!controls[key] || value === undefined || value === null) return;
            const ctrl = controls[key];
            if (typeof ctrl.setSelectedKey === "function") {
              ctrl.setSelectedKey(value);
            } else if (typeof ctrl.setValue === "function") {
              ctrl.setValue(value);
              ctrl.setTooltip(value);
            }
          };

          // General
          set("customerDeliveryRegion", data.customerDeliveryRegion);
          set("churnRisk",              data.churnRisk);
          set("customerTimeZone",       data.customerTimeZone);
          set("churnRiskReason",        data.churnRiskReason);
          set("sapSystemLevel1",        data.sapSystemLevel1);
          set("tmsContract",            data.tmsContract);
          set("pcoe",                   data.pcoe);
          set("ebonding",               data.ebonding);
          set("billingMethod",          data.billingMethod);
          set("status",                 data.status);
          set("customerClassification", data.customerClassification);
          set("exceptionPriority1",     data.exceptionPriority1);
          set("usingCustomerITSM",      data.usingCustomerITSM);
          set("aiAgent",                data.aiAgent);

          // Customer Details
          set("industry",              data.industry);
          set("customer",              data.customer);
          set("mainCustomerCountry",   data.mainCustomerCountry);
          set("customerState",         data.customerState);
          set("customerCity",          data.customerCity);
          set("sdmCounterpart",        data.sdmCounterpart);
          set("sdmCounterpartEmail",   data.sdmCounterpartEmail);
          set("itLeaders",             data.itLeaders);
          set("itLeadersEmail",        data.itLeadersEmail);
          set("sowApproverEmail",      data.sowApproverEmail);
          set("sowApprover",           data.sowApprover);
          set("accountManager",        data.accountManager);
          set("sdmSecondary",          data.sdmSecondary);
          set("vp",                    data.vp);

          // SOW & Project
          set("vdi",                   data.vdi);
          set("sdmPrime",              data.sdmPrime);
          set("regionalLead",          data.regionalLead);
          set("sowStartDate",          data.sowStartDate);
          set("sowEndDate",            data.sowEndDate);
          set("sowNbMonths",           data.sowNbMonths);
          set("sowRenSignedDate",      data.sowRenSignedDate);
          set("syntaxCustomerSince",   data.syntaxCustomerSince);
          set("projectStage",          data.projectStage);
          set("projectRowSource",      data.projectRowSource);
          set("customerRowSource",     data.customerRowSource);

          setTimeout(attachTruncationTooltips, 300);
        };
      });
    });
  }
}

customElements.define("com-sidya-fioriform", SyntaxFioriForm);