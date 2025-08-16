document.addEventListener("DOMContentLoaded", function () {
    const table = document.querySelector("table");
    let cells = () => document.querySelectorAll("table td");

    function darkenColor(color, percent) {
        let num = parseInt(color.slice(1), 16);
        let amt = Math.round(2.55 * percent);
        let R = Math.max(0, Math.min(255, (num >> 16) + amt));
        let G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt));
        let B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
        return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1).toUpperCase()}`;
    }    

    function resetCell(cell) {
        cell.innerHTML = "";
        cell.style.backgroundColor = "rgb(94, 94, 94)";
        cell.style.borderLeft = "none";
        cell.dataset.filled = "false";
        cell.removeAttribute("colspan");
        cell.removeAttribute("rowspan");
    }

    function createResizeHandles(cell) {
        cell.classList.add("cell"); // Add this line
    
        const existingHandles = cell.querySelectorAll(".resize-handle");
        existingHandles.forEach(handle => handle.remove());
    
        const resizeHandle = document.createElement("div");
        resizeHandle.className = "resize-handle";
        resizeHandle.style.position = "absolute";
        resizeHandle.style.width = "15px";
        resizeHandle.style.height = "15px";
        resizeHandle.style.backgroundColor = "#3d74ff";
        resizeHandle.style.borderRadius = "50%";
        resizeHandle.style.border = "2px solid white";
        resizeHandle.style.bottom = "-10px";
        resizeHandle.style.right = "-10px";
        resizeHandle.style.cursor = "nwse-resize";
        resizeHandle.style.zIndex = "1000";
    
        const resizeImage = document.createElement("img");
        resizeImage.src = "images/arrow-bottom-right.png";
        resizeImage.style.width = "100%";
        resizeImage.style.height = "100%";
        resizeImage.style.objectFit = "contain";
        resizeImage.style.pointerEvents = "none";
        resizeHandle.appendChild(resizeImage);
    
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
            
                const maxColumns = 5;
                const maxRows = table.rows.length;
            
                newColSpan = Math.min(newColSpan, maxColumns - cell.cellIndex);
                newRowSpan = Math.min(newRowSpan, maxRows - cell.parentElement.rowIndex);
            
                cell.setAttribute("colspan", newColSpan);
                cell.setAttribute("rowspan", newRowSpan);
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
        let ghost = null;
        let dragTimeout = null;
    
        cell.addEventListener("mousedown", function (e) {
            if (e.target.classList.contains("resize-handle")) return;
    
            dragTimeout = setTimeout(() => {
                isDragging = true;
                ghost = cell.cloneNode(true);
                ghost.style.position = "absolute";
                ghost.style.opacity = "0.6";
                ghost.style.pointerEvents = "none";
                ghost.style.zIndex = "1000";
                document.body.appendChild(ghost);
    
                function moveAt(pageX, pageY) {
                    ghost.style.left = `${pageX - ghost.offsetWidth / 2}px`;
                    ghost.style.top = `${pageY - ghost.offsetHeight / 2}px`;
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
    
                    let closestCell = Array.from(document.querySelectorAll("td")).reduce((closest, td) => {
                        const rect = td.getBoundingClientRect();
                        const dist = Math.hypot(rect.left - event.clientX, rect.top - event.clientY);
                        return dist < closest.dist ? { cell: td, dist } : closest;
                    }, { cell: null, dist: Infinity }).cell;
    
                    if (closestCell && closestCell.dataset.filled !== "true") {
                        // copy contents and styles, including left border if present
                        closestCell.innerHTML = cell.innerHTML;
                        closestCell.style.backgroundColor = cell.style.backgroundColor;
                        // preserve left border (visual indicator)
                        if (cell.style.borderLeft && cell.style.borderLeft !== 'none') {
                            closestCell.style.borderLeft = cell.style.borderLeft;
                        } else {
                            // compute a left border based on the color
                            closestCell.style.borderLeft = `4px solid ${darkenColor(cell.style.backgroundColor || '#000000', -20)}`;
                        }
                        closestCell.dataset.filled = "true";
                        closestCell.setAttribute("colspan", cell.getAttribute("colspan"));
                        closestCell.setAttribute("rowspan", cell.getAttribute("rowspan"));
                        createResizeHandles(closestCell);
                        enableDragging(closestCell);
                        resetCell(cell);
                    }
                }, { once: true });
            }, 200);
        });
    
        cell.addEventListener("mouseup", () => clearTimeout(dragTimeout));
    }    

    function saveTable() {
        const tableData = [];
        cells().forEach(cell => {
            if (cell.dataset.filled === "true") {
                const cellData = {
                    row: cell.parentElement.rowIndex,
                    col: cell.cellIndex,
                };
                if (cell.getAttribute("colspan") && cell.getAttribute("colspan") !== "1") {
                    cellData.colspan = cell.getAttribute("colspan");
                }
                if (cell.getAttribute("rowspan") && cell.getAttribute("rowspan") !== "1") {
                    cellData.rowspan = cell.getAttribute("rowspan");
                }
                if (cell.style.backgroundColor !== "rgb(94, 94, 94)") {
                    cellData.backgroundColor = cell.style.backgroundColor;
                }
                if (cell.innerHTML.trim() !== "") {
                    cellData.innerHTML = cell.innerHTML.trim();
                }
                tableData.push(cellData);
            }
        });
        const json = JSON.stringify(tableData, null, 2); // Pretty print JSON with 2 spaces
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
        cells().forEach(cell => {
            resetCell(cell);
        });
    }

    // Setup a single cell with default styles and event listeners
    function setupCell(cell) {
        if (!cell) return;
        if (cell.textContent.trim() === "") {
            cell.style.backgroundColor = "rgb(94, 94, 94)";
        }
        cell.style.position = "relative";
        cell.removeAttribute('data-listener-initialized');

        // Remove previously attached listeners by cloning
        const newCell = cell.cloneNode(true);
        cell.parentElement.replaceChild(newCell, cell);
        const c = newCell;
        c.dataset.filled = c.dataset.filled || "false";

        c.addEventListener("click", function () {
            if (c.dataset.filled !== "true") {
                const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
                const randomRoom = Math.floor(Math.random() * 9999) + 1;
                c.style.backgroundColor = randomColor;
                c.style.borderLeft = `4px solid ${darkenColor(randomColor, -20)}`;
                c.innerHTML = `
                    <h3 contenteditable="true" style="margin: 0; font-size: 14px;">Class Name</h3>
                    <p contenteditable="true" style="margin: 0; font-size: 12px;">Teacher's Name</p>
                    <p contenteditable="true" style="margin: 0; font-size: 12px;">Room: ${randomRoom}</p>
                `;
                c.dataset.filled = "true";
                c.setAttribute("colspan", "1");
                c.setAttribute("rowspan", "1");
                createResizeHandles(c);
                enableDragging(c);
            }
        });

        c.addEventListener("contextmenu", function (event) {
            event.preventDefault();
            if (c.dataset.filled === "true") {
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
                colorInput.value = c.style.backgroundColor;
                colorInput.addEventListener("input", function () {
                    c.style.backgroundColor = colorInput.value;
                });

                const deleteButton = document.createElement("button");
                deleteButton.textContent = "Delete Class";
                deleteButton.addEventListener("click", function () {
                    resetCell(c);
                    editBox.remove();
                });

                const optionLabel = document.createElement("label");
                optionLabel.textContent = "Week: ";
                optionLabel.style.marginRight = "5px";

                const optionSelect = document.createElement("select");
                const options = ["None", "A", "B"];
                options.forEach(option => {
                    const optionElement = document.createElement("option");
                    optionElement.value = option;
                    optionElement.textContent = option;
                    optionSelect.appendChild(optionElement);
                });

                optionSelect.addEventListener("change", function () {
                    const existingOptionBox = c.querySelector(".option-box");
                    if (existingOptionBox) {
                        existingOptionBox.remove();
                    }
                    if (optionSelect.value !== "None") {
                        const optionBox = document.createElement("div");
                        optionBox.className = "option-box";
                        optionBox.textContent = optionSelect.value;
                        optionBox.style.position = "absolute";
                        optionBox.style.bottom = "-1px";
                        optionBox.style.right = "-1px";
                        optionBox.style.border = "1px solid black";
                        optionBox.style.padding = "2px";
                        optionBox.style.backgroundColor = "white";
                        c.appendChild(optionBox);
                    }
                });

                const typeLabel = document.createElement("label");
                typeLabel.textContent = "Type: ";
                typeLabel.style.marginRight = "5px";

                const typeSelect = document.createElement("select");
                const types = ["None", "Replacement", "Exception"];
                types.forEach(type => {
                    const typeElement = document.createElement("option");
                    typeElement.value = type;
                    typeElement.textContent = type;
                    typeSelect.appendChild(typeElement);
                });

                typeSelect.addEventListener("change", function () {
                    const existingTypeBox = c.querySelector(".type-box");
                    if (existingTypeBox) {
                        existingTypeBox.remove();
                    }
                    if (typeSelect.value !== "None") {
                        const typeBox = document.createElement("div");
                        typeBox.className = "type-box";
                        typeBox.textContent = typeSelect.value;
                        typeBox.style.color = "#0000ff";
                        typeBox.style.fontWeight = "bold";
                        typeBox.style.position = "absolute";
                        typeBox.style.top = "0";
                        typeBox.style.left = "0";
                        typeBox.style.width = "100%";
                        typeBox.style.backgroundColor = "white";
                        typeBox.style.textAlign = "center";
                        typeBox.style.borderBottom = "1px solid black";
                        typeBox.style.whiteSpace = "nowrap";
                        typeBox.style.overflow = "hidden";
                        typeBox.style.textOverflow = "ellipsis";
                        c.appendChild(typeBox);
                    }
                });

                const evalLabel = document.createElement("label");
                evalLabel.textContent = "Eval: ";
                evalLabel.style.marginRight = "5px";

                const evalSelect = document.createElement("select");
                const evalOptions = ["None", "Evaluation", "DS"];
                evalOptions.forEach(evalOption => {
                    const evalOptionElement = document.createElement("option");
                    evalOptionElement.value = evalOption;
                    evalOptionElement.textContent = evalOption;
                    evalSelect.appendChild(evalOptionElement);
                });

                evalSelect.addEventListener("change", function () {
                    const existingEvalBox = c.querySelector(".eval-box");
                    if (existingEvalBox) {
                        existingEvalBox.remove();
                    }
                    if (evalSelect.value !== "None") {
                        const evalBox = document.createElement("div");
                        evalBox.className = "eval-box";
                        evalBox.textContent = evalSelect.value === "Evaluation" ? "EVA" : "DS";
                        evalBox.style.position = "absolute";
                        evalBox.style.top = "0";
                        evalBox.style.right = "0";
                        evalBox.style.border = "2px solid black";
                        evalBox.style.fontWeight = "bold";
                        evalBox.style.padding = "2px";
                        evalBox.style.backgroundColor = "white";
                        c.appendChild(evalBox);
                    }
                });

                editBox.appendChild(colorLabel);
                editBox.appendChild(colorInput);
                editBox.appendChild(document.createElement("br"));
                editBox.appendChild(optionLabel);
                editBox.appendChild(optionSelect);
                editBox.appendChild(document.createElement("br"));
                editBox.appendChild(typeLabel);
                editBox.appendChild(typeSelect);
                editBox.appendChild(document.createElement("br"));
                editBox.appendChild(evalLabel);
                editBox.appendChild(evalSelect);
                editBox.appendChild(document.createElement("br"));
                editBox.appendChild(deleteButton);
                document.body.appendChild(editBox);
            }
        });
    }

    // Initialize all cells
    function initializeAllCells() {
        cells().forEach(cell => setupCell(cell));
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

    function loadExample() {
    clearTable();
    fetch('files/ex1.json')
        .then(response => response.json())
        .then(exampleData => {
            exampleData.forEach(data => {
                const cell = table.rows[data.row].cells[data.col];
                cell.innerHTML = data.innerHTML;
                cell.style.backgroundColor = data.backgroundColor;
                cell.dataset.filled = "true";
                cell.setAttribute("colspan", data.colspan);
                cell.setAttribute("rowspan", data.rowspan);
                createResizeHandles(cell);
                enableDragging(cell);
            });
            // ensure times are present and visible
            if (window.generateTimes) window.generateTimes();
        })
        .catch(error => console.error('Error loading example data:', error));
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

    const exampleButton = document.getElementById("exampleButton");
    exampleButton.addEventListener("click", loadExample);

    const feedbackButton = document.getElementById("feedbackButton");
    const feedbackForm = document.getElementById("feedbackForm");
    const submitFeedbackButton = document.getElementById("submitFeedbackButton");
    const cancelFeedbackButton = document.getElementById("cancelFeedbackButton");
    const feedbackText = document.getElementById("feedbackText");

    feedbackButton.addEventListener("click", function () {
        feedbackForm.style.display = "block";
    });

    cancelFeedbackButton.addEventListener("click", function () {
        feedbackForm.style.display = "none";
        feedbackText.value = "";
    });

    submitFeedbackButton.addEventListener("click", function () {
        const feedback = feedbackText.value;
        if (feedback.trim() === "") {
            alert("Please enter your feedback.");
            return;
        }

        // Send feedback using EmailJS
        emailjs.send("service_7h8w56g", "template_746llri", {
            feedback: feedback,
        }).then(function (response) {
            console.log("SUCCESS!", response.status, response.text);
            alert("Feedback sent successfully!");
            feedbackForm.style.display = "none";
            feedbackText.value = "";
        }, function (error) {
            console.log("FAILED...", error);
            alert("Failed to send feedback. Please try again later.");
        });
    });
    // initialize all cells on load
    initializeAllCells();
    if (window.generateTimes) window.generateTimes();

    // reposition time slots and separators on resize
    window.addEventListener('resize', () => {
        if (window.generateTimes) window.generateTimes();
    });

    // Add/Delete row utilities
    function addRow() {
        const tbody = table.tBodies[0];
        const newRow = tbody.insertRow();
        for (let i = 0; i < 5; i++) {
            const td = newRow.insertCell();
            td.innerHTML = '';
            td.style.backgroundColor = 'rgb(94, 94, 94)';
            td.style.position = 'relative';
            setupCell(td);
        }
        // add corresponding time slot
        const timeColumn = document.querySelector('.time-column');
    // regenerate times so they stay consistent (1h apart)
    if (window.generateTimes) window.generateTimes();
    }

    function deleteRow() {
        const tbody = table.tBodies[0];
        if (tbody.rows.length <= 1) return; // keep at least 1 row
        tbody.deleteRow(-1);
    if (window.generateTimes) window.generateTimes();
    }

    const addRowButton = document.getElementById('addRowButton');
    const deleteRowButton = document.getElementById('deleteRowButton');
    addRowButton.addEventListener('click', addRow);
    deleteRowButton.addEventListener('click', deleteRow);
});
