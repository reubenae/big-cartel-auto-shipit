var fs = require('fs');
const fetch = require('node-fetch');
const { trackingNumberExists } = require('./utils');

const encodedAuthCreds = fs.readFileSync('creds.txt');
const headers = {
    'Content-Type': 'application/vnd.api+json',
    'Accept': 'application/vnd.api+json',
    'User-Agent': 'Royal Mail tracking automater (https://github.com/reubenae/big-cartel-auto-shipit)',
    'Authorization': `Basic ${encodedAuthCreds}`
};

const getOrderInfo = async orderId => {
    return await fetch(`https://api.bigcartel.com/v1/accounts/5562368/orders/${orderId}`, {
        method: 'get',
        headers,
    })
    .then(res => res.json());
};

const createShipment = async ({orderId, trackingNumber, lineItems}) => {
    const bodyLineItems = [];
    lineItems.forEach(lineItem => {
        const {id, attributes} = lineItem;
        const {quantity_unshipped: quantity} = attributes;
        bodyLineItems.push({
            quantity,
            order_line_item_id: id
        });
    });
    const requestBody = {
        data: {
            id: orderId,
            type: 'shipments',
            attributes: {
                notify_customer: true,
                items: bodyLineItems,
            }
        }
    };
    if (trackingNumberExists(trackingNumber)) {
        requestBody.data.attributes.carrier = "RoyalMail"
        requestBody.data.attributes.tracking_number = trackingNumber;
        requestBody.data.attributes.tracking_url = `https://www3.royalmail.com/track-your-item#/tracking-results/${trackingNumber}`;
    };
    return await fetch(`https://api.bigcartel.com/v1/accounts/5562368/orders/${orderId}/shipments`, {
        method: 'post',
        headers,
        body: JSON.stringify(requestBody),
    })
    .then(res => res.json());
}

module.exports = {
    getOrderInfo,
    createShipment,
};