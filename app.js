// ============================================
// PRINTFLOW CUSTOMER APP
// ============================================

// PDF.js is stored locally in the project.
import * as pdfjsLib from "./pdfjs/pdf.min.mjs";


// ============================================
// HTML ELEMENTS
// ============================================

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


// ============================================
// SUPABASE CHECK
// ============================================

function getSupabaseClient() {

    if (!window.supabase) {

        throw new Error(
            "Supabase library is not loaded."
        );
    }


    if (!window.supabaseClient) {

        throw new Error(
            "Supabase client is not configured."
        );
    }


    return window.supabaseClient;
}


// ============================================
// BASIC SETTINGS
// ============================================

let totalPages = 1;


const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png"
];


const maxFileSize =
    25 * 1024 * 1024;


// ============================================
// CHECK PDF
// ============================================

function isPdfFile(file) {

    if (!file) {
        return false;
    }


    if (
        file.type ===
        "application/pdf"
    ) {

        return true;
    }


    return (
        file.name
            .toLowerCase()
            .endsWith(".pdf")
    );
}


// ============================================
// CHECK SUPPORTED FILE
// ============================================

function isSupportedFile(file) {

    if (!file) {
        return false;
    }


    if (
        allowedTypes.includes(
            file.type
        )
    ) {

        return true;
    }


    const fileName =
        file.name.toLowerCase();


    return (
        fileName.endsWith(".pdf") ||
        fileName.endsWith(".jpg") ||
        fileName.endsWith(".jpeg") ||
        fileName.endsWith(".png")
    );
}


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
// FILE SELECTION
// ============================================

fileInput.addEventListener(
    "change",
    async function () {

        const file =
            fileInput.files[0];


        if (!file) {
            return;
        }


        // ========================================
        // TYPE CHECK
        // ========================================

        if (
            !isSupportedFile(file)
        ) {

            alert(
                "Unsupported file type.\n\n" +
                "Please select a PDF, JPG, JPEG, or PNG file."
            );


            resetSelectedFile();

            return;
        }


        // ========================================
        // SIZE CHECK
        // ========================================

        if (
            file.size > maxFileSize
        ) {

            alert(
                "This file is too large.\n\n" +
                "Maximum file size is 25 MB."
            );


            resetSelectedFile();

            return;
        }


        // ========================================
        // PDF PAGE COUNT
        // ========================================

        if (
            isPdfFile(file)
        ) {

            try {

                const arrayBuffer =
                    await file.arrayBuffer();


                console.log(
                    "Reading PDF:",
                    file.name
                );


                // ==================================
                // IMPORTANT:
                // Disable PDF worker.
                // This avoids GitHub Pages worker
                // loading problems.
                // ==================================

                const loadingTask =
                    pdfjsLib.getDocument({
                        data: arrayBuffer,
                        disableWorker: true
                    });


                const pdf =
                    await loadingTask.promise;


                totalPages =
                    pdf.numPages;


                console.log(
                    "PDF page count:",
                    totalPages
                );


                if (
                    !totalPages ||
                    totalPages < 1
                ) {

                    throw new Error(
                        "PDF has no readable pages."
                    );
                }

            }

            catch (error) {

                console.error(
                    "PDF reading failed:",
                    error
                );


                let errorMessage =
                    "We couldn't read this PDF.\n\n" +
                    "Please try another PDF file.";


                if (
                    error &&
                    error.message
                ) {

                    console.error(
                        "PDF.js error message:",
                        error.message
                    );
                }


                alert(
                    errorMessage
                );


                resetSelectedFile();

                return;
            }

        }

        else {

            totalPages =
                1;
        }


        // ========================================
        // DISPLAY FILE
        // ========================================

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
            isPdfFile(file)
        ) {

            fileType =
                "PDF";

        }

        else if (
            file.type ===
                "image/jpeg" ||
            file.name
                .toLowerCase()
                .endsWith(".jpg") ||
            file.name
                .toLowerCase()
                .endsWith(".jpeg")
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


        fileCard.classList.add(
            "show"
        );


        pageRangeInput.value =
            "All";


        calculatePrice();
    }
);


// ============================================
// RESET FILE
// ============================================

