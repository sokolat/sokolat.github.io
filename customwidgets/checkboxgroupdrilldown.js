(function () {
    let template = document.createElement("template");
    template.innerHTML = `
        <style>
            :host {
                display: block;
                padding: 12px;
                font-family: Arial, sans-serif;
                font-size: 14px;
                min-width: 220px;
                min-height: 120px;
                box-sizing: border-box;
                background-color: #fafafa;
            }

            .parent {
                margin-top: 10px;
            }

            .parent-header {
                display: flex;
                align-items: center;
                cursor: pointer;
                user-select: none;
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
            this._data = [];
            /*
            this._data = [
                {
                    "id": "S4_Client_AMS.service_manager", "label": "Service Manager", "parentId": "Governance_Attribute", "selected": "true"
                },
                {
                    "id": "S4_Client_AMS.system_administrator", "label": "System Administrator", "parentId": "Governance_Attribute", "selected": "false"
                },
                {
                    "id": "S4_Client_AMS.business_user", "label": "Business User", "parentId": "Governance_Attribute", "selected": "true"
                },
                {
                    "id": "Governance_Attribute", "label": "Governance Attribute", "parentId": null, "selected": "false"
                }
            ];
            */

            const shadowRoot = this.attachShadow({ mode: "open" });
            shadowRoot.appendChild(template.content.cloneNode(true));

            const container = this.shadowRoot.getElementById("container");
            container.innerHTML = "";

            // Build hierarchy from _data array
            const hierarchy = {};
            this._data.forEach(item => {
                if (!item.parentId) {
                    hierarchy[item.id] = { ...item, children: [] };
                }
            });
            this._data.forEach(item => {
                if (item.parentId && hierarchy[item.parentId]) {
                    hierarchy[item.parentId].children.push(item);
                }
            });

            // Render parent + children
            Object.values(hierarchy).forEach(parent => {
                const parentDiv = document.createElement("div");
                parentDiv.classList.add("parent");

                const header = document.createElement("div");
                header.classList.add("parent-header");

                const toggleIcon = document.createElement("ui5-icon");
                toggleIcon.setAttribute("name", "navigation-right-arrow");
                toggleIcon.classList.add("toggle-icon");

                const parentCheckbox = document.createElement("input");
                parentCheckbox.type = "checkbox";
                parentCheckbox.dataset.parent = parent.id;
                parentCheckbox.checked = parent.selected === "true" || parent.selected === true;

                const parentLabelText = document.createTextNode(" " + parent.label);
                header.appendChild(toggleIcon);
                header.appendChild(parentCheckbox);
                header.appendChild(parentLabelText);
                parentDiv.appendChild(header);

                // Child group
                const childGroup = document.createElement("div");
                childGroup.classList.add("child-group");

                parent.children.forEach(child => {
                    const childLabel = document.createElement("label");
                    const childCheckbox = document.createElement("input");
                    childCheckbox.type = "checkbox";
                    childCheckbox.dataset.parent = parent.id;
                    childCheckbox.dataset.child = child.id;
                    childCheckbox.checked = child.selected === "true" || child.selected === true;

                    childLabel.appendChild(childCheckbox);
                    childLabel.appendChild(document.createTextNode(" " + child.label));
                    childGroup.appendChild(childLabel);
                });

                parentDiv.appendChild(childGroup);

                // Toggle expand/collapse
                header.addEventListener("click", (e) => {
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

                // Parent checkbox controls children
                parentCheckbox.addEventListener("change", () => {
                    const checked = parentCheckbox.checked;
                    childGroup.querySelectorAll("input[type='checkbox']").forEach(cb => cb.checked = checked);
                });

                container.appendChild(parentDiv);
            });
        }

		onCustomWidgetBeforeUpdate(changedProperties) {
			this._props = { ...this._props, ...changedProperties };
		}

        onCustomWidgetAfterUpdate(changedProperties) {
            if ("selections" in changedProperties) {
                this._data = changedProperties["selections"];
            }
        }
    }

    customElements.define("com-sap-sidya-checkboxgroupdrilldown-main", CheckBoxGroupDrillDown);
})();
