class SyntaxFioriForm extends HTMLElement {
  connectedCallback() {
    const container = document.createElement("div");
    container.id = "fiori-form-" + Math.random().toString(36).substr(2, 9);
    this.appendChild(container);

    // Inject Horizon CSS
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

    sap.ui.getCore().loadLibrary("sap.ui.layout", { async: true }).then(() => {
      sap.ui.require([
        "sap/ui/layout/form/SimpleForm",
        "sap/ui/layout/form/ResponsiveGridLayout",
        "sap/m/Label",
        "sap/m/Input",
        "sap/m/Select",
        "sap/m/ComboBox",
        "sap/m/DatePicker",
        "sap/m/Button",
        "sap/m/Toolbar",
        "sap/m/ToolbarSpacer",
        "sap/m/Title",
        "sap/ui/core/Item"
      ], (SimpleForm, ResponsiveGridLayout, Label, Input, Select, ComboBox, DatePicker, Button, Toolbar, ToolbarSpacer, Title, Item) => {

        // --- Column 1: General Info ---
        const oDeliveryRegion = new Select({
          items: [
            new Item({ key: "canada", text: "Canada" }),
            new Item({ key: "usa", text: "USA" }),
            new Item({ key: "emea", text: "EMEA" })
          ],
          selectedKey: "canada"
        });

        const oChurnRisk = new Select({
          items: [
            new Item({ key: "high", text: "High" }),
            new Item({ key: "medium", text: "Medium" }),
            new Item({ key: "low", text: "Low" })
          ],
          selectedKey: "high"
        });

        const oTimeZone = new Select({
          items: [
            new Item({ key: "eastern", text: "Eastern" }),
            new Item({ key: "central", text: "Central" }),
            new Item({ key: "pacific", text: "Pacific" })
          ],
          selectedKey: "eastern"
        });

        const oChurnRiskReason = new Input({ placeholder: "" });

        const oSAPSystemLevel = new Select({
          items: [
            new Item({ key: "r3", text: "R3 ECC On Premise" }),
            new Item({ key: "s4", text: "S4 HANA" })
          ],
          selectedKey: "r3"
        });

        const oTMSContract = new Select({
          items: [
            new Item({ key: "", text: "" })
          ]
        });

        const oPCOE = new Select({
          items: [
            new Item({ key: "no", text: "No" }),
            new Item({ key: "yes", text: "Yes" })
          ],
          selectedKey: "no"
        });

        const oEbonding = new Select({
          items: [
            new Item({ key: "no", text: "No" }),
            new Item({ key: "yes", text: "Yes" })
          ],
          selectedKey: "no"
        });

        const oBillingMethod = new Select({
          items: [
            new Item({ key: "", text: "" })
          ]
        });

        const oStatus = new Select({
          items: [
            new Item({ key: "active", text: "Active" }),
            new Item({ key: "inactive", text: "Inactive" })
          ],
          selectedKey: "active"
        });

        const oCustomerClassification = new Select({
          items: [
            new Item({ key: "a", text: "A" }),
            new Item({ key: "b", text: "B" }),
            new Item({ key: "c", text: "C" })
          ],
          selectedKey: "b"
        });

        const oExceptionPriority = new Select({
          items: [
            new Item({ key: "no", text: "No" }),
            new Item({ key: "yes", text: "Yes" })
          ],
          selectedKey: "no"
        });

        const oUsingCustomerITSM = new Select({
          items: [
            new Item({ key: "no", text: "No" }),
            new Item({ key: "yes", text: "Yes" })
          ],
          selectedKey: "no"
        });

        const oAIAgent = new Select({
          items: [
            new Item({ key: "", text: "" })
          ]
        });

        // --- Column 2: Customer Details ---
        const oIndustry = new Input({ value: "Public Sector" });
        const oCustomer = new Input({ value: "Authority/L5R 3L5" });
        const oMainCustomerCountry = new Input({ value: "Canada" });
        const oCustomerState = new Input({ value: "ON" });
        const oCustomerCity = new Input({ value: "Mississauga" });
        const oSDMCounterpart = new Input({ value: "Rich Poweska" });
        const oSDMCounterpartEmail = new Input({ value: "Rich.Poweska@electrical" });
        const oITLeaders = new Input({ value: "Kelley Irwin" });
        const oITLeadersEmail = new Input({ value: "Kelley.irwin@electricalsa" });
        const oSOWApproverEmail = new Input({ value: "Brian.Wu@electricalsafet" });
        const oSOWApprover = new Input({ value: "Brian Wu" });
        const oAccountManager = new Input({ placeholder: "" });
        const oSDMSecondary = new Input({ placeholder: "" });
        const oVP = new Input({ placeholder: "" });

        // --- Column 3: SOW & Project Info ---
        const oVDI = new Input({ placeholder: "" });
        const oSDMPrime = new Input({ value: "Pedro Almeida" });
        const oRegionalLead = new Input({ value: "Marie-Noelle House" });
        const oSOWStartDate = new DatePicker({ value: "2025-01-01", valueFormat: "yyyy-MM-dd", displayFormat: "yyyy-MM-dd" });
        const oSOWEndDate = new DatePicker({ value: "2030-01-01", valueFormat: "yyyy-MM-dd", displayFormat: "yyyy-MM-dd" });
        const oSOWNbMonths = new Input({ value: "60" });
        const oSOWRenSignedDate = new DatePicker({ placeholder: "e.g. 12/31/26", displayFormat: "MM/dd/yy" });
        const oSyntaxCustomerSince = new DatePicker({ value: "1969-12-31", valueFormat: "yyyy-MM-dd", displayFormat: "MMM dd, yyyy" });
        const oProjectStage = new Input({ value: "In Execution" });
        const oProjectRowSource = new Input({ value: "S4" });
        const oCustomerRowSource = new Input({ value: "S4" });

        // --- Build the form ---
        const oForm = new SimpleForm({
          editable: true,
          layout: "ResponsiveGridLayout",
          labelSpanL: 4,
          labelSpanM: 4,
          emptySpanL: 0,
          emptySpanM: 0,
          columnsL: 3,
          columnsM: 2,
          content: [
            // Column 1
            new Title({ text: "General" }),
            new Label({ text: "Customer Delivery Region" }), oDeliveryRegion,
            new Label({ text: "Churn Risk" }), oChurnRisk,
            new Label({ text: "Customer Time Zone" }), oTimeZone,
            new Label({ text: "Churn Risk Reason" }), oChurnRiskReason,
            new Label({ text: "SAP System Level 1" }), oSAPSystemLevel,
            new Label({ text: "TMS Contract" }), oTMSContract,
            new Label({ text: "PCOE" }), oPCOE,
            new Label({ text: "Ebonding" }), oEbonding,
            new Label({ text: "Billing Method Be" }), oBillingMethod,
            new Label({ text: "Status" }), oStatus,
            new Label({ text: "Customer Classification" }), oCustomerClassification,
            new Label({ text: "Exception Priority 1" }), oExceptionPriority,
            new Label({ text: "Using Customer ITSM" }), oUsingCustomerITSM,
            new Label({ text: "AI AGENT" }), oAIAgent,

            // Column 2
            new Title({ text: "Customer Details" }),
            new Label({ text: "Industry" }), oIndustry,
            new Label({ text: "Customer" }), oCustomer,
            new Label({ text: "Main Customer Country" }), oMainCustomerCountry,
            new Label({ text: "Customer State" }), oCustomerState,
            new Label({ text: "Customer City" }), oCustomerCity,
            new Label({ text: "SDM Counterpart" }), oSDMCounterpart,
            new Label({ text: "SDM Counterpart Email" }), oSDMCounterpartEmail,
            new Label({ text: "IT Leaders" }), oITLeaders,
            new Label({ text: "IT Leaders Email" }), oITLeadersEmail,
            new Label({ text: "SOW Approver Email" }), oSOWApproverEmail,
            new Label({ text: "SOW Approver" }), oSOWApprover,
            new Label({ text: "Account Manager" }), oAccountManager,
            new Label({ text: "SDM Secondary" }), oSDMSecondary,
            new Label({ text: "VP" }), oVP,

            // Column 3
            new Title({ text: "SOW & Project" }),
            new Label({ text: "VDI" }), oVDI,
            new Label({ text: "SDM Prime" }), oSDMPrime,
            new Label({ text: "Regional Lead" }), oRegionalLead,
            new Label({ text: "SOW Start Date" }), oSOWStartDate,
            new Label({ text: "SOW End Date" }), oSOWEndDate,
            new Label({ text: "SOW Nb Of Months" }), oSOWNbMonths,
            new Label({ text: "SOW Ren. Signed Date" }), oSOWRenSignedDate,
            new Label({ text: "Syntax Customer Since" }), oSyntaxCustomerSince,
            new Label({ text: "Project Stage" }), oProjectStage,
            new Label({ text: "Project Row Source" }), oProjectRowSource,
            new Label({ text: "Customer Row Source" }), oCustomerRowSource,
          ]
        });

        // --- Save / Cancel Toolbar ---
        const oToolbar = new Toolbar({
          content: [
            new ToolbarSpacer(),
            new Button({
              text: "Save",
              type: "Emphasized",
              press: () => {
                console.log("Save clicked");
              }
            }),
            new Button({
              text: "Cancel",
              press: () => {
                console.log("Cancel clicked");
              }
            })
          ]
        });

        oForm.placeAt(container.id);
        oToolbar.placeAt(container.id);
      });
    });
  }
}

customElements.define("com-sidya-fioriform", SyntaxFioriForm);