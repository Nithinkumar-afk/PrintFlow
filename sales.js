// ============================================
// PRINTFLOW SALES & HISTORY
// SUPABASE VERSION
// ============================================


// ============================================
// DOM ELEMENTS
// ============================================

const filterButtons =
    document.querySelectorAll(
        ".sales-filter-button"
    );

const startDateInput =
    document.getElementById("startDate");

const endDateInput =
    document.getElementById("endDate");

const applyDateFilterButton =
    document.getElementById(
        "applyDateFilter"
    );

const salesTotal =
    document.getElementById(
        "salesTotal"
    );

const salesCompletedOrders =
    document.getElementById(
        "salesCompletedOrders"
    );

const salesCancelledOrders =
    document.getElementById(
        "salesCancelledOrders"
    );

const salesHistoryCount =
    document.getElementById(
        "salesHistoryCount"
    );

const salesHistoryList =
    document.getElementById(
        "salesHistoryList"
    );


// ============================================
// CURRENT FILTER
// ============================================

let currentPeriod =
    "today";


// ============================================
// ALL ORDERS FROM SUPABASE
// ============================================

let allOrders = [];


// ============================================
// SUPABASE ORDER → PAGE ORDER
// ============================================

function mapDatabaseOrder(order) {

    return {

        id:
            order.id,

        orderNumber:
            order.order_number,

        documentName:
            order.document_name,

        fileType:
            order.file_type,

        fileSize:
            order.file_size,

        totalPages:
            order.total_pages,

        selectedPages:
            order.selected_pages,

        pageRange:
            order.page_range,

        copies:
            order.copies,

        paperSize:
            order.paper_size,

        printType:
            order.print_type,

        printSides:
            order.print_sides,

        estimatedPrice:
            order.estimated_price,

        finalPrice:
            order.final_price,

        status:
            order.status,

        createdAt:
            order.created_at,

        printingStartedAt:
            order.printing_started_at,

        completedAt:
            order.completed_at,

        cancelledAt:
            order.cancelled_at
    };
}


// ============================================
// GET NUMERIC PRICE
// ============================================

function getNumericPrice(price) {

    if (
        typeof price === "number" &&
        Number.isFinite(price)
    ) {

        return price;
    }


    if (
        typeof price === "string"
    ) {

        const numericValue =
            Number(
                price
                    .replace("₹", "")
                    .replace(/,/g, "")
                    .trim()
            );


        if (
            Number.isFinite(
                numericValue
            )
        ) {

            return numericValue;
        }
    }


    return 0;
}


// ============================================
// FORMAT PRICE
// ============================================

function formatPrice(price) {

    const numericPrice =
        getNumericPrice(price);


    return (
        "₹" +
        numericPrice.toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 2
            }
        )
    );
}


// ============================================
// FORMAT DATE & TIME
// ============================================

function formatDateTime(dateString) {

    if (!dateString) {

        return "Unknown time";
    }


    const date =
        new Date(dateString);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Unknown time";
    }


    return date.toLocaleString(
        "en-IN",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );
}


// ============================================
// GET DATE ONLY
// ============================================

function getDateOnly(dateString) {

    if (!dateString) {

        return null;
    }


    const date =
        new Date(dateString);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return null;
    }


    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );
}


// ============================================
// CHECK DATE BETWEEN RANGE
// ============================================

function isDateBetween(
    dateString,
    startDate,
    endDate
) {

    const orderDate =
        getDateOnly(dateString);


    if (!orderDate) {

        return false;
    }


    return (
        orderDate >= startDate &&
        orderDate <= endDate
    );
}


// ============================================
// TODAY START
// ============================================

function getTodayStart() {

    const today =
        new Date();


    return new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );
}


// ============================================
// TODAY END
// ============================================

function getTodayEnd() {

    const today =
        new Date();


    return new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );
}


// ============================================
// CURRENT MONTH RANGE
// ============================================

function getCurrentMonthRange() {

    const today =
        new Date();


    const start =
        new Date(
            today.getFullYear(),
            today.getMonth(),
            1
        );


    const end =
        new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            0
        );


    return {

        start:
            start,

        end:
            end
    };
}


// ============================================
// CURRENT YEAR RANGE
// ============================================

function getCurrentYearRange() {

    const today =
        new Date();


    const start =
        new Date(
            today.getFullYear(),
            0,
            1
        );


    const end =
        new Date(
            today.getFullYear(),
            11,
            31
        );


    return {

        start:
            start,

        end:
            end
    };
}


