import downloadString from './downloadString.js';

//
 
export default async function PUT(content, url) {

  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {

    return new Promise((resolve, reject) => {
      downloadString(content, 'application/json', 'Beuys.json');
      var init = { "status" : 200 , "statusText" : "SuperSmashingGreat!" };
      var myResponse = new Response(new Blob(), init);
      resolve(myResponse);
    });

  } else {

    return await fetch(url, {
      method: 'PUT', 
      body: content
    });
  }
}