function resetSelectedFile() {

    fileInput.value =
        "";


    fileCard.classList.remove(
        "show"
    );


    fileName.textContent =
        "Document";


    fileInfo.textContent =
        "File selected";


    totalPages =
        1;


    pageRangeInput.value =
        "All";


    calculatePrice();
}


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

        copies =
            1;
    }


    if (
        copies > 100
    ) {

        copies =
            100;
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
    // ========================================

    const rangeMatch =
        value.match(
            /^(\d+)\s*-\s*(\d+)$/
        );


    if (
        rangeMatch
    ) {

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

            return (
                end -
                start +
                1
            );
        }


        return 0;
    }


    // ========================================
    // INDIVIDUAL PAGES
    // ========================================

    const pages =
        value
            .split(",")
            .map(
                page =>
                    page.trim()
            )
            .filter(
                page =>
                    /^\d+$/.test(page)
            );


    if (
        pages.length > 0
    ) {

        const pageNumbers =
            pages.map(
                page =>
                    Number(page)
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


    if (
        paperSize === "A4" &&
        printType === "B&W"
    ) {

        pricePerPage =
            2;
    }

    else if (
        paperSize === "A4" &&
        printType === "Color"
    ) {

        pricePerPage =
            10;
    }

    else if (
        paperSize === "A3" &&
        printType === "B&W"
    ) {

        pricePerPage =
            4;
    }

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

    const timestamp =
        Date.now()
            .toString()
            .slice(-7);


    const randomNumber =
        Math.floor(
            100 +
            Math.random() * 900
        );


    return (
        "PF-" +
        timestamp +
        randomNumber
    );
}


// ============================================
// SAVE ORDER TO SUPABASE
// ============================================

async function saveOrderOnline(order) {

    const supabase =
        getSupabaseClient();


    const orderData = {

        order_number:
            order.orderNumber,

        document_name:
            order.documentName,

        file_type:
            order.fileType,

        file_size:
            order.fileSize,

        total_pages:
            order.totalPages,

        selected_pages:
            order.selectedPages,

        page_range:
            order.pageRange,

        copies:
            order.copies,

        paper_size:
            order.paperSize,

        print_type:
            order.printType,

        print_sides:
            order.printSides,

        estimated_price:
            order.estimatedPrice,

        status:
            "New"
    };


    console.log(
        "Sending order to Supabase:",
        orderData
    );


    const response =
        await supabase
            .from("orders")
            .insert(
                orderData
            );


    if (
        response.error
    ) {

        console.error(
            "Supabase rejected order:",
            response.error
        );


        throw new Error(
            response.error.message ||
            "Supabase rejected the order."
        );
    }


    console.log(
        "Order successfully saved in Supabase:",
        order.orderNumber
    );
}


// ============================================
// SEND PRINT REQUEST
// ============================================

sendRequestButton.addEventListener(
    "click",
    async function () {

        const file =
            fileInput.files[0];


        // ========================================
        // CHECK FILE
        // ========================================

        if (!file) {

            alert(
                "Please upload a document first."
            );

            return;
        }


        // ========================================
        // CHECK PAGE RANGE
        // ========================================

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


        // ========================================
        // CHECK SUPABASE
        // ========================================

        try {

            getSupabaseClient();

        }

        catch (error) {

            console.error(
                error
            );


            alert(
                "PrintFlow could not connect to the online service.\n\n" +
                "Please check your Supabase configuration."
            );


            return;
        }


        // ========================================
        // GET SETTINGS
        // ========================================

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


        const priceText =
            estimatedPrice.textContent;


        if (
            priceText ===
            "Invalid"
        ) {

            alert(
                "Please correct the print settings before sending."
            );


            return;
        }


        const numericPrice =
            Number(
                priceText
                    .replace(
                        "₹",
                        ""
                    )
                    .trim()
            );


        // ========================================
        // CREATE ORDER
        // ========================================

        const order = {

            orderNumber:
                generateOrderNumber(),

            documentName:
                file.name,

            fileType:
                isPdfFile(file)
                    ? "application/pdf"
                    : file.type,

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
                numericPrice,

            status:
                "New",

            createdAt:
                new Date().toISOString()
        };


        // ========================================
        // BUTTON LOADING STATE
        // ========================================

        sendRequestButton.disabled =
            true;


        sendRequestButton.textContent =
            "Sending...";


        try {

            // ====================================
            // SAVE ONLINE
            // ====================================

            await saveOrderOnline(
                order
            );


            // ====================================
            // CUSTOMER CONFIRMATION
            // ====================================

            orderNumber.textContent =
                order.orderNumber;


            confirmationFile.textContent =
                order.documentName;


            confirmationPages.textContent =
                order.selectedPages;


            confirmationCopies.textContent =
                order.copies;


            confirmationPrice.textContent =
                priceText;


            confirmationPaperSize.textContent =
                order.paperSize;


            confirmationPrintType.textContent =
                order.printType;


            confirmationPrintSides.textContent =
                order.printSides;


            // ====================================
            // HIDE SETTINGS
            // ====================================

            printSettings.style.display =
                "none";


            // ====================================
            // SHOW CONFIRMATION
            // ====================================

            confirmationSection.classList.add(
                "show"
            );


            confirmationSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }

        catch (error) {

            console.error(
                "PrintFlow order submission failed:",
                error
            );


            alert(
                "We couldn't send your print request.\n\n" +
                (
                    error.message ||
                    "Please try again."
                )
            );

        }

        finally {

            sendRequestButton.disabled =
                false;


            sendRequestButton.textContent =
                "Send Print Request";
        }

    }
);


// ============================================
// SEND ANOTHER REQUEST
// ============================================

newRequestButton.addEventListener(
    "click",
    function () {

        // ========================================
        // HIDE CONFIRMATION
        // ========================================

        confirmationSection.classList.remove(
            "show"
        );


        // ========================================
        // SHOW SETTINGS
        // ========================================

        printSettings.style.display =
            "";


        // ========================================
        // RESET FILE
        // ========================================

        resetSelectedFile();


        // ========================================
        // RESET COPIES
        // ========================================

        copiesInput.value =
            1;


        // ========================================
        // RESET PAGE RANGE
        // ========================================

        pageRangeInput.value =
            "All";


        // ========================================
        // RESET PAPER
        // ========================================

        const defaultPaperSize =
            document.querySelector(
                'input[name="paperSize"][value="A4"]'
            );


        if (
            defaultPaperSize
        ) {

            defaultPaperSize.checked =
                true;
        }


        // ========================================
        // RESET PRINT TYPE
        // ========================================

        const defaultPrintType =
            document.querySelector(
                'input[name="printType"][value="B&W"]'
            );


        if (
            defaultPrintType
        ) {

            defaultPrintType.checked =
                true;
        }


        // ========================================
        // RESET PRINT SIDES
        // ========================================

        const defaultPrintSides =
            document.querySelector(
                'input[name="printSides"][value="Single"]'
            );


        if (
            defaultPrintSides
        ) {

            defaultPrintSides.checked =
                true;
        }


        calculatePrice();


        // ========================================
        // SCROLL
        // ========================================

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
