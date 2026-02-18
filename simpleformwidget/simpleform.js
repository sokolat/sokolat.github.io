class SimpleFormWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const div = document.createElement("div");
    div.id = "content";
    this.shadowRoot.appendChild(div);

    // Load SAPUI5 if not already loaded
    if (!window.sap) {
      const script = document.createElement("script");
      script.src = "https://ui5.sap.com/resources/sap-ui-core.js";
      script.id = "sap-ui-bootstrap";
      script.setAttribute("data-sap-ui-libs", "sap.m,sap.ui.layout");
      script.setAttribute("data-sap-ui-theme", "sap_fiori_3");
      script.setAttribute("data-sap-ui-async", "true");
      script.onload = () => this._initUI5(div);
      document.head.appendChild(script);
    } else {
      this._initUI5(div);
    }
  }

  _initUI5(div) {
    sap.ui.getCore().attachInit(() => {
      sap.ui.xmlview({ viewName: "Page" }).placeAt(div);
    });
  }
}

customElements.define("com-sap-sidya-simpleform", SimpleFormWidget);
