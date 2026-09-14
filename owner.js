const ordersList =
    document.getElementById("ordersList");

const newOrdersCount =
    document.getElementById("newOrdersCount");

const printingOrdersCount =
    document.getElementById("printingOrdersCount");

const completedOrdersCount =
    document.getElementById("completedOrdersCount");

const todaySales =
    document.getElementById("todaySales");

const orderCount =
    document.getElementById("orderCount");


// ============================================
// STORAGE KEY
// ============================================

const ordersStorageKey =
    "printFlowOrders";


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
            "Could not read orders:",
            error
        );

        return [];
    }
}


// ============================================
// SAVE ORDERS
// ============================================

function saveOrders(orders) {

    try {

        localStorage.setItem(
            ordersStorageKey,
            JSON.stringify(orders)
        );

    }

    catch (error) {

        console.error(
            "Could not save orders:",
            error
        );

    }
}


// ============================================
// FORMAT PRICE
// ============================================

function formatPrice(price) {

    if (
        typeof price === "number" &&
        Number.isFinite(price)
    ) {

        return "₹" + price;

    }


    return price || "₹0";
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
// CHECK TODAY
// ============================================

function isToday(dateString) {

    if (!dateString) {
        return false;
    }


    const orderDate =
        new Date(dateString);

    const today =
        new Date();


    return (
        orderDate.getDate() === today.getDate() &&
        orderDate.getMonth() === today.getMonth() &&
        orderDate.getFullYear() === today.getFullYear()
    );
}


// ============================================
// UPDATE DASHBOARD SUMMARY
// ============================================

function updateSummary(orders) {

    const newOrders =
        orders.filter(
            order =>
                order.status === "New"
        );


    const printingOrders =
        orders.filter(
            order =>
                order.status === "Printing"
        );


    const completedOrders =
        orders.filter(
            order =>
                order.status === "Completed"
        );


    const todayCompletedOrders =
        completedOrders.filter(
            order =>
                isToday(
                    order.completedAt ||
                    order.createdAt
                )
        );


    const sales =
        todayCompletedOrders.reduce(
            function (total, order) {

                return (
                    total +
                    getNumericPrice(
                        order.finalPrice ||
                        order.estimatedPrice
                    )
                );

            },
            0
        );


    newOrdersCount.textContent =
        newOrders.length;


    printingOrdersCount.textContent =
        printingOrders.length;


    completedOrdersCount.textContent =
        todayCompletedOrders.length;


    todaySales.textContent =
        "₹" + sales;


    const visibleOrders =
        orders.filter(
            order =>
                order.status !== "Completed" &&
                order.status !== "Cancelled"
        );


    orderCount.textContent =
        `${visibleOrders.length} ${
            visibleOrders.length === 1
                ? "order"
                : "orders"
        }`;
}


// ============================================
// CREATE ELEMENT HELPER
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
// CHANGE ORDER STATUS
// ============================================

function updateOrderStatus(
    orderNumber,
    newStatus
) {

    const orders =
        getSavedOrders();


    const orderIndex =
        orders.findIndex(
            order =>
                order.orderNumber ===
                orderNumber
        );


    if (
        orderIndex === -1
    ) {

        alert(
            "This order could not be found."
        );

        return false;
    }


    orders[orderIndex].status =
        newStatus;


    // ========================================
    // PRINTING TIMESTAMP
    // ========================================

    if (
        newStatus === "Printing"
    ) {

        orders[orderIndex].printingStartedAt =
            new Date().toISOString();

    }


    // ========================================
    // COMPLETION TIMESTAMP
    // ========================================

    if (
        newStatus === "Completed"
    ) {

        orders[orderIndex].completedAt =
            new Date().toISOString();


        orders[orderIndex].finalPrice =
            orders[orderIndex].finalPrice ||
            orders[orderIndex].estimatedPrice;

    }


    // ========================================
    // CANCELLATION TIMESTAMP
    // ========================================

    if (
        newStatus === "Cancelled"
    ) {

        orders[orderIndex].cancelledAt =
            new Date().toISOString();


        orders[orderIndex].finalPrice =
            0;

    }


    saveOrders(
        orders
    );


    return true;
}


// ============================================
// SHOW ORDER DETAILS
// ============================================

function showOrderDetails(order) {

    const oldDetails =
        document.getElementById(
            "orderDetailsPanel"
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
            "order-details-overlay"
        );


    overlay.id =
        "orderDetailsPanel";


    // ========================================
    // PANEL
    // ========================================

    const panel =
        createElement(
            "div",
            "order-details-panel"
        );


    // ========================================
    // HEADER
    // ========================================

    const header =
        createElement(
            "div",
            "order-details-header"
        );


    const headerInfo =
        createElement(
            "div"
        );


    const eyebrow =
        createElement(
            "p",
            "eyebrow",
            "ORDER DETAILS"
        );


    const title =
        createElement(
            "h2",
            null,
            order.orderNumber ||
            "Order"
        );


    const createdTime =
        createElement(
            "span",
            "order-details-date",
            formatDateTime(
                order.createdAt
            )
        );


    headerInfo.appendChild(
        eyebrow
    );

    headerInfo.appendChild(
        title
    );

    headerInfo.appendChild(
        createdTime
    );


    const closeButton =
        createElement(
            "button",
            "order-details-close",
            "×"
        );


    closeButton.type =
        "button";


    closeButton.setAttribute(
        "aria-label",
        "Close order details"
    );


    header.appendChild(
        headerInfo
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
            "order-details-status-row"
        );


    const statusLabel =
        createElement(
            "span",
            null,
            "Current Status"
        );


    const statusBadge =
        createElement(
            "span",
            "order-details-status",
            order.status || "New"
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
            "order-details-document"
        );


    const documentIcon =
        createElement(
            "div",
            "order-details-document-icon",
            "📄"
        );


    const documentInfo =
        createElement(
            "div"
        );


    const documentName =
        createElement(
            "strong",
            null,
            order.documentName ||
            "Document"
        );


    const documentMeta =
        createElement(
            "span",
            null,
            `${order.totalPages || 1} ${
                Number(order.totalPages || 1) === 1
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
    // SETTINGS GRID
    // ========================================

    const settingsTitle =
        createElement(
            "h3",
            "order-details-section-title",
            "Print Settings"
        );


    const settingsGrid =
        createElement(
            "div",
            "order-details-grid"
        );


    function addDetail(
        label,
        value
    ) {

        const item =
            createElement(
                "div",
                "order-detail-item"
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


        settingsGrid.appendChild(
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
            "order-details-price"
        );


    const priceLabel =
        createElement(
            "span",
            null,
            "Estimated Total"
        );


    const priceValue =
        createElement(
            "strong",
            null,
            order.status === "Cancelled"
                ? "₹0"
                : formatPrice(
                    order.finalPrice ||
                    order.estimatedPrice
                )
        );


    priceBox.appendChild(
        priceLabel
    );

    priceBox.appendChild(
        priceValue
    );


    // ========================================
    // NOTE
    // ========================================

    const note =
        createElement(
            "p",
            "order-details-note",
            "Recheck the customer's requested settings before printing."
        );


    // ========================================
    // ACTIONS
    // ========================================

    const actions =
        createElement(
            "div",
            "order-details-actions"
        );


    const backButton =
        createElement(
            "button",
            "order-details-back-button",
            "BACK TO ORDERS"
        );


    backButton.type =
        "button";


    // ========================================
    // CLOSE DETAILS
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


    backButton.addEventListener(
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
    // NEW ORDER
    // ========================================

    if (
        order.status === "New"
    ) {

        const printButton =
            createElement(
                "button",
                "order-details-print-button",
                "PRINT ORDER"
            );


        printButton.type =
            "button";


        printButton.addEventListener(
            "click",
            function () {

                const updated =
                    updateOrderStatus(
                        order.orderNumber,
                        "Printing"
                    );


                if (!updated) {
                    return;
                }


                closeDetails();

                renderOrders();

            }
        );


        actions.appendChild(
            backButton
        );

        actions.appendChild(
            printButton
        );

    }


    // ========================================
    // PRINTING ORDER
    // ========================================

    else if (
        order.status === "Printing"
    ) {

        const completeButton =
            createElement(
                "button",
                "order-details-complete-button",
                "MARK COMPLETED"
            );


        completeButton.type =
            "button";


        completeButton.addEventListener(
            "click",
            function () {

                const confirmed =
                    confirm(
                        `Mark order ${
                            order.orderNumber
                        } as completed?`
                    );


                if (!confirmed) {
                    return;
                }


                const updated =
                    updateOrderStatus(
                        order.orderNumber,
                        "Completed"
                    );


                if (!updated) {
                    return;
                }


                closeDetails();

                renderOrders();

            }
        );


        actions.appendChild(
            backButton
        );

        actions.appendChild(
            completeButton
        );

    }


    // ========================================
    // OTHER STATUS
    // ========================================

    else {

        actions.appendChild(
            backButton
        );

    }


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
        settingsGrid
    );

    panel.appendChild(
        priceBox
    );

    panel.appendChild(
        note
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
// CREATE ORDER CARD
// ============================================

function createOrderCard(order) {

    const card =
        createElement(
            "article",
            "owner-order-card"
        );


    // ========================================
    // HEADER
    // ========================================

    const header =
        createElement(
            "div",
            "owner-order-header"
        );


    const orderInfo =
        createElement(
            "div"
        );


    const orderNumberElement =
        createElement(
            "strong",
            null,
            order.orderNumber ||
            "Unknown Order"
        );


    const orderDate =
        createElement(
            "span",
            null,
            formatDateTime(
                order.createdAt
            )
        );


    orderInfo.appendChild(
        orderNumberElement
    );

    orderInfo.appendChild(
        orderDate
    );


    const status =
        createElement(
            "span",
            "order-status",
            order.status || "New"
        );


    header.appendChild(
        orderInfo
    );

    header.appendChild(
        status
    );


    // ========================================
    // DOCUMENT
    // ========================================

    const documentRow =
        createElement(
            "div",
            "owner-document-row"
        );


    const documentIcon =
        createElement(
            "span",
            "owner-document-icon",
            "📄"
        );


    const documentInfo =
        createElement(
            "div"
        );


    const documentName =
        createElement(
            "strong",
            null,
            order.documentName ||
            "Document"
        );


    const totalPages =
        Number(
            order.totalPages || 1
        );


    const documentMeta =
        createElement(
            "span",
            null,
            `${totalPages} ${
                totalPages === 1
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


    documentRow.appendChild(
        documentIcon
    );

    documentRow.appendChild(
        documentInfo
    );


    // ========================================
    // SETTINGS
    // ========================================

    const settings =
        createElement(
            "div",
            "owner-order-settings"
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
            "span",
            null,
            `${copies} ${
                copies === 1
                    ? "Copy"
                    : "Copies"
            }`
        );


    settings.appendChild(
        settingsText
    );

    settings.appendChild(
        copiesText
    );


    // ========================================
    // PRICE
    // ========================================

    const priceRow =
        createElement(
            "div",
            "owner-price-row"
        );


    const priceLabel =
        createElement(
            "span",
            null,
            "Estimated Total"
        );


    const price =
        createElement(
            "strong",
            null,
            formatPrice(
                order.finalPrice ||
                order.estimatedPrice
            )
        );


    priceRow.appendChild(
        priceLabel
    );

    priceRow.appendChild(
        price
    );


    // ========================================
    // ACTIONS
    // ========================================

    const actions =
        createElement(
            "div",
            "owner-order-actions"
        );


    const viewButton =
        createElement(
            "button",
            "owner-view-button",
            "VIEW ORDER"
        );


    viewButton.type =
        "button";


    const deleteButton =
        createElement(
            "button",
            "owner-delete-button",
            "DELETE"
        );


    deleteButton.type =
        "button";


    // ========================================
    // VIEW ORDER
    // ========================================

    viewButton.addEventListener(
        "click",
        function () {

            showOrderDetails(
                order
            );

        }
    );


    // ========================================
    // CANCEL ORDER
    // ========================================

    deleteButton.addEventListener(
        "click",
        function () {

            const shouldCancel =
                confirm(
                    `Cancel order ${
                        order.orderNumber
                    }?\n\n` +
                    "The order will remain in Sales History as Cancelled."
                );


            if (!shouldCancel) {
                return;
            }


            const updated =
                updateOrderStatus(
                    order.orderNumber,
                    "Cancelled"
                );


            if (!updated) {
                return;
            }


            renderOrders();

        }
    );


    actions.appendChild(
        viewButton
    );

    actions.appendChild(
        deleteButton
    );


    // ========================================
    // BUILD CARD
    // ========================================

    card.appendChild(
        header
    );

    card.appendChild(
        documentRow
    );

    card.appendChild(
        settings
    );

    card.appendChild(
        priceRow
    );

    card.appendChild(
        actions
    );


    return card;
}


// ============================================
// RENDER ORDERS
// ============================================

function renderOrders() {

    document.body.style.overflow =
        "";


    const orders =
        getSavedOrders();


    updateSummary(
        orders
    );


    ordersList.innerHTML =
        "";


    // ========================================
    // ACTIVE ORDERS ONLY
    // ========================================

    const activeOrders =
        orders.filter(
            order =>
                order.status !== "Completed" &&
                order.status !== "Cancelled"
        );


    // ========================================
    // EMPTY STATE
    // ========================================

    if (
        activeOrders.length === 0
    ) {

        const emptyState =
            createElement(
                "div",
                "empty-orders"
            );


        const emptyIcon =
            createElement(
                "div",
                "empty-icon",
                "✓"
            );


        const emptyTitle =
            createElement(
                "h3",
                null,
                "No new orders"
            );


        const emptyText =
            createElement(
                "p",
                null,
                "New customer print requests will appear here."
            );


        emptyState.appendChild(
            emptyIcon
        );

        emptyState.appendChild(
            emptyTitle
        );

        emptyState.appendChild(
            emptyText
        );


        ordersList.appendChild(
            emptyState
        );


        return;
    }


    // ========================================
    // NEWEST FIRST
    // ========================================

    activeOrders.sort(
        function (a, b) {

            return (
                new Date(b.createdAt) -
                new Date(a.createdAt)
            );

        }
    );


    // ========================================
    // ADD ORDER CARDS
    // ========================================

    activeOrders.forEach(
        function (order) {

            const card =
                createOrderCard(
                    order
                );


            ordersList.appendChild(
                card
            );

        }
    );
}


// ============================================
// INITIAL LOAD
// ============================================

renderOrders();