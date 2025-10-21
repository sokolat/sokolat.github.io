(function() {
    let template = document.createElement("template");
    template.innerHTML = `
        <style>
            :host {
                display: block;
                border: 3px solid red;
                border-radius: 6px;
                padding: 10px;
                font-family: Arial, sans-serif;
                font-size: 14px;
            }
        </style>
        <div id="container">Check Box Group Drilldown Widget Loaded</div>
    `;

    class CheckBoxGroupDrillDown extends HTMLElement {
        constructor() {
            super();
            let shadowRoot = this.attachShadow({ mode: "open" });
            shadowRoot.appendChild(template.content.cloneNode(true));
            this._props = {};
        }

        onCustomWidgetBeforeUpdate(changedProperties) {
            // Merge new properties with internal state
            this._props = { ...this._props, ...changedProperties };
            console.log('Before Update:', changedProperties);
        }

        onCustomWidgetAfterUpdate(changedProperties) {
            console.log('After Update:', changedProperties);

            // Example: handle selectionContext property
            if ("selectionContext" in changedProperties) {
                const container = this.shadowRoot.getElementById("container");
                container.textContent = 'SelectionContext updated';
                console.log('Current selectionContext:', changedProperties["selectionContext"]);
            }

            // Optionally handle booleans
            if ("expandByDefault" in changedProperties) {
                console.log('expandByDefault:', changedProperties["expandByDefault"]);
            }
            if ("showSelectAll" in changedProperties) {
                console.log('showSelectAll:', changedProperties["showSelectAll"]);
            }
            if ("multiSelect" in changedProperties) {
                console.log('multiSelect:', changedProperties["multiSelect"]);
            }
        }
    }

    // Must match manifest main tag
    customElements.define("com-sap-sidya-checkboxgroupdrilldown-main", CheckBoxGroupDrillDown);
})();