const uploadButton =
    document.getElementById("uploadButton");

const fileInput =
    document.getElementById("fileInput");

const fileCard =
    document.getElementById("fileCard");

const fileName =
    document.getElementById("fileName");

const fileInfo =
    document.getElementById("fileInfo");

const estimatedPrice =
    document.getElementById("estimatedPrice");

const copiesInput =
    document.getElementById("copies");

const pageRangeInput =
    document.getElementById("pageRange");

const sendRequestButton =
    document.getElementById("sendRequestButton");

const printSettings =
    document.getElementById("printSettings");

const confirmationSection =
    document.getElementById("confirmationSection");

const orderNumber =
    document.getElementById("orderNumber");

const confirmationFile =
    document.getElementById("confirmationFile");

const confirmationPages =
    document.getElementById("confirmationPages");

const confirmationCopies =
    document.getElementById("confirmationCopies");

const confirmationPrice =
    document.getElementById("confirmationPrice");

const confirmationPaperSize =
    document.getElementById("confirmationPaperSize");

const confirmationPrintType =
    document.getElementById("confirmationPrintType");

const confirmationPrintSides =
    document.getElementById("confirmationPrintSides");

const newRequestButton =
    document.getElementById("newRequestButton");


let totalPages = 1;


const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png"
];


const maxFileSize =
    25 * 1024 * 1024;


// ============================================
// STORAGE KEYS
// ============================================

const lastOrderNumberKey =
    "printFlowLastOrderNumber";

const ordersStorageKey =
    "printFlowOrders";


// ============================================
// PDF.JS WORKER
// ============================================

pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";


// ============================================
// UPLOAD BUTTON
// ============================================

uploadButton.addEventListener(
    "click",
    function () {

        fileInput.click();

    }
);


// ============================================
// FILE SELECTED
// ============================================

fileInput.addEventListener(
    "change",
    async function () {

        const file =
            fileInput.files[0];


        if (!file) {
            return;
        }


        // ====================================
        // CHECK FILE TYPE
        // ====================================

        if (!allowedTypes.includes(file.type)) {

            alert(
                "Unsupported file type.\n\n" +
                "Please select a PDF, JPG, JPEG, or PNG file."
            );

            fileInput.value = "";

            fileCard.classList.remove("show");

            totalPages = 1;

            calculatePrice();

            return;
        }


        // ====================================
        // CHECK FILE SIZE
        // ====================================

        if (file.size > maxFileSize) {

            alert(
                "This file is too large.\n\n" +
                "Maximum file size is 25 MB."
            );

            fileInput.value = "";

            fileCard.classList.remove("show");

            totalPages = 1;

            calculatePrice();

            return;
        }


        // ====================================
        // COUNT PDF PAGES
        // ====================================

        if (file.type === "application/pdf") {

            try {

                const arrayBuffer =
                    await file.arrayBuffer();


                const pdf =
                    await pdfjsLib
                        .getDocument({
                            data: arrayBuffer
                        })
                        .promise;


                totalPages =
                    pdf.numPages;


                console.log(
                    "PDF page count:",
                    totalPages
                );

            }

            catch (error) {

                console.error(
                    "PDF page counting failed:",
                    error
                );


                alert(
                    "We couldn't read this PDF.\n\n" +
                    "Please try another PDF file."
                );


                fileInput.value = "";

                fileCard.classList.remove("show");

                totalPages = 1;

                calculatePrice();

                return;
            }

        }

        else {

            // JPG / PNG = 1 page

            totalPages = 1;

        }


        // ====================================
        // SHOW FILE INFORMATION
        // ====================================

        fileName.textContent =
            file.name;


        const sizeInMB =
            (
                file.size /
                (1024 * 1024)
            ).toFixed(2);


        let fileType =
            "File";


        if (
            file.type ===
            "application/pdf"
        ) {

            fileType =
                "PDF";

        }

        else if (
            file.type ===
            "image/jpeg"
        ) {

            fileType =
                "JPG";

        }

        else if (
            file.type ===
            "image/png"
        ) {

            fileType =
                "PNG";

        }


        fileInfo.textContent =
            `${fileType} • ${sizeInMB} MB • ${totalPages} ${
                totalPages === 1
                    ? "page"
                    : "pages"
            }`;


        fileCard.classList.add("show");


        // ====================================
        // CALCULATE PRICE
        // ====================================

        calculatePrice();

    }
);


