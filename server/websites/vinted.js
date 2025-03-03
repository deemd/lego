const fetch = require('node-fetch');
const cheerio = require('cheerio');

/**
 * Parse JSON response
 * @param {String} data - json response
 * @return {Object} sales
 */
const parseJSON = data => {
    try {
      console.log(data);
      const { items } = data;
      return items.map(item => {
        const link = item.url;
        const price = item.total_item_price;
        const photo = item;
        const published = photo.high_resolution && photo.high_resolution.timestamp;
        const status = item.status; 
  
        return {
          link,
          'price': price.amount,
          'title': item.title,
          'published': new Date(published * 1000).toUTCString(),
          'status': status,
          //'uuid': uuidv5(link, uuidv5.URL)
        };
      });
    } catch (error) {
      console.error(error);
      return [];
    }
  };


const scrape = async searchText => {
    try {
        const response = await fetch("https://www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&time=1739192798&search_text=42182&catalog_ids=&size_ids=&brand_ids=89162&status_ids=6,1&material_ids=", {
            "headers": {
              "accept": "application/json, text/plain, */*",
              "accept-language": "fr",
              "priority": "u=1, i",
              "sec-ch-ua": "\"Opera\";v=\"116\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-platform": "\"Windows\"",
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin",
              "x-anon-id": "e685c9d2-b43b-4def-8bb3-68a4af4ad144",
              "x-csrf-token": "75f6c9fa-dc8e-4e52-a000-e09dd4084b3e",
              "x-money-object": "true",
              "cookie": "_lm_id=FO9JZD4PGRPBG3K7; v_udt=L0dtcEJPM2FaVDBkUHZLc2EzU3hobjJGLzQzaS0tR2srUEl2cDhQaGEzRFhrby0tQnJZdE92cTQwRVAwQkZnS0pmSlBEUT09; anonymous-locale=fr; anon_id=e685c9d2-b43b-4def-8bb3-68a4af4ad144; ab.optOut=This-cookie-will-expire-in-2026; domain_selected=true; OptanonAlertBoxClosed=2025-01-06T15:07:49.737Z; eupubconsent-v2=CQKzpVgQKzpVgAcABBENBXFgAAAAAAAAAChQAAAAAAFBIIQACAAFwAUABUADgAHgAQQAyADUAHgARAAmABVADeAHoAPwAhIBDAESAI4ASwAmgBWgDDgGUAZYA2QB3wD2APiAfYB-gEAAIpARcBGACNAFBAKgAVcAuYBigDRAG0ANwAcQBDoCRAE7AKHAUeApEBTYC2AFyALvAXmAw0BkgDJwGXAM5gawBrIDYwG3gN1AcEA5MBy4DxwHtAQhAheEAOgAOABIAOcAg4BPwEegJFASsAm0BT4CwgF5AMQAYtAyEDIwGjANTAbQA24BugDygHyAP3AgIBAyCCIIJgQYAhWBC4cAwAARAA4ADwALgAkAB-AGgAc4A7gCAQEHAQgAn4BUAC9AHSAQgAj0BIoCVgExAJlATaApABSYCuwFqALoAYgAxYBkIDJgGjANNAamA14BtADbAG3AOPgc6Bz4DygHxAPtgfsB-4EDwIIgQYAg2BCsdBLAAXABQAFQAOAAgABdADIANQAeABEACYAFWALgAugBiADeAHoAP0AhgCJAEsAJoAUYArQBhgDKAGiANkAd4A9oB9gH6AP-AigCMAFBAKuAWIAuYBeQDFAG0ANwAcQA6gCHQEXgJEATIAnYBQ4Cj4FNAU2AqwBYoC2AFwALkAXaAu8BeYC-gGGgMeAZIAycBlUDLAMuAZyA1UBrADbwG6gOLAcmA5cB44D2gH1gQBAhaQAJgAIADQAOcAsQCPQE2gKTAXkA1MBtgDbgHPgPKAfEA_YCB4EGAINgQrIQHQAFgAUABcAFUALgAYgA3gB6AEcAO8Af4BFACUgFBAKuAXMAxQBtADqQKaApsBYoC0QFwALkAZOAzkBqoDxwIWkoEQACAAFgAUAA4ADwAIgATAAqgBcADFAIYAiQBHACjAFaANkAd4A_ACrgGKAOoAh0BF4CRAFHgLFAWwAvMBk4DLAGcgNYAbeA9oCB5IAeABcAdwBAACoAI9ASKAlYBNoCkwGLANyAeUA_cCCIEGCkDgABcAFAAVAA4ACCAGQAaAA8ACIAEwAKQAVQAxAB-gEMARIAowBWgDKAGiANkAd8A-wD9AIsARgAoIBVwC5gF5AMUAbQA3ACHQEXgJEATsAocBTYCxQFsALgAXIAu0BeYC-gGGgMkAZPAywDLgGcwNYA1kBt4DdQHBAOTAeOA9oCEIELSgCEAC4AJABHADnAHcAQAAkQBYgDXgHbAP-Aj0BIoCYgE2gKQAU-ArsBdAC8gGLAMmAamA14B5QD4oH7AfuBAwCB4EEwIMAQbAhW.YAAAAAAAAAAA; OTAdditionalConsentString=1~; access_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaWF0IjoxNzM5MTkyNjg4LCJzaWQiOiI2YTNlMTY0Zi0xNzM5MTkyNjg4Iiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3MzkxOTk4ODgsInB1cnBvc2UiOiJhY2Nlc3MifQ.jbwo7tB25VFLK8UIHBR2Fyq-aW7JWR60i45M0NYhCs7ljaE6RP_zcYTr5MCcGYMtPfTiD5dGCxmiKMhkEAjzDHXdxmURDr4htTPpsyUCpZgwfWDBuPxzdC-8WO8CetwZMulVFqg4rgQkXBVk3ue3__0U1Wt35_F3YXsujNCbTfpj4WIVLWKWwFimy_D9zbOwKPL10Es0bDwKP6ito3Y_xVmoYeejsjXhnncLvQEUiApSfuwS8WvNzILt8x50eDGnkszhulX9wYUsXZIqIo_kGF4n1sjQBayEgWS-EtCSnGOcr6Oh-KkG1IAriWcuqGX2Se98k3HI_oBKlSOZc70YoA; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaWF0IjoxNzM5MTkyNjg4LCJzaWQiOiI2YTNlMTY0Zi0xNzM5MTkyNjg4Iiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3Mzk3OTc0ODgsInB1cnBvc2UiOiJyZWZyZXNoIn0.fRx5lJ_IRwmrn-Epq35zHad24hzWCtOvr06QzbElpH3SBnssE9OHpx9-iADjSO7C970HlpaHk8dZYv_Qximlj18QWXkhCsYy28TavPgAtvHkCnaG5W5esxIiN1bBrFc0UDS1HLguxnJcoEy8LItTxuSWZHiF1yrTqM9eDPooK55Crf8C5HH86VHJ8sCU6SUoTBuWDNRxqvhi-LRunffjlkbNnTcdrf5w1fU5YxzxmWm3xttFHAG7z8-p96nKZjMHaeKJ2Ggr-ayeHhP1zZL6qdOhZusW4fTIWCLq78-7ZfnYlANziD3DAaGrAZPTzgdnlRaPzGVEj3lIjY6I5yiePA; v_sid=1f2ce47956b0db584e61c1c7a0ad2028; v_sid=1f2ce47956b0db584e61c1c7a0ad2028; datadome=Ae0pPKpGYwBXHJSMgs6LRz7YvBFZH4HP9ZGSGfVHgqJP44DS_OKTcoI8VVc07l~mfiTMvC_WJrJczdIDQSYNZUw25SUMUwD8M6FFCBNpi8_2ZvcqUnQ3jhu_3SSPEfs3; viewport_size=510; __cf_bm=_rU.v70kxjsGvdbfl3N0hTO0h519CbUSr1nmGJlDnyU-1739197547-1.0.1.1-pj1MscOHj3kLT3AhWb2F1S0RxqxRVQ8UlZKF1FAwdc4NWj.2QIPV4U2b7p1qRsTfu0RQuVCs.lYm1wzdL.i.NHnzREgyPy803td7kiEHxYY; cf_clearance=Vt0ktTGCibrL.Wvu.dNzbMMph0a.aaeTk9awCrfarus-1739197549-1.2.1.1-oyitgyHQUNDu9o_dzFQskeWDAYS9m9BXXA51QpGZEcNgnnvE2VCL786tVaFhYQ9QzCS8svu7.sYnVl4mP07IyWderFzbNOfK5s1wkdjJgn_kGnwDrX9x2d6zzA5NOujtCGWhstNMaYBfEX31JT5CZzZmRqxk.5w9BaWK9ejVZbTdo7TmoH2BpKSBnq2pXjNoAecU1qFfBq_6v..9HmtyruEAJXdPfw9sjnCT6RGGSJC.vIy8o6sU2bxSh7Je0RkM1RxgGDfwYdl5yamVk1F0QrtXhynWO6zld6QNFSU2J_c; _vinted_fr_session=a1BaV1dQTTV6SHZtSjlzSk14WlpvNk4rd2wwMUhKOE0yNUJ3d2x5Nmc4OEUxTkpGbmhHcVRJQUZmTXEwY1lxSUZrSVMzalpad1M3V3gxUDZGZ2NJcGxxOVRUMWdNclovSFR3c0J2U1Urdi84UUc2OFR5YytBTTRTSUtFQTRyaERpYm1Lb3hYRnI5RmJnM1c2YmpJUnRROHpSdFdnUDVTb1g5T09lRGh0VzgwL0VOR0Q2MFdLQmxmWG5qSEdHdjNMNGVzY2lFWTRVNExkbnZNN01kdXM1dDlQc20wRVpNZkIyOHZuUkFqeTlsa2FhczRFMW5neERJeVdBRVlDbk1LRy0teGI4Zm0xWC9HMGtucFkvYzQyU01Ndz09--34a699a3406c38bca471b4062f7f5b5f1bb7a50a; OptanonConsent=isGpcEnabled=0&datestamp=Mon+Feb+10+2025+15%3A25%3A51+GMT%2B0100+(heure+normale+d%E2%80%99Europe+centrale)&version=202312.1.0&browserGpcFlag=0&isIABGlobal=false&consentId=e685c9d2-b43b-4def-8bb3-68a4af4ad144&interactionCount=9&hosts=&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A0%2CC0003%3A0%2CC0004%3A0%2CC0005%3A0%2CV2STACK42%3A0%2CC0015%3A0%2CC0035%3A0&genVendors=V2%3A0%2CV1%3A0%2C&geolocation=FR%3BIDF&AwaitingReconsent=false; banners_ui_state=PENDING",
              "Referer": "https://www.vinted.fr/catalog?time=1739192798&disabled_personalization=true&page=1&search_text=42182&brand_ids[]=89162&status_ids[]=6&status_ids[]=1",
              "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            "body": null,
            "method": "GET"
          });


        if(response.ok){
            const body = await response.json();
            return parseJSON(body); // parse(body)
        }

        console.error(response);
        return null;
    }
    catch (error){
        console.error(error);
        return null;
    }
};


const scrapeWithoutCookies = async searchText => {
    try {
        const response = await fetch(`https://www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&time=1739192767&search_text=42182&catalog_ids=&size_ids=&brand_ids=89162&status_ids=6,1&material_ids=`);

        if(response.ok){
            const body = await response.json();
            return parse(body);
        }

        console.error(response);
        return null;
    }
    catch (error){
        console.error(error);
        return null;
    }
};

module.exports.scrape = scrape; // export {scrape};