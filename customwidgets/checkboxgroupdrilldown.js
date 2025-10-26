(function () {
    let template = document.createElement("template");
    template.innerHTML = `
        :host {
            display: block;
            box-sizing: border-box;
            font-family: Arial, sans-serif;
            font-size: 14px;
            background-color: #fafafa;

            /* 🔹 Layout & spacing */
            padding: 12px;
            min-width: 220px;
            min-height: 120px;

            /* 🔹 Responsive behavior */
            width: 100%;
            height: 100%;
            overflow-y: auto;
            overflow-x: hidden;
        }

        #container {
            display: block;
            box-sizing: border-box;

            /* 🔹 Let content flow and scroll naturally */
            width: 100%;
            height: auto;
            max-height: 100%;
            overflow-y: auto;
            padding-right: 4px; /* small gap to prevent scrollbar overlap */
        }

        .parent {
            margin-top: 10px;
            word-wrap: break-word;
        }

        .parent-header {
            display: flex;
            align-items: center;
            cursor: pointer;
            user-select: none;
            gap: 8px;
            flex-wrap: wrap; /* 🔹 wrap text on smaller screens */
        }

        .checkbox-label {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 60vw; /* 🔹 dynamic truncation width */
            display: inline-block;
            vertical-align: middle;
            transition: max-width 0.3s ease;
        }

        .parent-header:hover .checkbox-label {
            max-width: 80vw; /* expand on hover, still responsive */
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
            flex-wrap: wrap;
        }

        label {
            display: flex;
            align-items: center;
            gap: 6px;
            margin: 4px 0;
        }

        /* 🔹 Keep icon alignment consistent */
        ui5-icon.toggle-icon {
            width: 16px;
            height: 16px;
            min-width: 16px;
            display: inline-block;
            cursor: pointer;
            color: #666;
            visibility: hidden;
        }

        .parent.has-children .toggle-icon {
            visibility: visible;
        }

        /* 🔹 Keep checkboxes vertically aligned */
        input[type="checkbox"] {
            vertical-align: middle;
        }

        /* 🔹 Responsive tweak for narrow views */
        @media (max-width: 480px) {
            :host {
                font-size: 13px;
                padding: 8px;
            }

            .checkbox-label {
                max-width: 70vw;
            }

            .child-group {
                margin-left: 20px;
            }
        }
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
                    map[item.parentId]?.children.push(map[item.id]);
                } else {
                    roots.push(map[item.id]);
                }
            });

            // 🔹 Recursive helper to compute selection state
            const computeSelectionState = (node) => {
                if (!node.children.length) {
                    // leaf node — interpret "true"/"false"/"" consistently
                    node.selected = node.selected === true || node.selected === "true";
                    node.indeterminate = false;
                    return node.selected ? 1 : 0;
                }

                // for non-leaves, compute state of all children first
                const childStates = node.children.map(computeSelectionState);
                const checkedCount = childStates.filter(Boolean).length;

                if (checkedCount === node.children.length) {
                    node.selected = true;
                    node.indeterminate = false;
                } else if (checkedCount === 0) {
                    node.selected = false;
                    node.indeterminate = false;
                } else {
                    node.selected = false;
                    node.indeterminate = true;
                }

                return node.selected ? 1 : node.indeterminate ? 0.5 : 0;
            };

            // 🔹 Compute all initial selection states
            roots.forEach(computeSelectionState);

            // 🔹 Function to update parent when children change
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

                updateParentState(parentCheckbox);
            };

            // Step 2: Recursive render
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
                checkbox.checked = !!node.selected;
                checkbox.indeterminate = !!node.indeterminate;
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
                        childGroup.appendChild(renderNode(child));
                    });
                    wrapper.appendChild(childGroup);

                    // expand/collapse
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

                    // parent controls children
                    checkbox.addEventListener("change", () => {
                        const checked = checkbox.checked;
                        checkbox.indeterminate = false;
                        childGroup.querySelectorAll("input[type='checkbox']").forEach(cb => {
                            cb.checked = checked;
                            cb.indeterminate = false;
                        });
                        updateParentState(checkbox);
                    });
                }

                // child affects parent
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