// ============================================
// GET PAPER SIZE
// ============================================

function getPaperSize() {

    const selected =
        document.querySelector(
            'input[name="paperSize"]:checked'
        );


    return selected
        ? selected.value
        : "A4";
}


// ============================================
// GET PRINT TYPE
// ============================================

function getPrintType() {

    const selected =
        document.querySelector(
            'input[name="printType"]:checked'
        );


    return selected
        ? selected.value
        : "B&W";
}


// ============================================
// GET PRINT SIDES
// ============================================

function getPrintSides() {

    const selected =
        document.querySelector(
            'input[name="printSides"]:checked'
        );


    return selected
        ? selected.value
        : "Single";
}


// ============================================
// GET COPIES
// ============================================

function getCopies() {

    let copies =
        Number(
            copiesInput.value
        );


    if (
        !Number.isFinite(copies) ||
        copies < 1
    ) {

        copies = 1;

    }


    if (copies > 100) {

        copies = 100;

    }


    copies =
        Math.floor(copies);


    copiesInput.value =
        copies;


    return copies;
}


// ============================================
// GET SELECTED PAGE COUNT
// ============================================

function getSelectedPageCount() {

    const value =
        pageRangeInput.value.trim();


    // ========================================
    // ALL PAGES
    // ========================================

    if (
        value === "" ||
        value.toLowerCase() === "all"
    ) {

        return totalPages;

    }


    // ========================================
    // SINGLE PAGE
    // Example: 3
    // ========================================

    if (
        /^\d+$/.test(value)
    ) {

        const page =
            Number(value);


        if (
            page >= 1 &&
            page <= totalPages
        ) {

            return 1;

        }


        return 0;
    }


    // ========================================
    // PAGE RANGE
    // Example: 1-5
    // ========================================

    const rangeMatch =
        value.match(
            /^(\d+)\s*-\s*(\d+)$/
        );


    if (rangeMatch) {

        const start =
            Number(
                rangeMatch[1]
            );

        const end =
            Number(
                rangeMatch[2]
            );


        if (
            start >= 1 &&
            end >= start &&
            end <= totalPages
        ) {

            return end - start + 1;

        }


        return 0;
    }


    // ========================================
    // INDIVIDUAL PAGES
    // Example: 1,3,5
    // ========================================

    const pages =
        value
            .split(",")
            .map(
                page => page.trim()
            )
            .filter(
                page => /^\d+$/.test(page)
            );


    if (
        pages.length > 0
    ) {

        const pageNumbers =
            pages.map(
                page => Number(page)
            );


        const valid =
            pageNumbers.every(
                page =>
                    page >= 1 &&
                    page <= totalPages
            );


        if (!valid) {
            return 0;
        }


        return new Set(
            pageNumbers
        ).size;
    }


    return 0;
}


// ============================================
// PRICE CALCULATION
// ============================================

function calculatePrice() {

    const paperSize =
        getPaperSize();


    const printType =
        getPrintType();


    const copies =
        getCopies();


    const selectedPages =
        getSelectedPageCount();


    if (
        selectedPages === 0
    ) {

        estimatedPrice.textContent =
            "Invalid";

        return;
    }


    let pricePerPage =
        2;


    // ========================================
    // A4 B&W
    // ========================================

    if (
        paperSize === "A4" &&
        printType === "B&W"
    ) {

        pricePerPage =
            2;

    }


    // ========================================
    // A4 COLOR
    // ========================================

    else if (
        paperSize === "A4" &&
        printType === "Color"
    ) {

        pricePerPage =
            10;

    }


    // ========================================
    // A3 B&W
    // ========================================

    else if (
        paperSize === "A3" &&
        printType === "B&W"
    ) {

        pricePerPage =
            4;

    }


    // ========================================
    // A3 COLOR
    // ========================================

    else if (
        paperSize === "A3" &&
        printType === "Color"
    ) {

        pricePerPage =
            20;

    }


    const total =
        pricePerPage *
        selectedPages *
        copies;


    estimatedPrice.textContent =
        "₹" + total;
}