// ============================================
// CUSTOM DATE RANGE
// ============================================

function getCustomDateRange() {

    const startValue =
        startDateInput.value;

    const endValue =
        endDateInput.value;


    if (
        !startValue ||
        !endValue
    ) {

        return null;
    }


    const startParts =
        startValue.split("-");

    const endParts =
        endValue.split("-");


    const start =
        new Date(
            Number(startParts[0]),
            Number(startParts[1]) - 1,
            Number(startParts[2])
        );


    const end =
        new Date(
            Number(endParts[0]),
            Number(endParts[1]) - 1,
            Number(endParts[2])
        );


    if (
        Number.isNaN(
            start.getTime()
        ) ||
        Number.isNaN(
            end.getTime()
        )
    ) {

        return null;
    }


    if (
        start > end
    ) {

        return null;
    }


    return {

        start:
            start,

        end:
            end
    };
}


// ============================================
// HISTORY DATE
// ============================================

function getHistoryDate(order) {

    return (
        order.completedAt ||
        order.cancelledAt ||
        order.createdAt
    );
}


// ============================================
// GET FILTERED ORDERS
// ============================================

function getFilteredOrders() {

    const historyOrders =
        allOrders.filter(
            function (order) {

                return (
                    order.status === "Completed" ||
                    order.status === "Cancelled"
                );
            }
        );


    // ========================================
    // TODAY
    // ========================================

    if (
        currentPeriod === "today"
    ) {

        const start =
            getTodayStart();

        const end =
            getTodayEnd();


        return historyOrders.filter(
            function (order) {

                return isDateBetween(
                    getHistoryDate(order),
                    start,
                    end
                );
            }
        );
    }


    // ========================================
    // MONTH
    // ========================================

    if (
        currentPeriod === "month"
    ) {

        const range =
            getCurrentMonthRange();


        return historyOrders.filter(
            function (order) {

                return isDateBetween(
                    getHistoryDate(order),
                    range.start,
                    range.end
                );
            }
        );
    }


    // ========================================
    // YEAR
    // ========================================

    if (
        currentPeriod === "year"
    ) {

        const range =
            getCurrentYearRange();


        return historyOrders.filter(
            function (order) {

                return isDateBetween(
                    getHistoryDate(order),
                    range.start,
                    range.end
                );
            }
        );
    }


    // ========================================
    // ALL TIME
    // ========================================

    return historyOrders;
}


// ============================================
// UPDATE SUMMARY
// ============================================

function updateSummary(orders) {

    const completedOrders =
        orders.filter(
            function (order) {

                return (
                    order.status === "Completed"
                );
            }
        );


    const cancelledOrders =
        orders.filter(
            function (order) {

                return (
                    order.status === "Cancelled"
                );
            }
        );


    const totalSales =
        completedOrders.reduce(
            function (total, order) {

                const price =
                    order.finalPrice !== null &&
                    order.finalPrice !== undefined
                        ? order.finalPrice
                        : order.estimatedPrice;


                return (
                    total +
                    getNumericPrice(price)
                );
            },
            0
        );


    salesTotal.textContent =
        formatPrice(totalSales);


    salesCompletedOrders.textContent =
        completedOrders.length;


    salesCancelledOrders.textContent =
        cancelledOrders.length;


    salesHistoryCount.textContent =
        `${orders.length} ${
            orders.length === 1
                ? "order"
                : "orders"
        }`;
}


// ============================================
// CREATE ELEMENT
// ============================================

function createElement(
    tag,
    className,
    text
) {

    const element =
        document.createElement(tag);


    if (className) {

        element.className =
            className;
    }


    if (
        text !== undefined
    ) {

        element.textContent =
            text;
    }


    return element;
}


// ============================================
// SHOW HISTORY ORDER DETAILS
// ============================================

