// ============================================
// PRINTFLOW OWNER DASHBOARD
// ============================================


// ============================================
// DOM ELEMENTS
// ============================================

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
// SUPABASE
// ============================================

let supabaseClient = null;

let refreshTimer = null;

let isLoadingOrders = false;


// ============================================
// LOAD SUPABASE LIBRARY
// ============================================

function loadScript(src) {

    return new Promise(
        function (resolve, reject) {

            const existingScript =
                document.querySelector(
                    `script[src="${src}"]`
                );


            if (existingScript) {

                if (
                    existingScript.dataset.loaded ===
                    "true"
                ) {

                    resolve();

                    return;
                }


                existingScript.addEventListener(
                    "load",
                    resolve,
                    {
                        once: true
                    }
                );


                existingScript.addEventListener(
                    "error",
                    reject,
                    {
                        once: true
                    }
                );


                return;
            }


            const script =
                document.createElement(
                    "script"
                );


            script.src =
                src;


            script.async =
                false;


            script.addEventListener(
                "load",
                function () {

                    script.dataset.loaded =
                        "true";

                    resolve();

                },
                {
                    once: true
                }
            );


            script.addEventListener(
                "error",
                function () {

                    reject(
                        new Error(
                            "Could not load Supabase."
                        )
                    );

                },
                {
                    once: true
                }
            );


            document.head.appendChild(
                script
            );

        }
    );
}


// ============================================
// INITIALIZE SUPABASE
// ============================================

async function initializeSupabase() {

    try {

        // ========================================
        // LOAD SUPABASE LIBRARY
        // ========================================

        if (
            typeof window.supabase ===
            "undefined"
        ) {

            await loadScript(
                "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"
            );

        }


        // ========================================
        // LOAD CONFIG
        // ========================================

        if (
            typeof window.supabaseClient ===
            "undefined"
        ) {

            const configScript =
                document.querySelector(
                    'script[src^="supabase-config.js"]'
                );


            if (
                !configScript
            ) {

                await loadScript(
                    "supabase-config.js"
                );

            }


            // Give the configuration script
            // a moment to initialize.

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        100
                    )
            );

        }


        if (
            typeof window.supabaseClient ===
            "undefined"
        ) {

            throw new Error(
                "Supabase configuration could not be loaded."
            );

        }


        supabaseClient =
            window.supabaseClient;


        console.log(
            "PrintFlow owner Supabase connected."
        );


        return true;

    }

    catch (error) {

        console.error(
            "Supabase initialization failed:",
            error
        );


        return false;
    }
}


// ============================================
// LOGIN SCREEN
// ============================================