// ============================================
// GENERATE ORDER NUMBER
// ============================================

function generateOrderNumber() {

    let lastOrderNumber =
        Number(
            localStorage.getItem(
                lastOrderNumberKey
            )
        );


    if (
        !Number.isFinite(lastOrderNumber)
    ) {

        lastOrderNumber = 0;

    }


    lastOrderNumber += 1;


    localStorage.setItem(
        lastOrderNumberKey,
        lastOrderNumber
    );


    return (
        "PF-" +
        String(lastOrderNumber)
            .padStart(6, "0")
    );
}


// ============================================
// GET SAVED ORDERS
// ============================================

function getSavedOrders() {

    try {

        const savedOrders =
            localStorage.getItem(
                ordersStorageKey
            );


        if (!savedOrders) {
            return [];
        }


        const orders =
            JSON.parse(savedOrders);


        if (!Array.isArray(orders)) {
            return [];
        }


        return orders;

    }

    catch (error) {

        console.error(
            "Could not read saved orders:",
            error
        );


        return [];
    }
}


// ============================================
// SAVE ORDER
// ============================================

function saveOrder(order) {

    const orders =
        getSavedOrders();


    orders.push(order);


    try {

        localStorage.setItem(
            ordersStorageKey,
            JSON.stringify(orders)
        );


        console.log(
            "Order saved:",
            order
        );


    }

    catch (error) {

        console.error(
            "Could not save order:",
            error
        );


        alert(
            "The order could not be saved in this browser."
        );
    }
}


// ============================================
// SEND PRINT REQUEST
// ============================================

sendRequestButton.addEventListener(
    "click",
    function () {

        const file =
            fileInput.files[0];


        // ====================================
        // CHECK FILE
        // ====================================

        if (!file) {

            alert(
                "Please upload a document first."
            );

            return;
        }


        // ====================================
        // CHECK PAGE RANGE
        // ====================================

        const selectedPages =
            getSelectedPageCount();


        if (
            selectedPages === 0
        ) {

            alert(
                "Please enter a valid page selection."
            );

            pageRangeInput.focus();

            return;
        }


        // ====================================
        // GET ALL SETTINGS
        // ====================================

        const paperSize =
            getPaperSize();


        const printType =
            getPrintType();


        const printSides =
            getPrintSides();


        const copies =
            getCopies();


        const pageRange =
            pageRangeInput.value.trim() ||
            "All";


        const price =
            estimatedPrice.textContent;


        // ====================================
        // GENERATE ORDER NUMBER
        // ====================================

        const newOrderNumber =
            generateOrderNumber();


        // ====================================
        // CREATE ORDER DATE/TIME
        // ====================================

        const createdAt =
            new Date().toISOString();


        // ====================================
        // CREATE ORDER OBJECT
        // ====================================

        const order = {

            orderNumber:
                newOrderNumber,

            documentName:
                file.name,

            fileType:
                file.type,

            fileSize:
                file.size,

            totalPages:
                totalPages,

            selectedPages:
                selectedPages,

            pageRange:
                pageRange,

            copies:
                copies,

            paperSize:
                paperSize,

            printType:
                printType,

            printSides:
                printSides,

            estimatedPrice:
                price,

            status:
                "New",

            createdAt:
                createdAt
        };


        // ====================================
        // SAVE ORDER
        // ====================================

        saveOrder(order);


        // ====================================
        // SHOW CONFIRMATION NUMBER
        // ====================================

        orderNumber.textContent =
            newOrderNumber;


        // ====================================
        // SHOW CONFIRMATION DETAILS
        // ====================================

        confirmationFile.textContent =
            file.name;


        confirmationPages.textContent =
            selectedPages;


        confirmationCopies.textContent =
            copies;


        confirmationPrice.textContent =
            price;


        confirmationPaperSize.textContent =
            paperSize;


        confirmationPrintType.textContent =
            printType;


        confirmationPrintSides.textContent =
            printSides;


        // ====================================
        // SWITCH TO CONFIRMATION
        // ====================================

        printSettings.style.display =
            "none";


        confirmationSection.classList.add(
            "show"
        );


        // ====================================
        // SCROLL TO CONFIRMATION
        // ====================================

        confirmationSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });


        // ====================================
        // DEBUG
        // ====================================

        console.log(
            "PrintFlow order created:",
            order
        );

    }
);


