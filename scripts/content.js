var portKey = "victoria";
var port = chrome.runtime.connect({ name: "victoria" });
port.postMessage({ name: portKey });
var count = 0;
chrome.storage.session.setAccessLevel({accessLevel: "TRUSTED_AND_UNTRUSTED_CONTEXTS"});
// implement redundancy
// 


port.onMessage.addListener(function (msg) {
  let bootyCall = port.question;
  console.log("[!] port.question: " + msg.url, count++);
  main(msg.url);
});

var score = 0;
let ipqualityscore_url = "https://www.ipqualityscore.com/api/json/url/";
let API_KEY = ''; //

function checkLongURL(url, len) {
  if (url.length > len) {
    score += 1;
    return true;
  }
  return false;
}

function checkShortURL(url) {
  const regex = new RegExp('bit\\.ly|goo\\.gl|shorte\\.st|go2l\\.ink|x\\.co|ow\\.ly|t\\.co|tinyurl|tr\\.im|is\\.gd|cli\\.gs|yfrog\\.com|migre\\.me|ff\\.im|tiny\\.cc|url4\\.eu|twit\\.ac|su\\.pr|twurl\\.nl|snipurl\\.com|short\\.to|BudURL\\.com|ping\\.fm|post\\.ly|Just\\.as|bkite\\.com|snipr\\.com|fic\\.kr|loopt\\.us|doiop\\.com|short\\.ie|kl\\.am|wp\\.me|rubyurl\\.com|om\\.ly|to\\.ly|bit\\.do|t\\.co|lnkd\\.in|db\\.tt|qr\\.ae|adf\\.ly|goo\\.gl|bitly\\.com|cur\\.lv|tinyurl\\.com|ow\\.ly|bit\\.ly|ity\\.im|q\\.gs|is\\.gd|po\\.st|bc\\.vc|twitthis\\.com|u\\.to|j\\.mp|buzurl\\.com|cutt\\.us|u\\.bb|yourls\\.org|x\\.co|prettylinkpro\\.com|scrnch\\.me|filoops\\.info|vzturl\\.com|qr\\.net|1url\\.com|tweez\\.me|v\\.gd|tr\\.im|link\\.zip\\.net');
  const boolValue = regex.test(url);
  if (boolValue) {
    score += 1;
  }
  return boolValue;
}

const DataHandler = (jsonData) => {
  if (jsonData.malware)
    score += 1;
  if (jsonData.redirected)
    score += 1;
  if (jsonData.phishing)
    score += 1;
  if (jsonData.risk_score !== 0)
    score += 1;
  if (jsonData.spamming)
    score += 1;
  if (jsonData.unsafe)
    score += 1;
  if (jsonData.suspicious)
    score += 1;
}

const sendHTTPReq = async (url) => {
  try {
    url = ipqualityscore_url + API_KEY + url;
    let response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      console.log('Body:', data);
      return true;
    } else {
      console.log('Response error:', response.status, response.statusText);
      return false;
    }
  } catch (err) {
    console.error('Exception while sending the request:', err);
    return false;
  }
};

function checkIDN(url) {
  console.log(url);
  let tmp_url = url.split('/');
  let domain = tmp_url[2];
  for (let i = 0; i < domain.length; i++) {
    if (domain.charCodeAt(i) > 127) {
      score += 1;
      return true;
    }
  }
  return false;
}

async function isRedirectingToAnotherDomain(url) {
  try {
    const response = await fetch(url, { 
      method: 'GET', 
      mode: 'cors', 
      headers: { 'Access-Control-Allow-Origin': '*' },
      redirect: 'follow' 
    });
    if (response.redirected) {
      const originalDomain = new URL(url).hostname;
      const finalURL = response.url;
      const finalDomain = new URL(finalURL).hostname;
      score += 1;
      if (originalDomain !== finalDomain) {
        score += 1;
        return true;
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
  return false;
}

const saveData = async (url, data) => {
  let data_to_store = {url:data};
  const key = "yummy_yum";  
  chrome.storage.local.set({key, data_to_store}).then(() => {
    console.log("Value is set!!");
    }
  )
}

const getAllKeys = () => {
  chrome.storage.local.get(null, function(items) {
    var allKeys = Object.keys(items);
    console.log("[+]keys: "+ allKeys);
});

}

const getData = () => {
  const key = "yummy_yum";
  chrome.storage.local.get(["key"]).then((result) => {
  console.log("Value currently is " + result);
  });
}

const offline_check = (url) => {
  const LongURl = checkLongURL(url);
  const ShortURl = checkShortURL(url);
  const IDN = checkIDN(url);
  const Redirecting = isRedirectingToAnotherDomain(url.split('/')[0]+"//"+url.split('/')[2]); 
  const JsonData = {
    "LongURL": LongURl,
    "ShortURL": ShortURl,
    "IDN" : IDN,
    "Redirecting": Redirecting
  };
  return JsonData;
}

const URLSeprator = (url, api=0) => {
    let tmp_url = url.split('/');
    let domain = tmp_url[2];
    let scheme = null;
    if(api === 1){scheme = tmp_url[0].slice(0, -1) + '%3a%2f%2f';}
    else{scheme = tmp_url[0]+'//';}
    
    let endpoint = tmp_url[3];
    url = scheme + domain;
    return [scheme, domain, endpoint];
}

const main = (url) => {

  console.log("URL: ", url);
  
  if (API_KEY !== '') {
    let [scheme, domain, endpoint] = URLSeprator(url, api=1);
    url = scheme+domain;
    sendHTTPReq(url);
  } else {
    let [scheme, domain, endpoint] = URLSeprator(url);
    url = scheme + domain;
    const JsonData = offline_check(url);
    console.log("{!} JsonData: "+ JSON.stringify(JsonData));
    //saveData(url, JsonData);
    // getAllKeys();
    getData();
  }

  console.log('Final Score: ' + score);
  // saveData(); getData();
  if (score >= 1) {
    showCustomWarning();
  }
}

function showCustomWarning() {
  var modal = document.createElement('div');
  modal.id = 'customWarningModal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <p>This website may not be safe!</p>
    </div>
  `;

  document.body.appendChild(modal);

  var style = document.createElement('style');
  style.innerHTML = `
    #customWarningModal {
      display: none;
      position: fixed;
      z-index: 1; 
      left: 0;  
      top: 0;
      width: 100%;
      height: 100%;
      overflow: auto;
      background-color: rgba(0, 0, 0, 0.7);
    }

    .modal-content {
      background-color: #fefefe;
      margin: 15% auto;
      padding: 20px;
      border: 1px solid #888;
      width: 50%;
      text-align: center;
    }

    .close {
      color: #aaa;
      float: right;
      font-size: 28px;
      font-weight: bold;
      cursor: pointer;
    }

    .close:hover {
      color: black;
      text-decoration: none;
    }
  `;

  document.head.appendChild(style);

  modal.style.display = 'block';

  var closeButton = modal.querySelector('.close');
  closeButton.addEventListener('click', closeCustomWarning);
}

function closeCustomWarning() {
  var modal = document.getElementById('customWarningModal');
  modal.style.display = 'none';
}
