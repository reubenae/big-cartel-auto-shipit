var fs = require('fs');
const Papa = require('papaparse');
const camelCase = require('camelcase');
const requests = require('./requests');
const { makeLog, getLogFolderPathFromOrderId } = require('./utils');
const main = async () => {
    console.log('START');

    // Read file
    var csv = fs.readFileSync("orders.csv");

    // Convert file into data format wanted
    const config = {
        header: true,
        transformHeader: (header) => {
            if (header.includes('Order number')) {
                return 'orderNumber';
            }
            return camelCase(header);
        },
    };
    var result = Papa.parse(csv.toString(), config);
    const orders = result.data;

    // Update the orders one by one
    const updateOrder = async ({
        channelReference,
        customer,
        trackingNumber,
    }) => {
        const logFolderPath = getLogFolderPathFromOrderId(channelReference);
        console.log(`Planning to mark order ${channelReference} as shipped for ${customer}`);
        // Get all the info about the order
        const orderInfo = await requests.getOrderInfo(channelReference);

        // Check it all looks okay
        if (orderInfo.data.attributes.shipping_status !== 'unshipped') {
            // Log the issue
            makeLog(logFolderPath, 'unshippedOrder.json', orderInfo);

            // Throw
            throw new Error(`Order ${channelReference} for ${customer} is not unshipped, check your input! \nSee logs in ${logFolderPath}`);
        }

        // Grab the data needed to create shipments, create the shipment and re-request for the order
        const lineItems = orderInfo.included.filter(includedInfo => includedInfo.type === 'order_line_items');
        const shipmentForOrder = await requests.createShipment({orderId: channelReference, trackingNumber, lineItems});
        const shippedOrderInfo = await requests.getOrderInfo(channelReference);

        if (shippedOrderInfo.data.attributes.shipping_status !== 'shipped') {
            // Log the issue
            makeLog(logFolderPath, 'shipment.json', shipmentForOrder);
            makeLog(logFolderPath, 'shippedOrder.json', shippedOrderInfo);
            // Throw
            throw new Error(`Order ${channelReference} for ${customer} is not showing as shipped despite shipment being created, manual intervention required.
            See logs in ${logFolderPath}`);
        }
    };

    for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        try {
            await updateOrder(order);
        } catch (error) {
            const logFolderPath = getLogFolderPathFromOrderId(order.channelReference);
            makeLog(logFolderPath, 'uncaughtError.json', error.toString());
            console.error(`Some error in order ${order.channelReference}: ${error.toString()}`);
        }
    }
    console.log('END');
};
try {
    main();
} catch (error) {
    console.error(`Some error in script: ${error.toString()}`);
}