// ============================================
// SEND ANOTHER REQUEST
// ============================================

newRequestButton.addEventListener(
    "click",
    function () {

        // ====================================
        // HIDE CONFIRMATION
        // ====================================

        confirmationSection.classList.remove(
            "show"
        );


        // ====================================
        // SHOW PRINT SETTINGS
        // ====================================

        printSettings.style.display =
            "";


        // ====================================
        // RESET FILE
        // ====================================

        fileInput.value = "";

        fileCard.classList.remove("show");


        fileName.textContent =
            "Document";


        fileInfo.textContent =
            "File selected";


        // ====================================
        // RESET PAGE COUNT
        // ====================================

        totalPages = 1;


        // ====================================
        // RESET COPIES
        // ====================================

        copiesInput.value =
            1;


        // ====================================
        // RESET PAGE RANGE
        // ====================================

        pageRangeInput.value =
            "All";


        // ====================================
        // RESET PAPER SIZE
        // ====================================

        const defaultPaperSize =
            document.querySelector(
                'input[name="paperSize"][value="A4"]'
            );


        if (defaultPaperSize) {

            defaultPaperSize.checked =
                true;

        }


        // ====================================
        // RESET PRINT TYPE
        // ====================================

        const defaultPrintType =
            document.querySelector(
                'input[name="printType"][value="B&W"]'
            );


        if (defaultPrintType) {

            defaultPrintType.checked =
                true;

        }


        // ====================================
        // RESET PRINT SIDES
        // ====================================

        const defaultPrintSides =
            document.querySelector(
                'input[name="printSides"][value="Single"]'
            );


        if (defaultPrintSides) {

            defaultPrintSides.checked =
                true;

        }


        // ====================================
        // RECALCULATE PRICE
        // ====================================

        calculatePrice();


        // ====================================
        // SCROLL TO SETTINGS
        // ====================================

        printSettings.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }
);


// ============================================
// PAPER SIZE EVENTS
// ============================================

document
    .querySelectorAll(
        'input[name="paperSize"]'
    )
    .forEach(
        function (input) {

            input.addEventListener(
                "change",
                calculatePrice
            );

        }
    );


// ============================================
// PRINT TYPE EVENTS
// ============================================

document
    .querySelectorAll(
        'input[name="printType"]'
    )
    .forEach(
        function (input) {

            input.addEventListener(
                "change",
                calculatePrice
            );

        }
    );


// ============================================
// PRINT SIDES EVENTS
// ============================================

document
    .querySelectorAll(
        'input[name="printSides"]'
    )
    .forEach(
        function (input) {

            input.addEventListener(
                "change",
                calculatePrice
            );

        }
    );


// ============================================
// COPIES EVENT
// ============================================

copiesInput.addEventListener(
    "input",
    calculatePrice
);


// ============================================
// PAGE RANGE EVENT
// ============================================

pageRangeInput.addEventListener(
    "input",
    calculatePrice
);


// ============================================
// INITIAL PRICE
// ============================================

calculatePrice();