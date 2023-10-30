import { registerBidder } from "../src/adapters/bidderFactory.js";
import { config } from "../src/config.js";
import { BANNER } from "../src/mediaTypes.js";
const BIDDER_CODE = "customAdapter";
const END_POINT = "https://prebidexample.sagargolait.repl.co";

export const spec = {
  code: BIDDER_CODE,
  url: "",
  supportedMediaTypes: [BANNER],

  isBidRequestValid: (bid) => {
    const { placementId } = bid.params;
    return !!placementId;
  },
  isGdprConsentPresent: (bid) => {
    const { gdpr, gdprConsent } = bid.params;
    if (gdpr == "1") {
      return !!gdprConsent;
    }
    return true;
  },
  buildRequests: (validBidRequests) => {
    const serverRequests = [];
    const { data } = config.getConfig("customAdapter.user");

    // TODO: this should probably look at refererInfo
    // const { page, domain, token } = config.getConfig("customAdapter.context");

    validBidRequests.forEach(function (validBidRequest) {
      const payload = getPayload(validBidRequest, data);
      serverRequests.push({
        method: "POST",
        url: END_POINT,
        data: JSON.stringify(payload.data),
        // options: {
        //   contentType: 'application/json',
        //   withCredentials: true
        // },
        bids: validBidRequests,
      });
    });

    return serverRequests;
  },
  interpretResponse: (serverResponse) => {
    const responseJson = serverResponse ? serverResponse.body : {};
    const bidResponse = {
      ad: responseJson.ad,
      width: Number(responseJson.width),
      height: Number(responseJson.height),
      requestId: responseJson.requestId,
      netRevenue: true,
      ttl: 30,
      cpm: responseJson.cpm,
      currency: responseJson.currency,
      mediaType: "banner",
      creativeId: responseJson.creativeId,
      meta: {
        advertiserDomains: [responseJson.meta.advertiserDomains],
      },
    };

    return [bidResponse];
  },
};

function getPayload(bid, bidderRequest) {
  const { adUnitCode, bidId } = bid;
  // const { siteId, placementId, renderURL, pageCategory, keywords } = params;
  const {
    userid,
    email,
    firstname,
    lastname,
    specialization,
    hcpid,
    gender,
    city,
    state,
    zipcode,
    hashedNPI,
    pb,
    privacyConsent,
  } = bidderRequest;

  return {
    data: {
      userid: userid,
      email: email,
      firstname: firstname,
      lastname: lastname,
      specialization: specialization,
      hcpid: hcpid,
      gender: gender,
      city: city,
      state: state,
      zipcode: zipcode,
      hashedNPI: hashedNPI,
      pb: pb,
      privacyConsent: privacyConsent,
      adunit: adUnitCode,
      requestId: bidId,
    },
  };
}

registerBidder(spec);
