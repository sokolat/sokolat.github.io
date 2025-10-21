(function () {
    let template = document.createElement("template");
    template.innerHTML = `
        <style>
            :host {
                display: block;
                border: 2px solid #0070f2;
                border-radius: 6px;
                padding: 12px;
                font-family: Arial, sans-serif;
                font-size: 14px;
                min-width: 220px;
                min-height: 120px;
                box-sizing: border-box;
                background-color: #fafafa;
            }

            .parent {
                font-weight: bold;
                margin-top: 10px;
                cursor: pointer;
                user-select: none;
                display: flex;
                align-items: center;
            }

            .child-group {
                margin-left: 32px;
                margin-top: 6px;
                padding-left: 8px;
                border-left: 1px solid rgba(0,0,0,0.15);
                display: none;
            }

            .expanded > .child-group {
                display: block;
            }

            .child-group label {
                display: flex;
                align-items: center;
                gap: 8px;
                margin: 6px 0;
                font-weight: normal;
                color: #333;
                opacity: 0.85;
            }

            label {
                display: flex;
                align-items: center;
                gap: 6px;
                margin: 4px 0;
            }

            ui5-icon.toggle-icon {
                width: 16px;
                height: 16px;
                cursor: pointer;
                color: #666;
            }
        </style>
        <div id="container"></div>
    `;

    class CheckBoxGroupDrillDown extends HTMLElement {
        constructor() {
            super();
            this._props = {};
            this._data = {
                "Fruits": ["Apple", "Banana", "Orange"],
                "Vegetables": ["Carrot", "Lettuce", "Tomato"],
                "Dairy": ["Milk", "Cheese"]
            };

            const shadowRoot = this.attachShadow({ mode: "open" });
            shadowRoot.appendChild(template.content.cloneNode(true));
        }

        connectedCallback() {
            this._render();
        }

        _render() {
            const container = this.shadowRoot.getElementById("container");
            container.innerHTML = "";

            for (const parent in this._data) {
                const parentDiv = document.createElement("div");
                parentDiv.classList.add("parent");

                // create toggle icon
                const toggleIcon = document.createElement("ui5-icon");
                toggleIcon.setAttribute("name", "navigation-right-arrow"); // collapsed by default
                toggleIcon.classList.add("toggle-icon");

                const parentCheckbox = document.createElement("input");
                parentCheckbox.type = "checkbox";
                parentCheckbox.dataset.parent = parent;

                const parentLabelText = document.createTextNode(" " + parent);

                parentDiv.appendChild(toggleIcon);
                parentDiv.appendChild(parentCheckbox);
                parentDiv.appendChild(parentLabelText);

                const childGroup = document.createElement("div");
                childGroup.classList.add("child-group");

                this._data[parent].forEach(child => {
                    const childLabel = document.createElement("label");
                    const childCheckbox = document.createElement("input");
                    childCheckbox.type = "checkbox";
                    childCheckbox.dataset.parent = parent;
                    childCheckbox.dataset.child = child;
                    childLabel.appendChild(childCheckbox);
                    childLabel.appendChild(document.createTextNode(" " + child));
                    childGroup.appendChild(childLabel);
                });

                parentDiv.appendChild(childGroup);

                // toggle collapse/expand on click (not on checkbox)
                parentDiv.addEventListener("click", (e) => {
                    if (e.target.tagName !== "INPUT") {
                        parentDiv.classList.toggle("expanded");
                        toggleIcon.setAttribute(
                            "name",
                            parentDiv.classList.contains("expanded")
                                ? "navigation-down-arrow"
                                : "navigation-right-arrow"
                        );
                    }
                });

                // parent checkbox controls children
                parentCheckbox.addEventListener("change", () => {
                    const checked = parentCheckbox.checked;
                    childGroup.querySelectorAll("input[type='checkbox']").forEach(cb => cb.checked = checked);
                });

                container.appendChild(parentDiv);
            }
        }

        onCustomWidgetAfterUpdate(changedProperties) {
            console.log("After update:", changedProperties);
        }
    }

    customElements.define("com-sap-sidya-checkboxgroupdrilldown-main", CheckBoxGroupDrillDown);
})();
