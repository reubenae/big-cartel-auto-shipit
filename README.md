# big-cartel-auto-shipit
Auto ship your orders from Royal Mail reports

## Purpose

This was created to automate the task of marking orders as shipped on big cartel if shipped via Royal Mail. There is no integration that exists between the two, so needed to automate the task of marking 100+ orders a week as shipped... particularly if they all have tracking numbers, this can take two people at least an hour to complete!

## How to use it

### Update accountId

The accountId is littered across the requests.js file. Replace it with your own (better yet, fix the top issue listed at the end of this document :-) ) <https://developers.bigcartel.com/api/v1#personal-projects> For info on how to get your accountId - or just run this in your terminal:

```sh
curl https://api.bigcartel.com/{storeSubDomain}/store.json
```

The response will give you the id you need as the first field.

### Order input data

Download dispatched orders as a report from royal mail click&drop, ensuring that you imported your orders into Royal Mail with the order reference on there and mapped it into the channel reference field. Then you get an excel file with both the order reference (from Big Cartel) and the tracking number (from Royal Mail). Save this as a `.csv` file as `orders.csv` in the root of this project.

### Auth input data

You'll also need to add a `creds.txt` file in the root - this is for the HTTP basic authentication (see `requests.js` for its usage). This needs to be base64 encoded of your domain and password separated by a colon. **DO NOT COMMIT IT!** The file is in the gitignore, so make sure you don't mess up if contributing. To create it, run this in a javascript environment (e.g. browser console):

```javascript
btoa('exampledomain:Password666BatteryHorseStaple') // "TmljZVRyeTpodHRwczovL3d3dy55b3V0dWJlLmNvbS93YXRjaD92PWRRdzR3OVdnWGNR"
```

Obviously replacing `exampledomain` and `Password666BatteryHorseStaple` with your details.

### Make the magic happen

Then run the following command:

```sh
yarn && clear && node index.js
```

This will install the dependencies, clean your terminal, and run the script. As this hasn't yet been onboarded as an official plugin for big cartel, to avoid killing their API it runs one request at a time.

Thats it! Enjoy getting time back to run your business.

### If it goes wrong

Don't worry - this has extensive logging and can't really mess up unless the data it gets is bad. Check the output and the `logs` directory for debug info.

### What it actually does

Loads all orders from file. One by one, it then

1. Loads the order from Big Cartel, checks if it has a status of shipped already, and goes to the next order if it does
1. Get the items from the order to generate the payload for a shipment
1. Create a shipment for the order, for all the items in that order
1. Load the order from Big Cartel again, makes sure it is now shipped and logs an error if it isn't

## Contributing

This repository welcomes contributions. Please fork and open a PR with a decent description. I'd be happy to get some co-maintainers, and expand this to beyond Royal Mail (its just all I have expereince of). Some basic improvements that could be made:

- Figure out a way to make getting the accountid easy (probably, ask for subdomain, which is also the username, and load the store to get the id <https://developers.bigcartel.com/api/v0#store>)
- Prompting users to enter domain & password rather than using the creds.txt file
- Make the headers for the csv file configurable
- Auto convert an xls or xlsx file into a csv file for papaparse (or integrate with a different file reader, but good luck finding one)

Big Cartel API can be found here: <https://developers.bigcartel.com/api/v1>
