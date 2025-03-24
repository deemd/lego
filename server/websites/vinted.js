// const fetch = require('node-fetch'); // WARNING 403 ERROR
const cheerio = require('cheerio');
const fs = require('fs');



/**
 * Convert timestamp into date format
 */
const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp * 1000); // Convertir en millisecondes
  return date.toLocaleString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};



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
        const favourite_count = item.favourite_count;
  
        return {
          link,
          'price': price.amount,
          'title': item.title,
          //'published': new Date(published * 1000).toUTCString(),
          'published': formatTimestamp(published || Date.now()), // formatTimestamp(item.photo?.high_resolution?.timestamp || Date.now()),
          'status': status,
          'favourites': favourite_count,
          //'uuid': uuidv5(link, uuidv5.URL)
        };
      });
    } catch (error) {
      console.error(error);
      return [];
    }
  };



/**
 * Scrape vinted.com for a given legoId
 */
const scrape = async searchText => {
    try {
        const response = await fetch(`https://www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&time=1742825795&search_text=${searchText}&catalog_ids=&size_ids=&brand_ids=89162&status_ids=6,1&color_ids=&material_ids=`, {
          "headers": {
            "accept": "application/json, text/plain, */*",
            "accept-language": "fr",
            "priority": "u=1, i",
            "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\", \"Opera\";v=\"117\"",
            "sec-ch-ua-arch": "\"x86\"",
            "sec-ch-ua-bitness": "\"64\"",
            "sec-ch-ua-full-version": "\"117.0.5408.53\"",
            "sec-ch-ua-full-version-list": "\"Not A(Brand\";v=\"8.0.0.0\", \"Chromium\";v=\"132.0.6834.210\", \"Opera\";v=\"117.0.5408.53\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-model": "\"\"",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-ch-ua-platform-version": "\"19.0.0\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-anon-id": "e685c9d2-b43b-4def-8bb3-68a4af4ad144",
            "x-csrf-token": "75f6c9fa-dc8e-4e52-a000-e09dd4084b3e",
            "x-money-object": "true",
            "cookie": "_lm_id=FO9JZD4PGRPBG3K7; v_udt=L0dtcEJPM2FaVDBkUHZLc2EzU3hobjJGLzQzaS0tR2srUEl2cDhQaGEzRFhrby0tQnJZdE92cTQwRVAwQkZnS0pmSlBEUT09; anonymous-locale=fr; anon_id=e685c9d2-b43b-4def-8bb3-68a4af4ad144; ab.optOut=This-cookie-will-expire-in-2026; domain_selected=true; OptanonAlertBoxClosed=2025-01-06T15:07:49.737Z; eupubconsent-v2=CQKzpVgQKzpVgAcABBENBXFgAAAAAAAAAChQAAAAAAFBIIQACAAFwAUABUADgAHgAQQAyADUAHgARAAmABVADeAHoAPwAhIBDAESAI4ASwAmgBWgDDgGUAZYA2QB3wD2APiAfYB-gEAAIpARcBGACNAFBAKgAVcAuYBigDRAG0ANwAcQBDoCRAE7AKHAUeApEBTYC2AFyALvAXmAw0BkgDJwGXAM5gawBrIDYwG3gN1AcEA5MBy4DxwHtAQhAheEAOgAOABIAOcAg4BPwEegJFASsAm0BT4CwgF5AMQAYtAyEDIwGjANTAbQA24BugDygHyAP3AgIBAyCCIIJgQYAhWBC4cAwAARAA4ADwALgAkAB-AGgAc4A7gCAQEHAQgAn4BUAC9AHSAQgAj0BIoCVgExAJlATaApABSYCuwFqALoAYgAxYBkIDJgGjANNAamA14BtADbAG3AOPgc6Bz4DygHxAPtgfsB-4EDwIIgQYAg2BCsdBLAAXABQAFQAOAAgABdADIANQAeABEACYAFWALgAugBiADeAHoAP0AhgCJAEsAJoAUYArQBhgDKAGiANkAd4A9oB9gH6AP-AigCMAFBAKuAWIAuYBeQDFAG0ANwAcQA6gCHQEXgJEATIAnYBQ4Cj4FNAU2AqwBYoC2AFwALkAXaAu8BeYC-gGGgMeAZIAycBlUDLAMuAZyA1UBrADbwG6gOLAcmA5cB44D2gH1gQBAhaQAJgAIADQAOcAsQCPQE2gKTAXkA1MBtgDbgHPgPKAfEA_YCB4EGAINgQrIQHQAFgAUABcAFUALgAYgA3gB6AEcAO8Af4BFACUgFBAKuAXMAxQBtADqQKaApsBYoC0QFwALkAZOAzkBqoDxwIWkoEQACAAFgAUAA4ADwAIgATAAqgBcADFAIYAiQBHACjAFaANkAd4A_ACrgGKAOoAh0BF4CRAFHgLFAWwAvMBk4DLAGcgNYAbeA9oCB5IAeABcAdwBAACoAI9ASKAlYBNoCkwGLANyAeUA_cCCIEGCkDgABcAFAAVAA4ACCAGQAaAA8ACIAEwAKQAVQAxAB-gEMARIAowBWgDKAGiANkAd8A-wD9AIsARgAoIBVwC5gF5AMUAbQA3ACHQEXgJEATsAocBTYCxQFsALgAXIAu0BeYC-gGGgMkAZPAywDLgGcwNYA1kBt4DdQHBAOTAeOA9oCEIELSgCEAC4AJABHADnAHcAQAAkQBYgDXgHbAP-Aj0BIoCYgE2gKQAU-ArsBdAC8gGLAMmAamA14B5QD4oH7AfuBAwCB4EEwIMAQbAhW.YAAAAAAAAAAA; OTAdditionalConsentString=1~; access_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQyODI1NzkzLCJzaWQiOiIwYTUyZDEzYy0xNzQyODI1NzkzIiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDI4MzI5OTMsInB1cnBvc2UiOiJhY2Nlc3MifQ.LJPF_tbfNawdFehii5MNoYtBlI5NbVkAibh7WFmsOxx1yL83LZOa8xhvt9-w7V9DYiRp8KwroxwMjSLK3YpBe4TLPYwqUfAJJAObDP-RWFRaHvmIDftaxnR-Fmk0z7PWdp3Aaf25HVsl3qRpZY9KjvSXLV0N8GpaMakqmncoq2Z8HpKBvayjI_ZTJ8FysODmYS0sHsG0r5Uslq-b7I5_Q7vKQx9Nbt5WALoUkrwlIBcGuDBzPLAOdhfvTU5jfKu3hlPx5y8rDaAxQlhfF4P33keIcqPvs9w5KL3soqLpRqNDjezYbUKykmnUKZ8rkvG-T1e8HNz3uq-G0UsDUQR0FQ; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQyODI1NzkzLCJzaWQiOiIwYTUyZDEzYy0xNzQyODI1NzkzIiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDM0MzA1OTMsInB1cnBvc2UiOiJyZWZyZXNoIn0.pM75RCbd_sBNpm9kzin9xYhTYxArY533xEM4rgGVVADLq6VrVUdT4nANUO8zbJX52t6Zkn9GyQXkaIBA6bRwM60UfdsNRjUc45OwY_7QTNEeI_irCytVmzPFrzIA_iW92rYiUTg3Oajw2st3678inoN3If9wC7BoFeqko6nk6QGHss8ZrR_EjoaTkld7JL0nzc3tqP--n7If2S-K_FjNUSmn5tHPTabQgmsspAb-VnyTYOj9qXuMmfbaPeDkrQeic0bQFGAG6wPuTzOG-c1uxQ0SVFaerYu-hx0s1lObygUnND26IYVJIGdx0Ro8ofh-wcq1RBKHMp5VLWxlo9r5pw; __cf_bm=xN_W1vfkDYwjFCAgSkAQy1vm4MvVrKHoK0Q9rXq.05w-1742825793-1.0.1.1-YULc8YuW8OklyoGfVX.G94RIgfTpVoeQ2lcAqy1.Ba5Izo2aL3TXYwmJNgKF.bbvRsQ4LWVLFxQ7ovV8O9VSrOnmg5XeHIgmCvmCLQYaU8psjzTY_6kV08JYpp428KKs; cf_clearance=1uo.wVEs7SmSE.jmxfTNMAqY8oJHnKJTpuPM5ed0au0-1742825794-1.2.1.1-5UdSH8nd8sGz1MRqOUQX6phw481GAM3t2d9Z6AfmeW1g63dIgfdXbGS7fF0mh8VD1n_E0Hmq0KI3t_dLkwMw.5UhaThuswO05CnltZ9azz0zmZTu3xqQ3NdrvlpzM1QUL68_aAnE8Ia5CgWvDVHbHisEmwZCvvRRl14iGHNijRdA92McjqjELRboGjVBBXVxCBV0PROi0pok6CW.iy1VY70GQ35jkiLrSQiX.HAoXfA1JpYL4GXe5Wxqhi6idR5LIQeCWsfO.XhzrRAnR53fXkBSw2NTVkSL8lv.lCrNVMUua4IOzmzp_qC9QQsGLLAv5I4Q8bWDdTppwo2ck97bwUcEVNwU7kdg6PPvfNaKAmA; v_sid=d8e517069fb78dd52a9b28d679a871bb; datadome=lqSpkEXPY_BqPrk4ehmFcOPdBfhBSCl2LviMBq4py6imUJyIrX3~4d4sakYv3X~R7iqTLMZbzeRcPgeLD5tnjWtvWnxbuCf13Z2Jgt~wSSjBwkYFKJ7XVnd0zS~Qs9cM; viewport_size=687; OptanonConsent=isGpcEnabled=0&datestamp=Mon+Mar+24+2025+15%3A16%3A48+GMT%2B0100+(heure+normale+d%E2%80%99Europe+centrale)&version=202312.1.0&browserGpcFlag=0&isIABGlobal=false&consentId=e685c9d2-b43b-4def-8bb3-68a4af4ad144&interactionCount=20&hosts=&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A0%2CC0003%3A0%2CC0004%3A0%2CC0005%3A0%2CV2STACK42%3A0%2CC0015%3A0%2CC0035%3A0&genVendors=V2%3A0%2CV1%3A0%2C&geolocation=FR%3BIDF&AwaitingReconsent=false; _vinted_fr_session=cnl2QmxOWHR3eDU5Q1dRYm5MQmxOUkE1WHJra1V6d3V2Mkc4aHloTUJsNGk0ak9VNWthNXBjVXZhZnFIaGJHcG9IZWU5WEo3U3BwOFJMMmJoVUg4b1hPL1RrbVdlUTBPRVpUZUg1SEJMR0p1bm8rbjQ2L1N3aHovcFRJM05YQ3VHRUVBS3M0UWx0SlVud2ZtSEthcnkrZElHNzh5Mk1zNDQzQ2NWZUdSTURVOXo5VmhmZFlhS2ZBTHNpdGF4YW9pekQ2VmNubGZNSmIrREFXbjJCMzB4SU1jejRtUG5XK2QrMWxiSlFqM3gvcE8wS3I3NGJCVDlGVzBkelpjZEJVcS0tMUNRU21JbWduUjZ0SVVaaDNzYStHUT09--abb37bc20a490a764358a23f73f052380d0a14e9; banners_ui_state=PENDING",
            "Referer": `https://www.vinted.fr/catalog?time=1742825795&disabled_personalization=true&page=1&search_text=${searchText}&brand_ids[]=89162&status_ids[]=6&status_ids[]=1`,
            "Referrer-Policy": "strict-origin-when-cross-origin"
          },
          "body": null,
          "method": "GET"
        });


        if(response.ok){
            const body = await response.json();
            const parsedJSONData =  parseJSON(body); // parse(body) + JSON.stringify
            fs.writeFileSync('vintedData.json', JSON.stringify(parsedJSONData, null, 2));
            return parsedJSONData;
        }

        console.error(response);
        return null;
    }
    catch (error){
        console.error(error);
        return null;
    }
};



