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

if (
    typeof supabaseClient === "undefined"
) {

    console.error(
        "Supabase is not configured correctly."
    );

    alert(
        "PrintFlow could not connect to the online service."
    );
}


// ============================================
// BASIC VARIABLES
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

        if (
            file.type ===
            "application/pdf"
        ) {

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


    if (
        copies > 100
    ) {

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
    // ALL
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

    const timestampPart =
        Date.now()
            .toString()
            .slice(-6);


    const randomPart =
        Math.floor(
            100 +
            Math.random() * 900
        );


    return (
        "PF-" +
        timestampPart +
        randomPart
    );
}


// ============================================
// SAVE ORDER ONLINE
// ============================================

async function saveOrderOnline(order) {

    if (
        typeof supabaseClient ===
        "undefined"
    ) {

        throw new Error(
            "Supabase client is not available."
        );
    }


    const { data, error } =
        await supabaseClient
            .from("orders")
            .insert({
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
                    order.status
            })
            .select()
            .single();


    if (error) {

        console.error(
            "Supabase order error:",
            error
        );


        throw error;
    }


    console.log(
        "Online order created:",
        data
    );


    return data;
}


// ============================================
// SEND PRINT REQUEST
// ============================================

sendRequestButton.addEventListener(
    "click",
    async function () {

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
        // GET SETTINGS
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


        const priceText =
            estimatedPrice.textContent;


        if (
            priceText === "Invalid"
        ) {

            alert(
                "Please correct the print settings before sending."
            );

            return;
        }


        const numericPrice =
            Number(
                priceText
                    .replace("₹", "")
                    .trim()
            );


        // ====================================
        // GENERATE ORDER NUMBER
        // ====================================

        const newOrderNumber =
            generateOrderNumber();


        // ====================================
        // CREATE ORDER
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
                numericPrice,

            status:
                "New",

            createdAt:
                new Date().toISOString()
        };


        // ====================================
        // SEND TO SUPABASE
        // ====================================

        sendRequestButton.disabled =
            true;


        sendRequestButton.textContent =
            "Sending...";


        try {

            await saveOrderOnline(
                order
            );


            // ==================================
            // SHOW CONFIRMATION
            // ==================================

            orderNumber.textContent =
                newOrderNumber;


            confirmationFile.textContent =
                file.name;


            confirmationPages.textContent =
                selectedPages;


            confirmationCopies.textContent =
                copies;


            confirmationPrice.textContent =
                priceText;


            confirmationPaperSize.textContent =
                paperSize;


            confirmationPrintType.textContent =
                printType;


            confirmationPrintSides.textContent =
                printSides;


            printSettings.style.display =
                "none";


            confirmationSection.classList.add(
                "show"
            );


            confirmationSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });


            console.log(
                "PrintFlow online order:",
                order
            );

        }

        catch (error) {

            console.error(
                "Order submission failed:",
                error
            );


            alert(
                "We couldn't send your print request.\n\n" +
                "Please check your internet connection and try again."
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

        confirmationSection.classList.remove(
            "show"
        );


        printSettings.style.display =
            "";


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


        copiesInput.value =
            1;


        pageRangeInput.value =
            "All";


        const defaultPaperSize =
            document.querySelector(
                'input[name="paperSize"][value="A4"]'
            );


        if (defaultPaperSize) {

            defaultPaperSize.checked =
                true;

        }


        const defaultPrintType =
            document.querySelector(
                'input[name="printType"][value="B&W"]'
            );


        if (defaultPrintType) {

            defaultPrintType.checked =
                true;

        }


        const defaultPrintSides =
            document.querySelector(
                'input[name="printSides"][value="Single"]'
            );


        if (defaultPrintSides) {

            defaultPrintSides.checked =
                true;

        }


        calculatePrice();


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
