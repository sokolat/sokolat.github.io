(function() {
    let template = document.createElement("template");
    template.innerHTML = `
        <style>
            :host {
                display: block;
                border: 1px solid #ccc;
                border-radius: 6px;
                padding: 10px;
                font-family: Arial, sans-serif;
                font-size: 14px;
            }
        </style>
        <div id="container">Check Box Group Drilldown Widget Loaded</div>
    `;

    customElements.define("com-sap-sidya-checkboxgroupdrilldown-main", CheckBoxGroupDrillDown);
})();