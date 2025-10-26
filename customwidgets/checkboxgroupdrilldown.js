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

            /* Ensure toggle icon reserves layout space even when empty so checkboxes align */
            ui5-icon.toggle-icon {
                width: 16px;
                height: 16px;
                min-width: 16px;
                display: inline-block;
                cursor: pointer;
                color: #666;
                /* keep space but hide when not used */
                visibility: hidden;
            }

            /* Reveal icon when the parent actually has children */
            .parent.has-children .toggle-icon {
                visibility: visible;
            }

            /* Keep checkboxes vertically aligned with the label */
            input[type="checkbox"] {
                vertical-align: middle;
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

            // Step 1: Build map and roots
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

            // Utility to update parent states recursively
            const updateParentState = (checkbox) => {
                const parentHeader = checkbox.closest(".child-group")?.previousElementSibling;
                if (!parentHeader) return;

                const parentCheckbox = parentHeader.querySelector("input[type='checkbox']");
                const childCheckboxes = parentHeader.nextElementSibling.querySelectorAll("input[type='checkbox']");

                const checkedCount = Array.from(childCheckboxes).filter(cb => cb.checked).length;

                if (checkedCount === childCheckboxes.length) {
                    parentCheckbox.checked = true;
                    parentCheckbox.indeterminate = false;
                } else if (checkedCount === 0) {
                    parentCheckbox.checked = false;
                    parentCheckbox.indeterminate = false;
                } else {
                    parentCheckbox.checked = false;
                    parentCheckbox.indeterminate = true;
                }

                // Recursively update ancestors
                updateParentState(parentCheckbox);
            };

            // Step 2: Recursive render function
            const renderNode = (node) => {
                const wrapper = document.createElement("div");
                wrapper.classList.add("parent");
                if (node.children.length) wrapper.classList.add("has-children");

                const header = document.createElement("div");
                header.classList.add("parent-header");

                const toggleIcon = document.createElement("ui5-icon");
                toggleIcon.classList.add("toggle-icon");
                toggleIcon.setAttribute("name", node.children.length ? "navigation-right-arrow" : "");

                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.checked = node.selected === "true" || node.selected === true;
                checkbox.dataset.id = node.id;

                const labelSpan = document.createElement("span");
                labelSpan.classList.add("checkbox-label");
                labelSpan.textContent = node.label;
                labelSpan.title = node.label;

                header.appendChild(toggleIcon);
                header.appendChild(checkbox);
                header.appendChild(labelSpan);
                wrapper.appendChild(header);

                if (node.children.length) {
                    const childGroup = document.createElement("div");
                    childGroup.classList.add("child-group");

                    node.children.forEach(child => {
                        const childEl = renderNode(child);
                        childGroup.appendChild(childEl);
                    });

                    wrapper.appendChild(childGroup);

                    // Expand/collapse logic
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
                        checkbox.indeterminate = false;
                        childGroup.querySelectorAll("input[type='checkbox']").forEach(cb => {
                            cb.checked = checked;
                            cb.indeterminate = false;
                        });
                        // Update ancestor state
                        updateParentState(checkbox);
                    });
                }

                // Child checkbox change should update parents
                checkbox.addEventListener("change", () => {
                    updateParentState(checkbox);
                });

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
