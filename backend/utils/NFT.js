const axios = require('axios').default;
const FormData = require('form-data');
const fs = require('node:fs');
const path = require('node:path');
const { ethers, BigNumber } = require('ethers');
const { ObjectId } = require('mongodb');
const { url: NFTStorageHTTPAPI, apiKey: NFTStorageAPIKey } = require("../configs").nftstorage;
const alchemyConfig = require('../configs').alchemy.goerli;
const gatewayURL = "https://cloudflare-ipfs.com/ipfs/";

const alchemyNftApiUrl = "https://eth-goerli.g.alchemy.com/nft/v2/" + alchemyConfig.apiKey;


class AlchemyAPI {
    /**
     * 获取一个账户的所有NFT
     * @param {string} account
     */
    static async GetNFTsForOwner(account) {
        if (!account) {
            return [];
        }
        const url = `${alchemyNftApiUrl}/getNFTs?owner=${account}&withMetadata=true`;
        const response = await axios.get(url);
        return response.data.ownedNfts;
    }

    /**
     * 获取某个NFT的metadata
     * @param {string} tokenAddress
     * @param {number} tokenId
     */
    static async GetNFTMetadata(contractAddress, tokenId) {
        if (!contractAddress || !tokenId) {
            return null;
        }
        const url = `${alchemyNftApiUrl}/getNFTMetadata?contractAddress=${contractAddress}&tokenId=${tokenId}&refreshCache=false`;
        const response = await axios.get(url);
        return response.data;
    }

    /**
     * 查看NFT的持有者以及余额
     * @param {string} contractAddress
     * @param {string} tokenId
     */
    static async GetOwnersForNFT(contractAddress, tokenId) {
        if (!contractAddress) {
            return [];
        }
        const url = `${alchemyNftApiUrl}/getOwnersForCollection?contractAddress=${contractAddress}&withTokenBalances=true`;
        const response = await axios.get(url);
        let { ownerAddresses } = response.data;
        let ownersForNFT = [];
        for (let i = 0; i < ownerAddresses.length; i++) {
            let e = ownerAddresses[i];
            let balance;
            for (let j = 0; j < e.tokenBalances.length; j++) {
                let tokenId2 = BigNumber.from(e.tokenBalances[j].tokenId).toString();
                if (tokenId2 === tokenId) {
                    balance = Number(e.tokenBalances[j].balance);
                    break;
                }
            }
            if (balance) {
                ownersForNFT.push({
                    "owner": e.ownerAddress,
                    "tokenId": tokenId,
                    "balance": balance
                });
            }
        }
        return ownersForNFT;
    }
}

/**
 * 上传IPFS生成MetadataUri
 * @date 2022-09-30
 * @param {string} name
 * @param {string} description
 * @param {string} imagePath
 * @returns {Promise<{ipnft, url, data}>}
 */
const UploadNFT = async (name, description, imagePath) => {
    const imageFileName = path.basename(imagePath);
    const formData = new FormData();
    const meta = {
        name,
        image: null,
        description,
        properties: {}
    }
    formData.append('meta', JSON.stringify(meta));
    formData.append('image', fs.createReadStream(imagePath), imageFileName);
    const res = await axios.post(NFTStorageHTTPAPI, formData, {
        headers: {
            "Authorization": "Bearer " + NFTStorageAPIKey,
            ...formData.getHeaders()
        }
    });
    const resBody = res.data;
    if (!resBody.ok) {
        throw new Error("ipfs error: " + resBody.error.message);
    }
    return resBody.value;
}

/**
 * 将mongo的ObjectId转成tokenId
 * @date 2022-10-01
 * @param {any} objectId
 * @returns {string}
 */
const ObjectIdToTokenId = (objectId) => {
    if(!objectId) {
        return null;
    }
    const tokenId = ethers.BigNumber.from(`0x${objectId.toHexString()}`);
    return tokenId.toString();
}

/**
 * 将tokenId转成mongo的ObjectId
 * @date 2022-10-01
 * @param {string} tokenId
 * @returns {ObjectId}
 */
const TokenIdToObjectId = (tokenId) => {
    if(!tokenId) {
        return null;
    }
    const ethersTokenId = ethers.BigNumber.from(tokenId);
    return ObjectId(ethersTokenId.toHexString().slice(2));
};



/**
 * ipfs链接转http链接
 * @param {string} ipfsURL
 * @returns {string}
 */
function IPFSGatewayURL(ipfsURL) {
    return ipfsURL?.replace("ipfs://", gatewayURL);
}


module.exports = {
    AlchemyAPI,
    UploadNFT,
    ObjectIdToTokenId,
    TokenIdToObjectId,
    IPFSGatewayURL
}