function showHistoryOrderDetails(order) {

    const oldDetails =
        document.getElementById(
            "salesOrderDetailsPanel"
        );


    if (oldDetails) {

        oldDetails.remove();
    }


    // ========================================
    // OVERLAY
    // ========================================

    const overlay =
        createElement(
            "div",
            "sales-details-overlay"
        );


    overlay.id =
        "salesOrderDetailsPanel";


    // ========================================
    // PANEL
    // ========================================

    const panel =
        createElement(
            "div",
            "sales-details-panel"
        );


    // ========================================
    // HEADER
    // ========================================

    const header =
        createElement(
            "div",
            "sales-details-header"
        );


    const heading =
        createElement("div");


    const eyebrow =
        createElement(
            "p",
            "eyebrow",
            "HISTORY RECORD"
        );


    const title =
        createElement(
            "h2",
            null,
            order.orderNumber ||
            "Order"
        );


    const date =
        createElement(
            "span",
            "sales-details-date",
            formatDateTime(
                getHistoryDate(order)
            )
        );


    heading.appendChild(
        eyebrow
    );

    heading.appendChild(
        title
    );

    heading.appendChild(
        date
    );


    const closeButton =
        createElement(
            "button",
            "sales-details-close",
            "×"
        );


    closeButton.type =
        "button";


    closeButton.setAttribute(
        "aria-label",
        "Close order details"
    );


    header.appendChild(
        heading
    );

    header.appendChild(
        closeButton
    );


    // ========================================
    // STATUS
    // ========================================

    const statusRow =
        createElement(
            "div",
            "sales-details-status-row"
        );


    const statusLabel =
        createElement(
            "span",
            null,
            "Status"
        );


    const statusBadge =
        createElement(
            "span",
            "sales-details-status",
            order.status || "Unknown"
        );


    statusRow.appendChild(
        statusLabel
    );

    statusRow.appendChild(
        statusBadge
    );


    // ========================================
    // DOCUMENT
    // ========================================

    const documentBox =
        createElement(
            "div",
            "sales-details-document"
        );


    const documentIcon =
        createElement(
            "div",
            "sales-details-document-icon",
            "📄"
        );


    const documentInfo =
        createElement("div");


    const documentName =
        createElement(
            "strong",
            null,
            order.documentName ||
            "Document"
        );


    const pageCount =
        Number(
            order.totalPages || 1
        );


    const documentMeta =
        createElement(
            "span",
            null,
            `${pageCount} ${
                pageCount === 1
                    ? "page"
                    : "pages"
            }`
        );


    documentInfo.appendChild(
        documentName
    );

    documentInfo.appendChild(
        documentMeta
    );


    documentBox.appendChild(
        documentIcon
    );

    documentBox.appendChild(
        documentInfo
    );


    // ========================================
    // DETAILS TITLE
    // ========================================

    const settingsTitle =
        createElement(
            "h3",
            "sales-details-section-title",
            "Print Details"
        );


    // ========================================
    // DETAILS GRID
    // ========================================

    const detailsGrid =
        createElement(
            "div",
            "sales-details-grid"
        );


    function addDetail(
        label,
        value
    ) {

        const item =
            createElement(
                "div",
                "sales-detail-item"
            );


        const itemLabel =
            createElement(
                "span",
                null,
                label
            );


        const itemValue =
            createElement(
                "strong",
                null,
                value
            );


        item.appendChild(
            itemLabel
        );

        item.appendChild(
            itemValue
        );


        detailsGrid.appendChild(
            item
        );
    }


    addDetail(
        "Total Pages",
        String(
            order.totalPages || 1
        )
    );


    addDetail(
        "Pages to Print",
        order.pageRange || "All"
    );


    addDetail(
        "Copies",
        String(
            order.copies || 1
        )
    );


    addDetail(
        "Paper Size",
        order.paperSize || "A4"
    );


    addDetail(
        "Print Type",
        order.printType || "B&W"
    );


    addDetail(
        "Print Sides",
        order.printSides || "Single"
    );


    // ========================================
    // PRICE
    // ========================================

    const priceBox =
        createElement(
            "div",
            "sales-details-price"
        );


    const priceLabel =
        createElement(
            "span",
            null,
            order.status === "Cancelled"
                ? "Cancelled Amount"
                : "Final Total"
        );


    const selectedPrice =
        order.finalPrice !== null &&
        order.finalPrice !== undefined
            ? order.finalPrice
            : order.estimatedPrice;


    const priceValue =
        createElement(
            "strong",
            null,
            order.status === "Cancelled"
                ? "₹0"
                : formatPrice(
                    selectedPrice
                )
        );


    priceBox.appendChild(
        priceLabel
    );

    priceBox.appendChild(
        priceValue
    );


    // ========================================
    // CLOSE
    // ========================================

    function closeDetails() {

        overlay.remove();

        document.body.style.overflow =
            "";
    }


    closeButton.addEventListener(
        "click",
        closeDetails
    );


    overlay.addEventListener(
        "click",
        function (event) {

            if (
                event.target === overlay
            ) {

                closeDetails();
            }
        }
    );


    // ========================================
    // ACTIONS
    // ========================================

    const actions =
        createElement(
            "div",
            "sales-details-actions"
        );


    const backButton =
        createElement(
            "button",
            "sales-details-back-button",
            "CLOSE"
        );


    backButton.type =
        "button";


    backButton.addEventListener(
        "click",
        closeDetails
    );


    actions.appendChild(
        backButton
    );


    // ========================================
    // BUILD PANEL
    // ========================================

    panel.appendChild(
        header
    );

    panel.appendChild(
        statusRow
    );

    panel.appendChild(
        documentBox
    );

    panel.appendChild(
        settingsTitle
    );

    panel.appendChild(
        detailsGrid
    );

    panel.appendChild(
        priceBox
    );

    panel.appendChild(
        actions
    );


    overlay.appendChild(
        panel
    );


    document.body.appendChild(
        overlay
    );


    document.body.style.overflow =
        "hidden";
}


