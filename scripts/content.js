var portKey = "victoria";
var port = chrome.runtime.connect({ name: "victoria" });
console.log("Connected with port..!");
port.postMessage({ name: portKey });
var count = 0;
//chrome.storage.session.setAccessLevel({ accessLevel: "TRUSTED_AND_UNTRUSTED_CONTEXTS" });

port.onMessage.addListener(function (msg) {
  // let bootyCall = port.question;
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
    console.error(error);
  }
  return false;
}

const saveData = async (url, data) => {
  let data_to_store = { url: data };
  const key = "yummy_yum";
  chrome.storage.local.set({ key, data_to_store }).then(() => {
    console.log("Value is set!!");
  }
  )
}

const getAllKeys = () => {
  chrome.storage.local.get(null, function (items) {
    var allKeys = Object.keys(items);
    console.log("[+]keys: " + allKeys);
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
  const Redirecting = isRedirectingToAnotherDomain(url.split('/')[0] + "//" + url.split('/')[2]);
  const JsonData = {
    "LongURL": LongURl,
    "ShortURL": ShortURl,
    "IDN": IDN,
    "Redirecting": Redirecting
  };
  return JsonData;
}

const URLSeprator = (url, api = 0) => {
  let tmp_url = url.split('/');
  let domain = tmp_url[2];
  let scheme = null;
  if (api === 1) { scheme = tmp_url[0].slice(0, -1) + '%3a%2f%2f'; }
  else { scheme = tmp_url[0] + '//'; }

  let endpoint = tmp_url[3];
  url = scheme + domain;
  return [scheme, domain, endpoint];
}

const main = async (url) => {
  console.log("URL: ", url);

  if (API_KEY !== '') {
    let [scheme, domain, endpoint] = URLSeprator(url, api = 1);
    url = scheme + domain;
    const success = await sendHTTPReq(url);
    if (success) {
      checkScoreAndShowWarning();
    }
  } else {
    let [scheme, domain, endpoint] = URLSeprator(url);
    url = scheme + domain;
    const JsonData = offline_check(url);
    console.log("{!} JsonData: " + JSON.stringify(JsonData));
    //saveData(url, JsonData);
    // getAllKeys();
    //getData();
    checkScoreAndShowWarning();
  }

  console.log('Final Score: ' + score);
  // saveData(); getData();
};

function checkScoreAndShowWarning() {
  if (score >= 1) {
    showCustomWarning();
  }
}

function showCustomWarning() {
  // Create elements for the warning overlay
  const warningOverlay = document.createElement("div");
  warningOverlay.id = "warningOverlay";
  warningOverlay.style.position = "fixed";
  warningOverlay.style.top = "0";
  warningOverlay.style.left = "0";
  warningOverlay.style.width = "100%";
  warningOverlay.style.height = "100%";
  warningOverlay.style.background = "rgba(255, 0, 0)";
  warningOverlay.style.display = "flex";
  warningOverlay.style.flexDirection = "column";
  warningOverlay.style.alignItems = "center";
  warningOverlay.style.justifyContent = "center";
  warningOverlay.style.zIndex = "9999";

  const warningMessage = document.createElement("p");
  warningMessage.style.color = "#fff";
  warningMessage.style.fontSize = "24px";
  warningMessage.innerText = "Warning: This website may not be safe to visit. Hackers might steal your information.";

  const backToSafetyButton = document.createElement("button");
  backToSafetyButton.style.padding = "10px";
  backToSafetyButton.style.fontSize = "16px";
  backToSafetyButton.style.cursor = "pointer";
  backToSafetyButton.innerText = "Back to Safety";
  backToSafetyButton.addEventListener("click", function () {
    // Remove the warning overlay when the button is clicked
    warningOverlay.remove();
    // Check if there is a previous page in the browser history
    if (window.history.length > 1) {
      // Navigate back in the browser history
      window.history.back();
    } else {
      // If no previous page, open a new tab with a default URL
      const defaultURL = "https://example.com"; // Replace with your desired default URL
      chrome.tabs.create({ url: defaultURL });
    }
    // Reset body and html styles
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  });

  // Append elements to the warning overlay
  warningOverlay.appendChild(warningMessage);
  warningOverlay.appendChild(backToSafetyButton);

  // Append the warning overlay to the body
  document.body.appendChild(warningOverlay);

  // Set body and html styles to hide overflow
  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";
}

// Call the function directly
// main("https://example.com"); // Replace with your actual URL
