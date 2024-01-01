document.getElementById("horse").addEventListener("click", submitAPI);

function submitAPI() {
	console.log("papa: ");
	let value = document.getElementById('api-key').value;
	chrome.storage.sync.set({ key: value }).then(() => {
		console.log("Value is set");
	});
}

function retriveKey() {
	chrome.storage.sync.get(["key"]).then((result) => {
		console.log("Value currently is " + result.key);
	});
}



// document.addEventListener('DOMContentLoaded', function() {
//     const checkboxes = document.querySelectorAll('.switch input[type="checkbox"]');

//     checkboxes.forEach(function(checkbox) {
//         checkbox.addEventListener('change', function() {
//             const status = this.checked ? 'Enabled' : 'Disabled';
//             const label = this.parentElement.querySelector('.status');
//             // label.textContent = status;
//         });
//     });
// });
