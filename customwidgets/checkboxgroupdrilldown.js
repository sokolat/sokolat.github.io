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
                gap: 8px; /* spacing between toggle, checkbox, label */
            }

            .checkbox-label {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 200px; /* truncated width */
                display: inline-block;
                vertical-align: middle;
                transition: max-width 0.3s ease;
            }

            /* Expand label smoothly on hover */
            .parent-header:hover .checkbox-label {
                max-width: 400px; /* expanded width on hover */
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

            /* Reserve more space for the toggle icon and align it visually */
            ui5-icon.toggle-icon {
                width: 20px;
                height: 20px;
                min-width: 20px;
                display: inline-block;
                cursor: pointer;
                color: #666;
                visibility: hidden; /* hide when no children but keep space */
                flex: 0 0 20px;
            }

            .parent.has-children .toggle-icon {
                visibility: visible;
            }

            /* Custom square checkbox visual to match screenshot */
            input[type="checkbox"] {
                -webkit-appearance: none;
                appearance: none;
                width: 22px;
                height: 22px;
                min-width: 22px;
                border: 3px solid #cfcfcf;
                border-radius: 2px;
                background-color: #fff;
                box-sizing: border-box;
                position: relative;
                cursor: pointer;
                display: inline-block;
                vertical-align: middle;
                outline: none;
                transition: background-color 0.12s ease, border-color 0.12s ease;
            }

            /* checkmark */
            input[type="checkbox"]::after {
                content: "";
                position: absolute;
                left: 6px;
                top: 2px;
                width: 6px;
                height: 12px;
                border-right: 2px solid transparent;
                border-bottom: 2px solid transparent;
                transform: rotate(45deg);
                opacity: 0;
                transition: opacity 0.12s ease, border-color 0.12s ease;
            }

            /* partial / indeterminate visual: small blue square centered inside box */
            input[type="checkbox"].indeterminate::before {
                content: "";
                position: absolute;
                width: 12px;
                height: 12px;
                background-color: #0b78d1;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                border-radius: 1px;
                opacity: 1;
            }

            /* make sure indeterminate state doesn't show the checkmark */
            input[type="checkbox"].indeterminate::after {
                opacity: 0;
            }

            input[type="checkbox"]:checked {
                background-color: #0b78d1; /* blue fill */
                border-color: #9aa2a8; /* slightly darker border */
            }

            input[type="checkbox"]:checked::after {
                border-right-color: #fff;
                border-bottom-color: #fff;
                opacity: 1;
            }

            /* Slight spacing between checkbox and label to match screenshot */
            .parent-header input[type="checkbox"] {
                margin-left: 4px;
                margin-right: 8px;
            }

        </style>
        <div id="container"></div>
    `;


    class CheckBoxGroupDrillDown extends HTMLElement {
        constructor() {
            super();
            this._props = {};
            this._data = null;

            const shadowRoot = this.attachShadow({ mode: "open" });
            shadowRoot.appendChild(template.content.cloneNode(true));
        }

        _render() {
            const container = this.shadowRoot.getElementById("container");
            container.innerHTML = "";

            // Step 1: Build a map and roots array
            const map = {};
            const roots = [];

            this._data.forEach(item => {
                map[item.id] = { ...item, children: [] };
            });

            this._data.forEach(item => {
                if (item.parentId) {
                    if (map[item.parentId]) map[item.parentId].children.push(map[item.id]);
                } else {
                    roots.push(map[item.id]);
                }
            });

            // Step 2: Recursive render function
            const renderNode = (node) => {
                const wrapper = document.createElement("div");
                wrapper.classList.add("parent");
                // mark wrapper when node has children so the icon becomes visible (reserves space for alignment)
                if (node.children.length) wrapper.classList.add('has-children');

                const header = document.createElement("div");
                header.classList.add("parent-header");

                const toggleIcon = document.createElement("ui5-icon");
                toggleIcon.classList.add("toggle-icon");
                toggleIcon.setAttribute("name", node.children.length ? "navigation-right-arrow" : "");

                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                // support three-state selection: true, false, and 'partial' (indeterminate)
                const isChecked = node.selected === "true" || node.selected === true;
                const isPartial = node.selected === "partial" || node.selected === "indeterminate";
                checkbox.checked = isChecked;
                checkbox.indeterminate = !!isPartial;
                if (isPartial) checkbox.classList.add('indeterminate');
                checkbox.dataset.id = node.id;

                // wrap label in span for truncation/hover
                const labelSpan = document.createElement("span");
                labelSpan.classList.add("checkbox-label");
                labelSpan.textContent = node.label;
                labelSpan.title = node.label; // fallback tooltip

                header.appendChild(toggleIcon);
                header.appendChild(checkbox);
                header.appendChild(labelSpan);
                wrapper.appendChild(header);

                if (node.children.length) {
                    const childGroup = document.createElement("div");
                    childGroup.classList.add("child-group");
                    node.children.forEach(child => childGroup.appendChild(renderNode(child)));
                    wrapper.appendChild(childGroup);

                    // Expand/collapse
                    header.addEventListener("click", (e) => {
                        if (e.target.tagName !== "INPUT") {
                            wrapper.classList.toggle("expanded");
                            toggleIcon.setAttribute(
                                "name",
                                wrapper.classList.contains("expanded")
                                    ? "navigation-down-arrow"
                                    : "navigation-right-arrow"
                            );
                        }
                    });

                    // Parent checkbox controls children
                    checkbox.addEventListener("change", () => {
                        const checked = checkbox.checked;
                        childGroup.querySelectorAll("input[type='checkbox']").forEach(cb => { cb.checked = checked; cb.indeterminate = false; cb.classList.remove('indeterminate'); });
                    });
                }

                return wrapper;
            };

            // Step 3: Render all roots
            roots.forEach(root => container.appendChild(renderNode(root)));
        }


        onCustomWidgetAfterUpdate(changedProperties) {
            if(changedProperties.selections) {
                this._data = changedProperties.selections;
                this._render();
            }
        }
    }

    customElements.define("com-sap-sidya-checkboxgroupdrilldown-main", CheckBoxGroupDrillDown);
})();
