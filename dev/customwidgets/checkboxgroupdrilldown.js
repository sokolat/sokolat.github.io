(function () {
    let template = document.createElement("template");
    template.innerHTML = `
        <style>
            :host {
                display: block;
                padding: 12px;
                font-family: Arial, sans-serif;
                font-size: 14px;
                font-weight: bold;
                box-sizing: border-box;
                background-color: #f6f6f6;
                width: 100%;
                height: 100%;
                overflow-y: auto;
                overflow-x: hidden;
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

            /* Drag handle */
            .drag-handle {
                cursor: grab;
                color: #999;
                font-size: 12px;
                padding: 0 4px;
                user-select: none;
                display: flex;
                align-items: center;
            }
            .drag-handle:active {
                cursor: grabbing;
            }
            .drag-handle svg {
                width: 14px;
                height: 14px;
                fill: #999;
            }

            /* Drag states */
            .parent[draggable="true"] {
                transition: opacity 0.2s;
            }
            .parent.dragging {
                opacity: 0.4;
            }
            .parent.drag-over-top {
                border-top: 2px solid #0070f2;
                margin-top: 8px;
            }
            .parent.drag-over-bottom {
                border-bottom: 2px solid #0070f2;
                margin-bottom: 8px;
            }

        </style>
        <div id="container"></div>
    `;


    class CheckBoxGroupDrillDown extends HTMLElement {
        constructor() {
            super();
            this._data = [];
            this._map = {};

            const shadowRoot = this.attachShadow({ mode: "open" });
            shadowRoot.appendChild(template.content.cloneNode(true));
        }

        _render() {
            const container = this.shadowRoot.getElementById("container");
            container.innerHTML = "";

            // Step 1: Build map and roots
            // const map = {};
            const roots = [];
            
            this._data.forEach(item => {
                this._map[item.id] = {...item, children: [] };
            });

            this._data.forEach(item => {
                if (item.parentId) {
                    this._map[item.parentId]?.children.push(this._map[item.id]);
                } else {
                    roots.push(this._map[item.id]);
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

            // Drag and drop state
            let draggedEl = null;

            const clearDropIndicators = (containerEl) => {
                containerEl.querySelectorAll(".parent").forEach(el => {
                    el.classList.remove("drag-over-top", "drag-over-bottom");
                });
            };

            const setupDragAndDrop = (wrapper, parentContainer) => {
                wrapper.setAttribute("draggable", "true");

                // Track whether a drag is in progress to suppress expand/collapse clicks
                let isDragging = false;

                wrapper.addEventListener("dragstart", (e) => {
                    // Only allow drag if it started on the drag handle
                    const handle = wrapper.querySelector(".drag-handle");
                    const composedPath = e.composedPath();
                    if (!composedPath.includes(handle)) {
                        e.preventDefault();
                        return;
                    }
                    isDragging = true;
                    draggedEl = wrapper;
                    wrapper.classList.add("dragging");
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", wrapper.dataset.nodeId);
                });

                wrapper.addEventListener("dragend", () => {
                    wrapper.classList.remove("dragging");
                    clearDropIndicators(parentContainer);
                    draggedEl = null;
                    // Reset drag flag after a tick so the click handler can check it
                    setTimeout(() => { isDragging = false; }, 0);
                });

                wrapper.addEventListener("dragover", (e) => {
                    e.preventDefault();
                    if (!draggedEl || draggedEl === wrapper) return;
                    // Only allow reorder within the same container
                    if (draggedEl.parentElement !== wrapper.parentElement) return;

                    e.dataTransfer.dropEffect = "move";
                    clearDropIndicators(parentContainer);

                    const rect = wrapper.getBoundingClientRect();
                    const midY = rect.top + rect.height / 2;
                    if (e.clientY < midY) {
                        wrapper.classList.add("drag-over-top");
                    } else {
                        wrapper.classList.add("drag-over-bottom");
                    }
                });

                wrapper.addEventListener("dragleave", () => {
                    wrapper.classList.remove("drag-over-top", "drag-over-bottom");
                });

                wrapper.addEventListener("drop", (e) => {
                    e.preventDefault();
                    if (!draggedEl || draggedEl === wrapper) return;
                    if (draggedEl.parentElement !== wrapper.parentElement) return;

                    const rect = wrapper.getBoundingClientRect();
                    const midY = rect.top + rect.height / 2;
                    const insertBefore = e.clientY < midY;

                    const parent = wrapper.parentElement;
                    if (insertBefore) {
                        parent.insertBefore(draggedEl, wrapper);
                    } else {
                        parent.insertBefore(draggedEl, wrapper.nextSibling);
                    }

                    clearDropIndicators(parentContainer);

                    // Update _data order to match new DOM order
                    this._reorderData(parent);

                    const event = new CustomEvent("onReorder");
                    this.dispatchEvent(event);
                });
            };

            // Step 2: Recursive render
            const renderNode = (node) => {
                const wrapper = document.createElement("div");
                wrapper.classList.add("parent");
                wrapper.dataset.nodeId = node.id;
                if (node.children.length) wrapper.classList.add("has-children");

                const header = document.createElement("div");
                header.classList.add("parent-header");

                // Drag handle
                const dragHandle = document.createElement("span");
                dragHandle.classList.add("drag-handle");
                dragHandle.innerHTML = `<svg viewBox="0 0 16 16"><circle cx="5" cy="3" r="1.5"/><circle cx="11" cy="3" r="1.5"/><circle cx="5" cy="8" r="1.5"/><circle cx="11" cy="8" r="1.5"/><circle cx="5" cy="13" r="1.5"/><circle cx="11" cy="13" r="1.5"/></svg>`;
                dragHandle.title = "Drag to reorder";
                dragHandle.addEventListener("click", (e) => e.stopPropagation());

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

                header.appendChild(dragHandle);
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

                            const childData = this._data.find(d => d.id === cb.dataset.id);
                            if (childData) {
                                childData.selected = checked.toString();
                            }

                        });

                        const parentData = this._data.find(d => d.id === checkbox.dataset.id);
                        if (parentData) {
                            parentData.selected = checked.toString();
                        }

                        const event = new CustomEvent("onSelect");
                        this.dispatchEvent(event);

                        updateParentState(checkbox);
                    });
                }

                // child affects parent
                checkbox.addEventListener("change", () => {

                    const dataItem = this._data.find(d => d.id === checkbox.dataset.id);
                    if (dataItem) {
                        dataItem.selected = checkbox.checked.toString();
                    }

                    const event = new CustomEvent("onSelect");
                    this.dispatchEvent(event);

                    updateParentState(checkbox);
                });

                return wrapper;
            };

            // Step 3: Render all roots
            roots.forEach(root => {
                const el = renderNode(root);
                container.appendChild(el);
                setupDragAndDrop(el, container);
            });

            // Setup drag and drop for children inside expanded groups
            container.querySelectorAll(".child-group").forEach(childGroup => {
                Array.from(childGroup.children).forEach(childEl => {
                    setupDragAndDrop(childEl, childGroup);
                });
            });
        }

        _reorderData(containerEl) {
            // Get the new order of node IDs from the DOM
            const orderedIds = Array.from(containerEl.children)
                .filter(el => el.dataset.nodeId)
                .map(el => el.dataset.nodeId);

            // Extract the items being reordered and their original indices
            const reorderedItems = orderedIds.map(id => this._data.find(d => d.id === id)).filter(Boolean);

            // Find original indices of these items in _data
            const originalIndices = reorderedItems.map(item => this._data.indexOf(item)).sort((a, b) => a - b);

            // Place reordered items back into their original slot positions
            originalIndices.forEach((dataIdx, i) => {
                this._data[dataIdx] = reorderedItems[i];
            });
        }

        onCustomWidgetAfterUpdate(changedProperties) {
            if(changedProperties.selections) {
                this._data = changedProperties.selections;
                this._render();
            }
        }
    }

    customElements.define("com-sap-sidya-checkboxgroupdrilldown-dev-main", CheckBoxGroupDrillDown);
})();