function showLoginScreen() {

    const existing =
        document.getElementById(
            "printFlowOwnerLogin"
        );


    if (
        existing
    ) {

        return;
    }


    const overlay =
        document.createElement(
            "div"
        );


    overlay.id =
        "printFlowOwnerLogin";


    overlay.style.position =
        "fixed";

    overlay.style.inset =
        "0";

    overlay.style.zIndex =
        "99999";

    overlay.style.display =
        "flex";

    overlay.style.alignItems =
        "center";

    overlay.style.justifyContent =
        "center";

    overlay.style.padding =
        "20px";

    overlay.style.background =
        "rgba(17, 24, 39, 0.92)";


    const card =
        document.createElement(
            "div"
        );


    card.style.width =
        "100%";

    card.style.maxWidth =
        "420px";

    card.style.padding =
        "30px";

    card.style.background =
        "white";

    card.style.borderRadius =
        "16px";

    card.style.boxShadow =
        "0 20px 60px rgba(0,0,0,0.25)";


    const eyebrow =
        document.createElement(
            "p"
        );


    eyebrow.textContent =
        "PRINTFLOW OWNER";


    eyebrow.style.marginBottom =
        "10px";

    eyebrow.style.fontSize =
        "12px";

    eyebrow.style.fontWeight =
        "700";

    eyebrow.style.letterSpacing =
        "2px";

    eyebrow.style.color =
        "#6b7280";


    const title =
        document.createElement(
            "h2"
        );


    title.textContent =
        "Owner Login";


    title.style.marginBottom =
        "10px";

    title.style.color =
        "#111827";


    const description =
        document.createElement(
            "p"
        );


    description.textContent =
        "Sign in to view and manage customer print orders.";

    description.style.marginBottom =
        "24px";

    description.style.color =
        "#6b7280";

    description.style.lineHeight =
        "1.6";


    const emailInput =
        document.createElement(
            "input"
        );


    emailInput.type =
        "email";

    emailInput.placeholder =
        "Owner email";

    emailInput.autocomplete =
        "username";

    emailInput.style.width =
        "100%";

    emailInput.style.padding =
        "14px";

    emailInput.style.marginBottom =
        "12px";

    emailInput.style.border =
        "1px solid #d1d5db";

    emailInput.style.borderRadius =
        "10px";

    emailInput.style.fontSize =
        "15px";


    const passwordInput =
        document.createElement(
            "input"
        );


    passwordInput.type =
        "password";

    passwordInput.placeholder =
        "Password";

    passwordInput.autocomplete =
        "current-password";

    passwordInput.style.width =
        "100%";

    passwordInput.style.padding =
        "14px";

    passwordInput.style.marginBottom =
        "12px";

    passwordInput.style.border =
        "1px solid #d1d5db";

    passwordInput.style.borderRadius =
        "10px";

    passwordInput.style.fontSize =
        "15px";


    const message =
        document.createElement(
            "p"
        );


    message.style.display =
        "none";

    message.style.marginBottom =
        "12px";

    message.style.color =
        "#b91c1c";

    message.style.fontSize =
        "13px";


    const loginButton =
        document.createElement(
            "button"
        );


    loginButton.type =
        "button";


    loginButton.textContent =
        "OWNER LOGIN";


    loginButton.style.width =
        "100%";

    loginButton.style.padding =
        "15px";

    loginButton.style.border =
        "none";

    loginButton.style.borderRadius =
        "10px";

    loginButton.style.background =
        "#111827";

    loginButton.style.color =
        "white";

    loginButton.style.fontSize =
        "15px";

    loginButton.style.fontWeight =
        "700";

    loginButton.style.cursor =
        "pointer";


    async function login() {

        const email =
            emailInput.value.trim();


        const password =
            passwordInput.value;


        if (
            !email ||
            !password
        ) {

            message.textContent =
                "Please enter your email and password.";

            message.style.display =
                "block";

            return;
        }


        loginButton.disabled =
            true;

        loginButton.textContent =
            "SIGNING IN...";


        message.style.display =
            "none";


        try {

            const {
                error
            } =
                await supabaseClient.auth.signInWithPassword({
                    email:
                        email,

                    password:
                        password
                });


            if (
                error
            ) {

                throw error;

            }


            overlay.remove();


            await loadOrders();


            startAutoRefresh();

        }

        catch (error) {

            console.error(
                "Owner login failed:",
                error
            );


            message.textContent =
                error.message ||
                "Login failed. Please check your details.";


            message.style.display =
                "block";

        }

        finally {

            loginButton.disabled =
                false;

            loginButton.textContent =
                "OWNER LOGIN";

        }

    }


    loginButton.addEventListener(
        "click",
        login
    );


    passwordInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                "Enter"
            ) {

                login();

            }

        }
    );


    card.appendChild(
        eyebrow
    );

    card.appendChild(
        title
    );

    card.appendChild(
        description
    );

    card.appendChild(
        emailInput
    );

    card.appendChild(
        passwordInput
    );

    card.appendChild(
        message
    );

    card.appendChild(
        loginButton
    );


    overlay.appendChild(
        card
    );


    document.body.appendChild(
        overlay
    );


    emailInput.focus();

}


// ============================================
// CHECK OWNER SESSION
// ============================================

async function checkOwnerSession() {

    const {
        data,
        error
    } =
        await supabaseClient.auth.getSession();


    if (
        error
    ) {

        console.error(
            "Could not check owner session:",
            error
        );


        return false;
    }


    return Boolean(
        data &&
        data.session
    );
}


