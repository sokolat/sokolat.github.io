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
            }

            .child-group {
                margin-left: 32px;
                margin-top: 6px;
                padding-left: 8px;
                border-left: 1px dashed #ccc;
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

            span.arrow {
                width: 14px;
                display: inline-block;
                text-align: center;
                transition: transform 0.2s ease;
                color: #666;
            }

            .expanded > label > span.arrow {
                transform: rotate(90deg);
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

            let shadowRoot = this.attachShadow({ mode: "open" });
            shadowRoot.appendChild(template.content.cloneNode(true));
        }

        connectedCallback() {
            this._render();
        }

        _render() {
            const container = this.shadowRoot.getElementById("container");
            container.innerHTML = ""; // clear

            for (const parent in this._data) {
                const parentDiv = document.createElement("div");
                parentDiv.classList.add("parent");

                const parentLabel = document.createElement("label");
                const arrow = document.createElement("span");
                arrow.textContent = "▶";
                arrow.classList.add("arrow");

                const parentCheckbox = document.createElement("input");
                parentCheckbox.type = "checkbox";
                parentCheckbox.dataset.parent = parent;

                parentLabel.appendChild(arrow);
                parentLabel.appendChild(parentCheckbox);
                parentLabel.appendChild(document.createTextNode(" " + parent));

                parentDiv.appendChild(parentLabel);

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

                // Expand/collapse toggle
                parentLabel.addEventListener("click", (e) => {
                    if (e.target.tagName !== "INPUT") {
                        parentDiv.classList.toggle("expanded");
                    }
                });

                // Parent checkbox controls children
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