// ============================================
// CREATE HISTORY ROW
// ============================================

function createHistoryRow(order) {

    const row =
        createElement(
            "article",
            "sales-history-row"
        );


    // ========================================
    // ORDER INFO
    // ========================================

    const orderInfo =
        createElement(
            "div",
            "sales-history-order"
        );


    const number =
        createElement(
            "strong",
            null,
            order.orderNumber ||
            "Unknown Order"
        );


    const documentName =
        createElement(
            "span",
            null,
            order.documentName ||
            "Document"
        );


    orderInfo.appendChild(
        number
    );

    orderInfo.appendChild(
        documentName
    );


    // ========================================
    // SETTINGS
    // ========================================

    const settings =
        createElement(
            "div",
            "sales-history-settings"
        );


    const settingsText =
        createElement(
            "span",
            null,
            `${order.paperSize || "A4"} • ${
                order.printType || "B&W"
            } • ${
                order.printSides || "Single"
            }`
        );


    const copies =
        Number(
            order.copies || 1
        );


    const copiesText =
        createElement(
            "small",
            null,
            `${copies} ${
                copies === 1
                    ? "copy"
                    : "copies"
            }`
        );


    settings.appendChild(
        settingsText
    );

    settings.appendChild(
        copiesText
    );


    // ========================================
    // DATE
    // ========================================

    const date =
        createElement(
            "div",
            "sales-history-date",
            formatDateTime(
                getHistoryDate(order)
            )
        );


    // ========================================
    // STATUS
    // ========================================

    const status =
        createElement(
            "span",
            "sales-history-status",
            order.status ||
            "Unknown"
        );


    // ========================================
    // PRICE
    // ========================================

    const price =
        createElement(
            "strong"
        );


    if (
        order.status === "Cancelled"
    ) {

        price.textContent =
            "₹0";
    }

    else {

        const selectedPrice =
            order.finalPrice !== null &&
            order.finalPrice !== undefined
                ? order.finalPrice
                : order.estimatedPrice;


        price.textContent =
            formatPrice(
                selectedPrice
            );
    }


    // ========================================
    // VIEW BUTTON
    // ========================================

    const viewButton =
        createElement(
            "button",
            "sales-history-view-button",
            "VIEW"
        );


    viewButton.type =
        "button";


    viewButton.addEventListener(
        "click",
        function () {

            showHistoryOrderDetails(
                order
            );
        }
    );


    // ========================================
    // BUILD ROW
    // ========================================

    row.appendChild(
        orderInfo
    );

    row.appendChild(
        settings
    );

    row.appendChild(
        date
    );

    row.appendChild(
        status
    );

    row.appendChild(
        price
    );

    row.appendChild(
        viewButton
    );


    return row;
}


// ============================================
// RENDER HISTORY
// ============================================