// ============================================
// SIGN OUT BUTTON
// ============================================

function addSignOutButton() {

    if (
        document.getElementById(
            "printFlowOwnerSignOut"
        )
    ) {

        return;
    }


    const button =
        document.createElement(
            "button"
        );


    button.id =
        "printFlowOwnerSignOut";


    button.type =
        "button";


    button.textContent =
        "LOG OUT";


    button.style.position =
        "fixed";

    button.style.right =
        "20px";

    button.style.bottom =
        "20px";

    button.style.zIndex =
        "1000";

    button.style.padding =
        "10px 14px";

    button.style.border =
        "1px solid #d1d5db";

    button.style.borderRadius =
        "9px";

    button.style.background =
        "white";

    button.style.color =
        "#111827";

    button.style.fontSize =
        "12px";

    button.style.fontWeight =
        "700";

    button.style.cursor =
        "pointer";


    button.addEventListener(
        "click",
        async function () {

            await supabaseClient.auth.signOut();


            if (
                refreshTimer
            ) {

                clearInterval(
                    refreshTimer
                );

                refreshTimer =
                    null;
            }


            location.reload();

        }
    );


    document.body.appendChild(
        button
    );

}


// ============================================
// FORMAT PRICE
// ============================================

function formatPrice(price) {

    const numeric =
        getNumericPrice(
            price
        );


    return (
        "₹" +
        numeric
    );
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
                    .replace(
                        "₹",
                        ""
                    )
                    .replace(
                        /,/g,
                        ""
                    )
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

    if (
        !dateString
    ) {

        return "Unknown time";

    }


    const date =
        new Date(
            dateString
        );


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
            dateStyle:
                "medium",

            timeStyle:
                "short"
        }
    );
}


// ============================================
// CHECK TODAY
// ============================================

function isToday(dateString) {

    if (
        !dateString
    ) {

        return false;

    }


    const orderDate =
        new Date(
            dateString
        );


    const today =
        new Date();


    return (
        orderDate.getDate() ===
            today.getDate() &&

        orderDate.getMonth() ===
            today.getMonth() &&

        orderDate.getFullYear() ===
            today.getFullYear()
    );
}


// ============================================
// CONVERT SUPABASE ORDER
// ============================================

function mapOrder(row) {

    return {

        id:
            row.id,

        orderNumber:
            row.order_number,

        documentName:
            row.document_name,

        fileType:
            row.file_type,

        fileSize:
            row.file_size,

        totalPages:
            row.total_pages ||
            1,

        selectedPages:
            row.selected_pages ||
            1,

        pageRange:
            row.page_range ||
            "All",

        copies:
            row.copies ||
            1,

        paperSize:
            row.paper_size ||
            "A4",

        printType:
            row.print_type ||
            "B&W",

        printSides:
            row.print_sides ||
            "Single",

        estimatedPrice:
            row.estimated_price ||
            0,

        finalPrice:
            row.final_price,

        status:
            row.status ||
            "New",

        createdAt:
            row.created_at,

        printingStartedAt:
            row.printing_started_at,

        completedAt:
            row.completed_at,

        cancelledAt:
            row.cancelled_at

    };

}


// ============================================
// GET ORDERS FROM SUPABASE
// ============================================

async function getOnlineOrders() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("orders")
            .select("*")
            .order(
                "created_at",
                {
                    ascending:
                        false
                }
            );


    if (
        error
    ) {

        console.error(
            "Could not load online orders:",
            error
        );


        throw error;
    }


    return (
        data || []
    ).map(
        mapOrder
    );
}


// ============================================
// UPDATE SUMMARY
// ============================================