/**
 * Export scrapping method
 */
module.exports.scrape = scrape; // export {scrape};







/*

const response = await fetch(`https://www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&time=1741008990&search_text=${searchText}&catalog_ids=&size_ids=&brand_ids=89162&status_ids=6,1&color_ids=&material_ids=`, {
          "headers": {
            "accept": "application/json, text/plain, *//*", // attention enlever un "/"
            "accept-language": "fr",
            "priority": "u=1, i",
            "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\", \"Opera\";v=\"117\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-anon-id": "e685c9d2-b43b-4def-8bb3-68a4af4ad144",
            "x-csrf-token": "75f6c9fa-dc8e-4e52-a000-e09dd4084b3e",
            "x-money-object": "true",
            "cookie": "_lm_id=FO9JZD4PGRPBG3K7; v_udt=L0dtcEJPM2FaVDBkUHZLc2EzU3hobjJGLzQzaS0tR2srUEl2cDhQaGEzRFhrby0tQnJZdE92cTQwRVAwQkZnS0pmSlBEUT09; anonymous-locale=fr; anon_id=e685c9d2-b43b-4def-8bb3-68a4af4ad144; ab.optOut=This-cookie-will-expire-in-2026; domain_selected=true; OptanonAlertBoxClosed=2025-01-06T15:07:49.737Z; eupubconsent-v2=CQKzpVgQKzpVgAcABBENBXFgAAAAAAAAAChQAAAAAAFBIIQACAAFwAUABUADgAHgAQQAyADUAHgARAAmABVADeAHoAPwAhIBDAESAI4ASwAmgBWgDDgGUAZYA2QB3wD2APiAfYB-gEAAIpARcBGACNAFBAKgAVcAuYBigDRAG0ANwAcQBDoCRAE7AKHAUeApEBTYC2AFyALvAXmAw0BkgDJwGXAM5gawBrIDYwG3gN1AcEA5MBy4DxwHtAQhAheEAOgAOABIAOcAg4BPwEegJFASsAm0BT4CwgF5AMQAYtAyEDIwGjANTAbQA24BugDygHyAP3AgIBAyCCIIJgQYAhWBC4cAwAARAA4ADwALgAkAB-AGgAc4A7gCAQEHAQgAn4BUAC9AHSAQgAj0BIoCVgExAJlATaApABSYCuwFqALoAYgAxYBkIDJgGjANNAamA14BtADbAG3AOPgc6Bz4DygHxAPtgfsB-4EDwIIgQYAg2BCsdBLAAXABQAFQAOAAgABdADIANQAeABEACYAFWALgAugBiADeAHoAP0AhgCJAEsAJoAUYArQBhgDKAGiANkAd4A9oB9gH6AP-AigCMAFBAKuAWIAuYBeQDFAG0ANwAcQA6gCHQEXgJEATIAnYBQ4Cj4FNAU2AqwBYoC2AFwALkAXaAu8BeYC-gGGgMeAZIAycBlUDLAMuAZyA1UBrADbwG6gOLAcmA5cB44D2gH1gQBAhaQAJgAIADQAOcAsQCPQE2gKTAXkA1MBtgDbgHPgPKAfEA_YCB4EGAINgQrIQHQAFgAUABcAFUALgAYgA3gB6AEcAO8Af4BFACUgFBAKuAXMAxQBtADqQKaApsBYoC0QFwALkAZOAzkBqoDxwIWkoEQACAAFgAUAA4ADwAIgATAAqgBcADFAIYAiQBHACjAFaANkAd4A_ACrgGKAOoAh0BF4CRAFHgLFAWwAvMBk4DLAGcgNYAbeA9oCB5IAeABcAdwBAACoAI9ASKAlYBNoCkwGLANyAeUA_cCCIEGCkDgABcAFAAVAA4ACCAGQAaAA8ACIAEwAKQAVQAxAB-gEMARIAowBWgDKAGiANkAd8A-wD9AIsARgAoIBVwC5gF5AMUAbQA3ACHQEXgJEATsAocBTYCxQFsALgAXIAu0BeYC-gGGgMkAZPAywDLgGcwNYA1kBt4DdQHBAOTAeOA9oCEIELSgCEAC4AJABHADnAHcAQAAkQBYgDXgHbAP-Aj0BIoCYgE2gKQAU-ArsBdAC8gGLAMmAamA14B5QD4oH7AfuBAwCB4EEwIMAQbAhW.YAAAAAAAAAAA; OTAdditionalConsentString=1~; v_sid=6a3e164f-1739192688; access_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQxMDA3NTA3LCJzaWQiOiI2YTNlMTY0Zi0xNzM5MTkyNjg4Iiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDEwMTQ3MDcsInB1cnBvc2UiOiJhY2Nlc3MifQ.XpHPT-b9QQFI6CPZBLG5g_YjhcfgBW040Q6FDE3q9S5zYO5KENPkkAn6z8A5d1SWd7mAO5KsPJCdcdXtcBECxw6_B-ctJFzB62Mb46wGpknVjYKATMgDF9nkxwOdIkmBV8wIV_xa0feZ2GsT-0EeTHbQYOxvpeA_naF1jg1di9VlAzU7h6eB5h6UZfdLdOzPJbS-qbYE7JmsyCqsjTNoTZYRMFXAIuQQvALXEV6gbQ9w7kams7PqChh6xbMd0fbkyk6DwyVY8h1VWlo5Tsb9L1g2ZhaFj0s9yfzz3UKkOOD5P4QspYoRaanJfM7yHXirDajvXe0fA6T3G3J8z1bt9g; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwiaWF0IjoxNzQxMDA3NTA3LCJzaWQiOiI2YTNlMTY0Zi0xNzM5MTkyNjg4Iiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3NDE2MTIzMDcsInB1cnBvc2UiOiJyZWZyZXNoIn0.VbY3hr3KNbnucMZj1unrP6OfV8TJ2-oXbrBof_5CI7i3pmgmEEZmYqnXfrdkD3si5d3DqBmAbjoPvPlFlNOcKe2r322QIZt7ZTaLZx6t4bjr2EUxJmAWEyC2W5VYJsdVOYzZ5fk9uDCaFwxsY0vlOeue5Tn0csGrd510Jkv62xzcRnU2Ph3fyRem6IZb2CfO_tQmNTspermuXjJL1lvMkJtTaMCHWcnftMIk1GkoJZy6szzBqQFP_3lDfcVxKWkPgz1AIy3zUaM8FAEHl8v5GsnscBMJxxM7aDbTF-iKHY1LhGe58l33xAGQKg1F3BtW3pQjdlk0XxrjBQGGTIo1Yw; datadome=0hXK4CPAURlGy2nByaW9QP7Hk0wIu70zHZYzBLPyUsjg_qd6MFm0pPmljGxF1YyhskXkJgg5qJrHXKjYCjBeDsBfik0aZjCaAA6sXezfLRlnM_JtzpPcGnMHscWc2HVo; __cf_bm=6DDKulxDt5nyu9FCqNorPoa0zH.SIl0pDEWCsURsmIc-1741010196-1.0.1.1-1s9cumT3BN1bstiTdfbIE4MJyv6xf6pLx.Q3y_Iig_cxxLPMYfnkf.OZOqmBnEzEg8uk1S0sN986.LPa.PxCPP9mCXjHS3DTqWHwDHo6xtgJn_.fOl5seDSr3795Bd5g; viewport_size=510; cf_clearance=QsxWra8XerluIy151RD0i7lbtKq3G_9jJdAhLIvPQUw-1741010245-1.2.1.1-_vksvKZ5snmVzUKccRnIOljjobPFcLC0P9.zGzTv0c.ishOy2HAdcKHrScOFDZMiKq3J4ff3nIAKTWwn4K6IUOQLRVAHKH.M_6.ecYtWAWToniiompsGslmR1x2TAWWrk.aGBynKeZeJ9FEcbLbyVmTGDpze_rfk4oJ.CbqbtsPxysauivF9iJEYOJLF0Q2R4x1EoPra4HDz0qSGJiWbjQshcpfY.4z7sCBGlE6fzgId7CXN10hVPF0z8k9wbzMTXThg875mRSZPRpRO0x0jtqPNcy6GXrGrVPvxCoLP9GAqSR1j9PNkwEMGsv1ek85Vt.kUS1oY1PJokEbhZY1SnP.nKhAVV1PvfjsKOAZNJ_o__rh6fKY.iCpGS0OQk6Gzmr6QhqPPBi3oQGnP6T6vkAtfa.lPLsxzZVSJdu7ht5Y; OptanonConsent=isGpcEnabled=0&datestamp=Mon+Mar+03+2025+14%3A57%3A26+GMT%2B0100+(heure+normale+d%E2%80%99Europe+centrale)&version=202312.1.0&browserGpcFlag=0&isIABGlobal=false&consentId=e685c9d2-b43b-4def-8bb3-68a4af4ad144&interactionCount=17&hosts=&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A0%2CC0003%3A0%2CC0004%3A0%2CC0005%3A0%2CV2STACK42%3A0%2CC0015%3A0%2CC0035%3A0&genVendors=V2%3A0%2CV1%3A0%2C&geolocation=FR%3BIDF&AwaitingReconsent=false; banners_ui_state=PENDING; _vinted_fr_session=TmpUUG9aNlVBQ3Axd2UvUjdVanN0QVdDS2h1cyt2SThUL21EbFRZUFhNVXBJM3pCa2JQaXJyNFNKRGlMalp5MGxybnQ1bC9pWDVURUx4Mm80TG0ybjlqc0t4b2VUVEdQcGxGaHNzcmtURnlhcGxRMEdtYWdCc1I0R3FZczZwZHJ3b1ZyajJJdzJTWFlSMXJ4dk15eDNaR0lsdzhFTVlseWpac3E0bUVhWVlhSkxJUldUOEd2elkzdGtRaXJQeG0vWUVWK1JSaE9YUGsxZmppNHJ4NlpOcGVpbm9VNjNhK0NYVXgxWGo3cmR2SkV0RlQyQXF6OU4xc2xXMkRvSkVLTDMrR2pHWE5ZSGlldVJGOE1vQVpWRzNjVkRXOVZRNmNHMUltajQxODhtdW00YUtiaysrZ09PTUUraXV5TGN0YXRUZERFb3A0UUdGN1JDNWdDUVlncCtJaG9DRVdGaUd5WGQwdENYUi8zVEFVVERTODg2NWFkUGlYNjJZRzFpaVplb1FRRjR2STI3NU1wemlqVlNSczFnY3RONkFsZTRxN0ZYUCszWlJnUENwZW9DRjF1NXhKek5PcTI5THhyajArbHd3ZzY4emhhems0MVNjRmo1aG5oWWhUTC9YUUEyQU9FcWVZY0pwOFlWSW5yMjczQXlRWDZKcWlTSm4rL0d1cktWU29XeXZiMWlHTlpoZWpuRlhZeFR6YS81bFhDY1lRWVZwcFBuakFBaERsbWZhSm1iSHlSWHR0YUhvV21KWFozS0p4NlJ5NUxDc3dwbDdXcnYxZjV3OWtJQjBOMlUwdUtFVi92SzFEdWNEeVYwVk4xdUFpL1hEclFGQlU2OTZzZUpIa2dVSFhRdFllN25ZR1JObjZVZGlkT0pPNkExaHV0a3VRVFViM29LMCtoM2oyUVF2dGdKZ1plek9neG53dnlBNHIrTlk0WXJqa1N1TTcrUkp4ZTV0akhqeldOOFY2bTgwZEI3a1VRSUk0bHVMb294QzgvMlZOanphbGtnelptY3BnbTVyMjBZMnR1R1Y5QzdkeW9MYS9uM1pTUE5TVlhKTGI2S0NPMlJOUHl1NEZDVHBNL0FwRjM5b2MyT0RYN1BkYnhBSUVlNy9GMXRCUmtac1JuSHd2OHByenJYTFNUbzdjQThiblNMNDRmWExrRFNoS1VHOUZWWjZwNGxHdkpTdjNjdTh5bkxxNHFwTFp3K1Z0VUxQQk9DUFNzOERFeHRVa0lSaVpicFQ3Z3dWS20xQ2xDdk02bkFPVFQwcjNYTUxPZ3BYV096SSs2akMwM0M0bWMzUjZVZ1hHV2NMZVFOK3hPeThVY3ZyOGdKUGxiNFhyai9KN3lBbjBRKzZMQzQybVMrZGdzRSt1L0JEQldXcUdLZmorZDRTMUZvZzMrNHZGcFFMdUxVdjAzNUxaN00vcVBFM0VxVjZsbjZkNCtsMTFoazVLazRzN2VFMkYyWk5mOGpqVHJDSVNOWEU1NFdXVnFkcHVpb2FLR0ZkWHFYNzFSbGk5aXJLZVBOdnZUZVlzM2tlMHQ1ZG1EdDYzaWkyY25OeTRlY2VNcUJpajJDVTJvUEZ5aHVWZUlpTkQzUW1LS001cDVqc3Q3TjZJaFVDd0N4NVBkWi9NL2JOYnErQVBmWE5rZk5oR2hxaUVQZVlFdk8xOWtKdHNXaWxXU0pKcy9qRTFBSHB2a2o0SmJLSk1nWDQ5bitwaVB2Q1gwZFRzdnNWV0tiVHN5VVVnZ09BRDRpbUMra0QyZ1VXSXRQNXdzSVFnSWJnMHk1KzhibmxGZ0JqT1dzK2lxRTJibDRSZGNFeG5XdlFSK0I0YllSVEtuSnBxV01XcVR2NDIwOUw1WkJCSGk4MmZkMjEzZUJUcW5HZjFPMnVxTnVMallDMm5DUEQrNTFIT2x5SDMrMThXeUFLU1NwWGQyK3BWM3JPK3ExSTg2ZitBOVVpZEV5L3RSR2dneDFlOGJlYjFPcFpuVThFTWNhVU5qZDdTQUdWSndzcTdPTkhhUnVpMExiSGM3bUgvR1lCMU5wb2xxbFU0UGNQQmk0Qmk1ekJBVXp4QTFibVNVUkY3U2h6dkIxMXBWbWRPRjNJYWVmMGIvVndVY2ljMkZzWmRJUWpGczRVTFg1OHFoeE5Uc1k1NGxJQlpPTG5tTXpIS0VnSEtaRG5OOXBWZ2ZpNjR0RkZacWRqRS9aakFHN1BzYUs1eU5wWGZvY3hUdjlnTUx1dnZXU0dEQW5wd0ViM1FTUVNudklJTU1nN3B3VW0wSzRDellLdkpLNjlHWWV1eXdIZ2NiVllaNGZ0V1pmVVp2emJUVTdObXhvWjNnbG1vTjJ2TDYzWXViTVZ5Wjl6NGhva1dHZCtEaWEwOXg3VVg5cEZCci0tMjdtWkRmYlh4VVNDamd2anhsYzV1dz09--43407e03d8ea77a5b21fd19a96df1f4f441aa365",
            "Referer": `https://www.vinted.fr/catalog?time=1741008990&disabled_personalization=true&page=1&search_text=${searchText}&brand_ids[]=89162&status_ids[]=6&status_ids[]=1`,
            "Referrer-Policy": "strict-origin-when-cross-origin"
          },
          "body": null,
          "method": "GET"
        });


*/