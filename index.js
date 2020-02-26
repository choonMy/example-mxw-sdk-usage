const mxw = require('mxw-sdk-js');
const token = require('mxw-sdk-js').nonFungibleToken;


// verbose flags
let silentRpc = true;
let indent = "    ";
let silent = true;

const nodeProvider = {
    connection: {
        url: process.env.EndpointUrl || "localhost",
        timeout: 60000
    },

    trace: {
        silent: true,
        silentRpc: true
    },

    chainId: process.env.ChainId || "unknown",
    name: "mxw",

    kyc: {
        issuer: "pill maple dutch predict bulk goddess nice left paper heart loan fresh",
    },

    nonFungibleToken: {
        provider: process.env.ProviderWalletMnemonic || "dunno",
        issuer: process.env.ProviderWalletMnemonic || "dunno",
        middleware: process.env.IssuerWalletMnemonic || "dunno",
        feeCollector: process.env.FeeCollectorWalletAddr || "dunno"

    }

};

let defaultOverrides = {
    logSignaturePayload: function (payload) {
        if (!silentRpc) console.log(indent, "signaturePayload:", JSON.stringify(payload));
    },
    logSignedTransaction: function (signedTransaction) {
        if (!silentRpc) console.log(indent, "signedTransaction:", signedTransaction);
    }
}

let issuerNonFungibleToken;

function Initialize() {
    return new Promise((resolve, reject) => {
        providerConnection = new mxw.providers.JsonRpcProvider(nodeProvider.connection, nodeProvider);
        providerConnection
            .on("rpc", function (args) {
                if (!silentRpc) {
                    if ("response" == args.action) {
                        console.log(indent, "RPC REQ:", JSON.stringify(args.request));
                        console.log(indent, "    RES:", JSON.stringify(args.response));
                    }
                }
            })
            .on("responseLog", function (args) {
                if (!silentRpc) {
                    console.log(indent, "RES LOG:", JSON.stringify({ info: args.info, response: args.response }));
                }
            });

        try {
            wallet = mxw.Wallet.fromMnemonic(nodeProvider.kyc.issuer).connect(providerConnection);
            if (!silent) console.log(indent, "Wallet:", JSON.stringify({ address: wallet.address, mnemonic: wallet.mnemonic }));

            provider = mxw.Wallet.fromMnemonic(nodeProvider.nonFungibleToken.provider).connect(providerConnection);
            if (!silent) console.log(indent, "Provider:", JSON.stringify({ address: provider.address, mnemonic: provider.mnemonic }));

            issuer = mxw.Wallet.fromMnemonic(nodeProvider.nonFungibleToken.issuer).connect(providerConnection);
            if (!silent) console.log(indent, "Issuer:", JSON.stringify({ address: issuer.address, mnemonic: issuer.mnemonic }));

            middleware = mxw.Wallet.fromMnemonic(nodeProvider.nonFungibleToken.middleware).connect(providerConnection);
            if (!silent) console.log(indent, "Middleware:", JSON.stringify({ address: middleware.address, mnemonic: middleware.mnemonic }));

            if (!silent) console.log(indent, "Fee collector:", JSON.stringify({ address: nodeProvider.nonFungibleToken.feeCollector }));

            return resolve();
        }
        catch (error) {
            console.log(error);
            return reject();
        }

    });

}

function CreateNFT() {
    let symbol = "avcccc"
    let nonFungibleTokenProperties = {
        name: "MY" + symbol,
        symbol: symbol,
        fee: {
            to: nodeProvider.nonFungibleToken.feeCollector,
            value: mxw.utils.bigNumberify("1")
        },
        metadata: "metadata",
        properties: "properties"
    };
    return token.NonFungibleToken.create(nonFungibleTokenProperties, issuer, defaultOverrides).then(token =>{
        if(token) {
            return resolve(token);
        }

        return reject();
    })

}

// execution started from here
Initialize().then(() => {
    CreateNFT().then((token) => {
        issuerNonFungibleToken = token;

    }).catch(err => {
        console.log(err);
    })

})