function renderHistory(
    orders = null
) {

    const filteredOrders =
        orders ||
        getFilteredOrders();


    updateSummary(
        filteredOrders
    );


    salesHistoryList.innerHTML =
        "";


    // ========================================
    // EMPTY STATE
    // ========================================

    if (
        filteredOrders.length === 0
    ) {

        const empty =
            createElement(
                "div",
                "sales-empty-state"
            );


        const icon =
            createElement(
                "div",
                "empty-icon",
                "✓"
            );


        const title =
            createElement(
                "h3",
                null,
                "No sales records"
            );


        const message =
            createElement(
                "p",
                null,
                "Completed or cancelled orders for this period will appear here."
            );


        empty.appendChild(
            icon
        );

        empty.appendChild(
            title
        );

        empty.appendChild(
            message
        );


        salesHistoryList.appendChild(
            empty
        );


        return;
    }


    // ========================================
    // COPY BEFORE SORTING
    // ========================================

    const sortedOrders =
        [...filteredOrders];


    // ========================================
    // NEWEST FIRST
    // ========================================

    sortedOrders.sort(
        function (a, b) {

            return (
                new Date(
                    getHistoryDate(b)
                ) -
                new Date(
                    getHistoryDate(a)
                )
            );
        }
    );


    // ========================================
    // ADD ROWS
    // ========================================

    sortedOrders.forEach(
        function (order) {

            salesHistoryList.appendChild(
                createHistoryRow(
                    order
                )
            );
        }
    );
}


// ============================================
// LOAD ORDERS FROM SUPABASE
// ============================================

async function loadOrdersFromSupabase() {

    salesHistoryList.innerHTML = "";


    const loading =
        createElement(
            "div",
            "sales-empty-state"
        );


    loading.appendChild(
        createElement(
            "div",
            "empty-icon",
            "…"
        )
    );


    loading.appendChild(
        createElement(
            "h3",
            null,
            "Loading sales history"
        )
    );


    loading.appendChild(
        createElement(
            "p",
            null,
            "Getting orders from PrintFlow."
        )
    );


    salesHistoryList.appendChild(
        loading
    );


    try {

        // ====================================
        // CHECK SUPABASE
        // ====================================

        if (
            !window.supabaseClient
        ) {

            throw new Error(
                "Supabase client is not available."
            );
        }


        // ====================================
        // GET LOGGED-IN OWNER
        // ====================================

        const {
            data: sessionData,
            error: sessionError
        } =
            await window.supabaseClient
                .auth
                .getSession();


        if (sessionError) {

            throw new Error(
                sessionError.message
            );
        }


        if (
            !sessionData ||
            !sessionData.session
        ) {

            throw new Error(
                "Please log in as owner first."
            );
        }


        // ====================================
        // GET ORDERS
        // ====================================

        const {
            data,
            error
        } =
            await window.supabaseClient
                .from("orders")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            throw new Error(
                error.message
            );
        }


        // ====================================
        // MAP DATABASE DATA
        // ====================================

        allOrders =
            Array.isArray(data)
                ? data.map(
                    mapDatabaseOrder
                )
                : [];


        // ====================================
        // RENDER
        // ====================================

        renderHistory();


    }

    catch (error) {

        console.error(
            "Could not load sales history:",
            error
        );


        salesHistoryList.innerHTML =
            "";


        const empty =
            createElement(
                "div",
                "sales-empty-state"
            );


        empty.appendChild(
            createElement(
                "div",
                "empty-icon",
                "!"
            )
        );


        empty.appendChild(
            createElement(
                "h3",
                null,
                "Could not load sales history"
            )
        );


        empty.appendChild(
            createElement(
                "p",
                null,
                error.message ||
                "Something went wrong while loading orders."
            )
        );


        salesHistoryList.appendChild(
            empty
        );
    }
}


// ============================================
// FILTER BUTTONS
// ============================================

filterButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                filterButtons.forEach(
                    function (otherButton) {

                        otherButton.classList.remove(
                            "active"
                        );
                    }
                );


                button.classList.add(
                    "active"
                );


                currentPeriod =
                    button.dataset.period;


                renderHistory();
            }
        );
    }
);


// ============================================
// CUSTOM DATE FILTER
// ============================================

applyDateFilterButton.addEventListener(
    "click",
    function () {

        const range =
            getCustomDateRange();


        if (!range) {

            alert(
                "Please select a valid From and To date."
            );

            return;
        }


        filterButtons.forEach(
            function (button) {

                button.classList.remove(
                    "active"
                );
            }
        );


        const historyOrders =
            allOrders.filter(
                function (order) {

                    return (
                        order.status === "Completed" ||
                        order.status === "Cancelled"
                    );
                }
            );


        const filteredOrders =
            historyOrders.filter(
                function (order) {

                    return isDateBetween(
                        getHistoryDate(order),
                        range.start,
                        range.end
                    );
                }
            );


        renderHistory(
            filteredOrders
        );
    }
);


// ============================================
// INITIAL LOAD
// ============================================

loadOrdersFromSupabase();
