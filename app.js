// ============================================
// PRINTFLOW CUSTOMER APP
// ============================================


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
// PDF.JS CHECK
// ============================================

if (
    typeof window.pdfjsLib === "undefined"
) {

    console.error(
        "PDF.js was not loaded."
    );

    alert(
        "PrintFlow PDF service could not load.\n\n" +
        "Please refresh the page and try again."
    );
}


// ============================================
// PDF.JS WORKER
// ============================================

if (
    typeof window.pdfjsLib !== "undefined"
) {

    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}


// ============================================
// SUPABASE
// ============================================

function getSupabaseClient() {

    if (
        !window.supabaseClient
    ) {

        throw new Error(
            "Supabase client is not configured."
        );
    }


    return window.supabaseClient;
}


// ============================================
// BASIC VARIABLES
// ============================================

let totalPages =
    1;


const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png"
];


const maxFileSize =
    25 * 1024 * 1024;


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


        console.log(
            "Selected file:",
            file.name,
            file.type,
            file.size
        );


        // ====================================
        // FILE TYPE
        // ====================================

        const fileNameLower =
            file.name.toLowerCase();


        const isPDF =
            file.type === "application/pdf" ||
            fileNameLower.endsWith(".pdf");


        const isJPG =
            file.type === "image/jpeg" ||
            fileNameLower.endsWith(".jpg") ||
            fileNameLower.endsWith(".jpeg");


        const isPNG =
            file.type === "image/png" ||
            fileNameLower.endsWith(".png");


        if (
            !isPDF &&
            !isJPG &&
            !isPNG
        ) {

            alert(
                "Unsupported file type.\n\n" +
                "Please select a PDF, JPG, JPEG, or PNG file."
            );


            resetSelectedFile();

            return;
        }


        // ====================================
        // FILE SIZE
        // ====================================

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


        // ====================================
        // PDF PAGE COUNT
        // ====================================

        if (isPDF) {

            try {

                if (
                    typeof window.pdfjsLib ===
                    "undefined"
                ) {

                    throw new Error(
                        "PDF.js is unavailable."
                    );
                }


                console.log(
                    "Reading PDF..."
                );


                const arrayBuffer =
                    await file.arrayBuffer();


                const pdfData =
                    new Uint8Array(
                        arrayBuffer
                    );


                console.log(
                    "PDF bytes:",
                    pdfData.length
                );


                const loadingTask =
                    window.pdfjsLib.getDocument({
                        data: pdfData
                    });


                const pdf =
                    await loadingTask.promise;


                totalPages =
                    Number(
                        pdf.numPages
                    );


                console.log(
                    "PDF pages:",
                    totalPages
                );


                if (
                    !Number.isInteger(
                        totalPages
                    ) ||
                    totalPages < 1
                ) {

                    throw new Error(
                        "The PDF has no readable pages."
                    );
                }


            }

            catch (error) {

                console.error(
                    "PDF READ ERROR:",
                    error
                );


                console.error(
                    "PDF error name:",
                    error?.name
                );


                console.error(
                    "PDF error message:",
                    error?.message
                );


                alert(
                    "This PDF could not be read.\n\n" +
                    "Please try another PDF."
                );


                resetSelectedFile();

                return;
            }

        }

        else {

            totalPages =
                1;
        }


        // ====================================
        // FILE DISPLAY
        // ====================================

        let displayType =
            "File";


        if (isPDF) {

            displayType =
                "PDF";
        }

        else if (isJPG) {

            displayType =
                "JPG";
        }

        else if (isPNG) {

            displayType =
                "PNG";
        }


        const sizeInMB =
            (
                file.size /
                (1024 * 1024)
            ).toFixed(2);


        fileName.textContent =
            file.name;


        fileInfo.textContent =
            `${displayType} • ${sizeInMB} MB • ${totalPages} ${
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


        console.log(
            "File successfully accepted."
        );

    }
);


// ============================================
// PAPER SIZE
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
// PRINT TYPE
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
// PRINT SIDES
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
// COPIES
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
        Math.floor(
            copies
        );


    copiesInput.value =
        copies;


    return copies;
}


// ============================================
// SELECTED PAGE COUNT
// ============================================

function getSelectedPageCount() {

    const value =
        pageRangeInput.value.trim();


    if (
        value === "" ||
        value.toLowerCase() === "all"
    ) {

        return totalPages;
    }


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

            return (
                end -
                start +
                1
            );
        }


        return 0;
    }


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
// PRICE
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
// ORDER NUMBER
// ============================================

function generateOrderNumber() {

    const timestamp =
        Date.now()
            .toString()
            .slice(-6);


    const random =
        Math.floor(
            100 +
            Math.random() * 900
        );


    return (
        "PF-" +
        timestamp +
        random
    );
}


// ============================================
// SAVE ORDER ONLINE
// ============================================

async function saveOrderOnline(order) {

    const supabase =
        getSupabaseClient();


    const {
        error
    } =
        await supabase
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
                    "New"

            });


    if (error) {

        console.error(
            "Supabase error:",
            error
        );


        throw new Error(
            error.message
        );
    }


    console.log(
        "Order successfully saved:",
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


        if (!file) {

            alert(
                "Please upload a document first."
            );

            return;
        }


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


        try {

            getSupabaseClient();

        }

        catch (error) {

            console.error(
                error
            );


            alert(
                error.message
            );


            return;
        }


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
                "Please correct the print settings."
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


        const order = {

            orderNumber:
                generateOrderNumber(),

            documentName:
                file.name,

            fileType:
                file.type ||
                "application/octet-stream",

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
                "New"

        };


        sendRequestButton.disabled =
            true;


        sendRequestButton.textContent =
            "Sending...";


        try {

            await saveOrderOnline(
                order
            );


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


            printSettings.style.display =
                "none";


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
                "Order submission failed:",
                error
            );


            alert(
                "We couldn't send your print request.\n\n" +
                error.message
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
// NEW REQUEST
// ============================================

newRequestButton.addEventListener(
    "click",
    function () {

        confirmationSection.classList.remove(
            "show"
        );


        printSettings.style.display =
            "";


        resetSelectedFile();


        copiesInput.value =
            1;


        pageRangeInput.value =
            "All";


        const paper =
            document.querySelector(
                'input[name="paperSize"][value="A4"]'
            );


        if (paper) {

            paper.checked =
                true;
        }


        const type =
            document.querySelector(
                'input[name="printType"][value="B&W"]'
            );


        if (type) {

            type.checked =
                true;
        }


        const sides =
            document.querySelector(
                'input[name="printSides"][value="Single"]'
            );


        if (sides) {

            sides.checked =
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
// SETTINGS EVENTS
// ============================================

document
    .querySelectorAll(
        'input[name="paperSize"]'
    )
    .forEach(
        input =>
            input.addEventListener(
                "change",
                calculatePrice
            )
    );


document
    .querySelectorAll(
        'input[name="printType"]'
    )
    .forEach(
        input =>
            input.addEventListener(
                "change",
                calculatePrice
            )
    );


document
    .querySelectorAll(
        'input[name="printSides"]'
    )
    .forEach(
        input =>
            input.addEventListener(
                "change",
                calculatePrice
            )
    );


copiesInput.addEventListener(
    "input",
    calculatePrice
);


pageRangeInput.addEventListener(
    "input",
    calculatePrice
);


// ============================================
// INITIAL PRICE
// ============================================

calculatePrice();
