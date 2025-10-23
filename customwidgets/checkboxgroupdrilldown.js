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
            this._data = null;

            const shadowRoot = this.attachShadow({ mode: "open" });
            shadowRoot.appendChild(template.content.cloneNode(true));
        }

        _render() {
            const container = this.shadowRoot.getElementById("container");
            container.innerHTML = "";

            // 1️⃣ Build hierarchy map
            const map = {};
            const roots = [];

            this._data.forEach(item => map[item.id] = { ...item, children: [] });
            this._data.forEach(item => {
                if (item.parentId) {
                    if (map[item.parentId]) map[item.parentId].children.push(map[item.id]);
                } else {
                    roots.push(map[item.id]);
                }
            });

            // 2️⃣ Update parent state (gray & disabled if partially selected)
            const updateParentState = (parentWrapper) => {
                if (!parentWrapper) return;
                const parentCheckbox = parentWrapper.querySelector(":scope > .parent-header > input[type='checkbox']");
                const childCheckboxes = parentWrapper.querySelectorAll(":scope > .child-group input[type='checkbox']");

                const total = childCheckboxes.length;
                const checked = Array.from(childCheckboxes).filter(cb => cb.checked).length;

                if (checked === 0 || checked === total) {
                    parentCheckbox.disabled = false;
                    parentCheckbox.style.backgroundColor = "";
                } else {
                    parentCheckbox.disabled = true;
                    parentCheckbox.style.backgroundColor = "#ccc";
                }

                // recursively update ancestors
                updateParentState(parentWrapper.parentNode.closest(".parent"));
            };

            // 3️⃣ Recursive render
            const renderNode = (node) => {
                const wrapper = document.createElement("div");
                wrapper.classList.add("parent");

                const header = document.createElement("div");
                header.classList.add("parent-header");

                // Toggle icon only if node has children
                let toggleIcon;
                if (node.children.length) {
                    toggleIcon = document.createElement("ui5-icon");
                    toggleIcon.classList.add("toggle-icon");
                    toggleIcon.setAttribute("name", "navigation-right-arrow");
                    header.appendChild(toggleIcon);
                }

                // Checkbox
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";

                // Leaf nodes: normal selection
                if (node.children.length === 0) {
                    checkbox.checked = node.selected === "true" || node.selected === true;
                    checkbox.dataset.id = node.id;
                } else {
                    checkbox.checked = false; // will update dynamically
                }

                // Label with spacing and ellipsis
                const labelText = document.createElement("span");
                labelText.textContent = node.label;
                labelText.style.marginLeft = "6px";
                labelText.style.whiteSpace = "nowrap";
                labelText.style.overflow = "hidden";
                labelText.style.textOverflow = "ellipsis";
                labelText.style.maxWidth = node.children.length ? "200px" : "180px";

                header.appendChild(checkbox);
                header.appendChild(labelText);
                wrapper.appendChild(header);

                if (node.children.length) {
                    const childGroup = document.createElement("div");
                    childGroup.classList.add("child-group");

                    node.children.forEach(child => {
                        const childWrapper = renderNode(child);

                        // Style child label
                        const childLabel = childWrapper.querySelector("span");
                        if (childLabel) {
                            childLabel.style.marginLeft = "6px";
                            childLabel.style.whiteSpace = "nowrap";
                            childLabel.style.overflow = "hidden";
                            childLabel.style.textOverflow = "ellipsis";
                            childLabel.style.maxWidth = "180px";
                        }

                        childGroup.appendChild(childWrapper);
                    });

                    wrapper.appendChild(childGroup);

                    // Expand/collapse toggle
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

                    // Parent checkbox click → select/deselect all children
                    checkbox.addEventListener("change", () => {
                        const checked = checkbox.checked;
                        childGroup.querySelectorAll("input[type='checkbox']").forEach(cb => cb.checked = checked);
                        updateParentState(wrapper.parentNode.closest(".parent"));
                    });

                    // Child checkboxes → update parent state dynamically
                    childGroup.querySelectorAll("input[type='checkbox']").forEach(cb => {
                        cb.addEventListener("change", () => updateParentState(wrapper));
                    });

                    // Initial parent state
                    updateParentState(wrapper);
                }

                return wrapper;
            };

            // 4️⃣ Render all root nodes
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