function updateSummary(orders) {

    const newOrders =
        orders.filter(
            order =>
                order.status ===
                "New"
        );


    const printingOrders =
        orders.filter(
            order =>
                order.status ===
                "Printing"
        );


    const completedOrders =
        orders.filter(
            order =>
                order.status ===
                "Completed"
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
            function (
                total,
                order
            ) {

                return (
                    total +
                    getNumericPrice(
                        order.finalPrice ??
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
        "₹" +
        sales;


    const visibleOrders =
        orders.filter(
            order =>
                order.status !==
                    "Completed" &&
                order.status !==
                    "Cancelled"
        );


    orderCount.textContent =
        `${visibleOrders.length} ${
            visibleOrders.length ===
            1
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
        document.createElement(
            tag
        );


    if (
        className
    ) {

        element.className =
            className;

    }


    if (
        text !==
        undefined
    ) {

        element.textContent =
            text;

    }


    return element;

}


// ============================================
// UPDATE ORDER STATUS ONLINE
// ============================================

async function updateOrderStatus(
    orderNumber,
    newStatus
) {

    const updateData = {

        status:
            newStatus

    };


    if (
        newStatus ===
        "Printing"
    ) {

        updateData.printing_started_at =
            new Date().toISOString();

    }


    if (
        newStatus ===
        "Completed"
    ) {

        updateData.completed_at =
            new Date().toISOString();

    }


    if (
        newStatus ===
        "Cancelled"
    ) {

        updateData.cancelled_at =
            new Date().toISOString();

        updateData.final_price =
            0;

    }


    if (
        newStatus ===
        "Completed"
    ) {

        const {
            data:
                existingOrder,
            error:
                existingError
        } =
            await supabaseClient
                .from("orders")
                .select(
                    "estimated_price, final_price"
                )
                .eq(
                    "order_number",
                    orderNumber
                )
                .single();


        if (
            existingError
        ) {

            throw existingError;

        }


        updateData.final_price =
            existingOrder.final_price ??
            existingOrder.estimated_price ??
            0;

    }


    const {
        error
    } =
        await supabaseClient
            .from("orders")
            .update(
                updateData
            )
            .eq(
                "order_number",
                orderNumber
            );


    if (
        error
    ) {

        console.error(
            "Order update failed:",
            error
        );


        throw error;
    }


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


    if (
        oldDetails
    ) {

        oldDetails.remove();

    }


    const overlay =
        createElement(
            "div",
            "order-details-overlay"
        );


    overlay.id =
        "orderDetailsPanel";


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
            order.status ||
                "New"
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
                Number(
                    order.totalPages ||
                    1
                ) === 1
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
            order.totalPages ||
            1
        )
    );


    addDetail(
        "Pages to Print",
        order.pageRange ||
            "All"
    );


    addDetail(
        "Copies",
        String(
            order.copies ||
            1
        )
    );


    addDetail(
        "Paper Size",
        order.paperSize ||
            "A4"
    );


    addDetail(
        "Print Type",
        order.printType ||
            "B&W"
    );


    addDetail(
        "Print Sides",
        order.printSides ||
            "Single"
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
            order.status ===
                "Cancelled"
                ? "₹0"
                : formatPrice(
                    order.finalPrice ??
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
                event.target ===
                overlay
            ) {

                closeDetails();

            }

        }
    );


    // ========================================
    // NEW ORDER
    // ========================================

    if (
        order.status ===
        "New"
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
            async function () {

                printButton.disabled =
                    true;


                printButton.textContent =
                    "UPDATING...";


                try {

                    await updateOrderStatus(
                        order.orderNumber,
                        "Printing"
                    );


                    closeDetails();


                    await loadOrders();

                }

                catch (error) {

                    console.error(
                        error
                    );


                    alert(
                        error.message ||
                        "Could not update the order."
                    );


                    printButton.disabled =
                        false;


                    printButton.textContent =
                        "PRINT ORDER";

                }

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
        order.status ===
        "Printing"
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
            async function () {

                const confirmed =
                    confirm(
                        `Mark order ${
                            order.orderNumber
                        } as completed?`
                    );


                if (
                    !confirmed
                ) {

                    return;

                }


                completeButton.disabled =
                    true;


                completeButton.textContent =
                    "UPDATING...";


                try {

                    await updateOrderStatus(
                        order.orderNumber,
                        "Completed"
                    );


                    closeDetails();


                    await loadOrders();

                }

                catch (error) {

                    console.error(
                        error
                    );


                    alert(
                        error.message ||
                        "Could not complete the order."
                    );


                    completeButton.disabled =
                        false;


                    completeButton.textContent =
                        "MARK COMPLETED";

                }

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
            order.status ||
                "New"
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
            order.totalPages ||
            1
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
            order.copies ||
            1
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
            order.status ===
                "Cancelled"
                ? "₹0"
                : formatPrice(
                    order.finalPrice ??
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


    const cancelButton =
        createElement(
            "button",
            "owner-delete-button",
            "CANCEL"
        );


    cancelButton.type =
        "button";


    // ========================================
    // VIEW
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
    // CANCEL
    // ========================================

    cancelButton.addEventListener(
        "click",
        async function () {

            const shouldCancel =
                confirm(
                    `Cancel order ${
                        order.orderNumber
                    }?\n\n` +
                    "The order will remain in Sales History as Cancelled."
                );


            if (
                !shouldCancel
            ) {

                return;

            }


            cancelButton.disabled =
                true;


            cancelButton.textContent =
                "CANCELLING...";


            try {

                await updateOrderStatus(
                    order.orderNumber,
                    "Cancelled"
                );


                await loadOrders();

            }

            catch (error) {

                console.error(
                    error
                );


                alert(
                    error.message ||
                    "Could not cancel the order."
                );


                cancelButton.disabled =
                    false;


                cancelButton.textContent =
                    "CANCEL";

            }

        }
    );


    actions.appendChild(
        viewButton
    );


    actions.appendChild(
        cancelButton
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

function renderOrders(
    orders
) {

    document.body.style.overflow =
        "";


    updateSummary(
        orders
    );


    ordersList.innerHTML =
        "";


    // ========================================
    // ACTIVE ORDERS
    // ========================================

    const activeOrders =
        orders.filter(
            order =>
                order.status !==
                    "Completed" &&
                order.status !==
                    "Cancelled"
        );


    // ========================================
    // EMPTY STATE
    // ========================================

    if (
        activeOrders.length ===
        0
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
        function (
            a,
            b
        ) {

            return (
                new Date(
                    b.createdAt
                ) -
                new Date(
                    a.createdAt
                )
            );

        }
    );


    // ========================================
    // CARDS
    // ========================================

    activeOrders.forEach(
        function (
            order
        ) {

            ordersList.appendChild(
                createOrderCard(
                    order
                )
            );

        }
    );

}


// ============================================
// LOAD ORDERS
// ============================================

async function loadOrders() {

    if (
        isLoadingOrders
    ) {

        return;

    }


    isLoadingOrders =
        true;


    try {

        const orders =
            await getOnlineOrders();


        renderOrders(
            orders
        );

    }

    catch (error) {

        console.error(
            "Could not load orders:",
            error
        );


        if (
            error.code ===
            "PGRST301" ||
            error.code ===
            "42501"
        ) {

            alert(
                "Your owner account does not currently have permission to view orders."
            );

        }

        else {

            console.error(
                "Owner dashboard error:",
                error.message ||
                error
            );

        }

    }

    finally {

        isLoadingOrders =
            false;

    }

}


// ============================================
// AUTO REFRESH
// ============================================

function startAutoRefresh() {

    if (
        refreshTimer
    ) {

        clearInterval(
            refreshTimer
        );

    }


    refreshTimer =
        setInterval(
            function () {

                loadOrders();

            },
            5000
        );

}


// ============================================
// START OWNER APP
// ============================================

async function startOwnerApp() {

    // ========================================
    // INITIALIZE SUPABASE
    // ========================================

    const connected =
        await initializeSupabase();


    if (
        !connected
    ) {

        alert(
            "PrintFlow could not connect to Supabase."
        );


        return;
    }


    // ========================================
    // CHECK LOGIN
    // ========================================

    const loggedIn =
        await checkOwnerSession();


    if (
        !loggedIn
    ) {

        showLoginScreen();

        return;
    }


    // ========================================
    // OWNER IS LOGGED IN
    // ========================================

    addSignOutButton();


    await loadOrders();


    startAutoRefresh();

}


// ============================================
// START
// ============================================

startOwnerApp();
