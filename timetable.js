document.addEventListener("DOMContentLoaded", function () {
    const table = document.querySelector("table");
    const cells = document.querySelectorAll("table td");

    function resetCell(cell) {
        cell.innerHTML = "";
        cell.style.backgroundColor = "rgb(94, 94, 94)";
        cell.dataset.filled = "false";
        cell.removeAttribute("colspan");
        cell.removeAttribute("rowspan");
    }

    function createResizeHandles(cell) {
        const resizeHandle = document.createElement("div");
        resizeHandle.className = "resize-handle";
        resizeHandle.style.position = "absolute";
        resizeHandle.style.width = "10px";
        resizeHandle.style.height = "10px";
        resizeHandle.style.backgroundColor = "black";
        resizeHandle.style.bottom = "0";
        resizeHandle.style.right = "0";
        resizeHandle.style.cursor = "nwse-resize";
        cell.appendChild(resizeHandle);

        resizeHandle.addEventListener("mousedown", function (e) {
            e.stopPropagation();
            let startX = e.clientX;
            let startY = e.clientY;
            let startColSpan = parseInt(cell.getAttribute("colspan")) || 1;
            let startRowSpan = parseInt(cell.getAttribute("rowspan")) || 1;

            function resize(e) {
                let dx = e.clientX - startX;
                let dy = e.clientY - startY;
                let newColSpan = Math.max(1, startColSpan + Math.round(dx / cell.offsetWidth));
                let newRowSpan = Math.max(1, startRowSpan + Math.round(dy / cell.offsetHeight));

                if (cell.cellIndex + newColSpan <= table.rows[0].cells.length &&
                    cell.parentElement.rowIndex + newRowSpan <= table.rows.length) {
                    cell.setAttribute("colspan", newColSpan);
                    cell.setAttribute("rowspan", newRowSpan);
                }
            }

            function stopResize() {
                document.removeEventListener("mousemove", resize);
                document.removeEventListener("mouseup", stopResize);
            }

            document.addEventListener("mousemove", resize);
            document.addEventListener("mouseup", stopResize);
        });
    }

    function enableDragging(cell) {
        let isDragging = false;
        let originalCell = null;
        let ghost = null;
        let dragTimeout = null;

        cell.addEventListener("mousedown", function (e) {
            if (e.target.classList.contains("resize-handle")) return;

            dragTimeout = setTimeout(() => {
                isDragging = true;
                originalCell = cell;

                ghost = cell.cloneNode(true);
                ghost.style.opacity = "0.6";
                ghost.style.position = "absolute";
                ghost.style.pointerEvents = "none";
                ghost.style.width = `${cell.offsetWidth}px`;
                ghost.style.height = `${cell.offsetHeight}px`;
                document.body.appendChild(ghost);

                function moveAt(pageX, pageY) {
                    ghost.style.left = pageX - ghost.offsetWidth / 2 + "px";
                    ghost.style.top = pageY - ghost.offsetHeight / 2 + "px";
                }

                moveAt(e.pageX, e.pageY);

                function onMouseMove(event) {
                    moveAt(event.pageX, event.pageY);
                }

                document.addEventListener("mousemove", onMouseMove);

                document.addEventListener("mouseup", function (event) {
                    isDragging = false;
                    document.removeEventListener("mousemove", onMouseMove);
                    ghost.remove();

                    let closestCell = null;
                    let minDist = Infinity;
                    cells.forEach(td => {
                        const rect = td.getBoundingClientRect();
                        const dist = Math.hypot(rect.x - event.clientX, rect.y - event.clientY);
                        if (dist < minDist) {
                            minDist = dist;
                            closestCell = td;
                        }
                    });

                    if (closestCell && closestCell.dataset.filled !== "true") {
                        closestCell.innerHTML = cell.innerHTML;
                        closestCell.style.backgroundColor = cell.style.backgroundColor;
                        closestCell.dataset.filled = "true";
                        closestCell.setAttribute("colspan", cell.getAttribute("colspan"));
                        closestCell.setAttribute("rowspan", cell.getAttribute("rowspan"));
                        createResizeHandles(closestCell);
                        enableDragging(closestCell);
                        resetCell(originalCell);
                    }
                }, { once: true });
            }, 200);
        });

        cell.addEventListener("mouseup", function () {
            clearTimeout(dragTimeout);
        });
    }

    function saveTable() {
        const tableData = [];
        cells.forEach(cell => {
            if (cell.dataset.filled === "true") {
                tableData.push({
                    row: cell.parentElement.rowIndex,
                    col: cell.cellIndex,
                    colspan: cell.getAttribute("colspan"),
                    rowspan: cell.getAttribute("rowspan"),
                    backgroundColor: cell.style.backgroundColor,
                    innerHTML: cell.innerHTML
                });
            }
        });
        const json = JSON.stringify(tableData);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "timetable.json";
        a.click();
        URL.revokeObjectURL(url);
    }

    function loadTable(event) {
        const file = event.target.files[0];
        if (file) {
            clearTable();
            const reader = new FileReader();
            reader.onload = function (e) {
                const tableData = JSON.parse(e.target.result);
                tableData.forEach(data => {
                    const cell = table.rows[data.row].cells[data.col];
                    cell.innerHTML = data.innerHTML;
                    cell.style.backgroundColor = data.backgroundColor;
                    cell.dataset.filled = "true";
                    cell.setAttribute("colspan", data.colspan);
                    cell.setAttribute("rowspan", data.rowspan);
                    createResizeHandles(cell);
                    enableDragging(cell);
                });
            };
            reader.readAsText(file);
        }
    }

    function clearTable() {
        cells.forEach(cell => {
            resetCell(cell);
        });
    }

    function exportToPNG() {
        import('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js').then(() => {
            html2canvas(document.querySelector(".container")).then(canvas => {
                const link = document.createElement("a");
                link.download = "schedule.png";
                link.href = canvas.toDataURL("image/png");
                link.click();
            });
        });
    }

    const saveButton = document.getElementById("saveButton");
    saveButton.addEventListener("click", saveTable);

    const loadButton = document.getElementById("loadButton");
    const loadInput = document.getElementById("loadInput");
    loadInput.addEventListener("change", loadTable);
    loadButton.addEventListener("click", () => loadInput.click());

    const clearButton = document.getElementById("clearButton");
    clearButton.addEventListener("click", clearTable);

    const exportButton = document.getElementById("exportButton");
    exportButton.addEventListener("click", exportToPNG);

    cells.forEach(cell => {
        if (cell.textContent.trim() === "") {
            cell.style.backgroundColor = "rgb(94, 94, 94)";
            cell.style.position = "relative";

            cell.addEventListener("click", function () {
                if (cell.dataset.filled !== "true") {
                    const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
                    const randomRoom = Math.floor(Math.random() * 9999) + 1;
                    cell.style.backgroundColor = randomColor;
                    cell.innerHTML = `
                        <h3 contenteditable="true" style="margin: 0; font-size: 14px;">Class Name</h3>
                        <p contenteditable="true" style="margin: 0; font-size: 12px;">Teacher's Name</p>
                        <p contenteditable="true" style="margin: 0; font-size: 12px;">Room: ${randomRoom}</p>
                    `;
                    cell.dataset.filled = "true";
                    cell.setAttribute("colspan", "1");
                    cell.setAttribute("rowspan", "1");
                    createResizeHandles(cell);
                    enableDragging(cell);
                }
            });

            cell.addEventListener("contextmenu", function (event) {
                event.preventDefault();
                if (cell.dataset.filled === "true") {
                    document.querySelectorAll(".edit-box").forEach(box => box.remove());

                    const editBox = document.createElement("div");
                    editBox.className = "edit-box";
                    editBox.style.position = "fixed";
                    editBox.style.width = "140px";
                    editBox.style.padding = "10px";
                    editBox.style.backgroundColor = "white";
                    editBox.style.border = "1px solid black";
                    editBox.style.zIndex = "1000";
                    editBox.style.top = "10px";
                    editBox.style.left = "10px";

                    const colorLabel = document.createElement("label");
                    colorLabel.textContent = "Color: ";
                    colorLabel.style.marginRight = "5px";

                    const colorInput = document.createElement("input");
                    colorInput.type = "color";
                    colorInput.value = cell.style.backgroundColor;
                    colorInput.addEventListener("input", function () {
                        cell.style.backgroundColor = colorInput.value;
                    });

                    const deleteButton = document.createElement("button");
                    deleteButton.textContent = "Delete Class";
                    deleteButton.addEventListener("click", function () {
                        resetCell(cell);
                        editBox.remove();
                    });

                    editBox.appendChild(colorLabel);
                    editBox.appendChild(colorInput);
                    editBox.appendChild(deleteButton);
                    document.body.appendChild(editBox);
                }
            });
        }
    });
});
