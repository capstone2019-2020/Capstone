const fileBox = document.getElementById("file-box");
const dropArea = document.getElementById("drop-area");
const fileUpload = document.getElementById("fileUpload");
const customText = document.getElementById("custom-text");
const submit = document.getElementById("generate");

const SERVER_URI = 'http://localhost:3000';

// https://www.smashingmagazine.com/2018/01/drag-drop-file-uploader-vanilla-js/
// To prevent default behaviour
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false)
  })
  
function preventDefaults (e) {
    e.preventDefault()
    e.stopPropagation()
};
  
['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false)
});
  
['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false)
});
  
function highlight(e) {
    dropArea.classList.add('highlight')
}
  
function unhighlight(e) {
   dropArea.classList.remove('highlight')
}

dropArea.addEventListener('drop', handleDrop, false);
fileUpload.addEventListener('change', uploadFile, false);
submit.addEventListener('submit', sendNext);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;

    uploadFile(files);
};

function previewFile() {
    if (fileUpload.value) {
        // customText.innerHTML = fileUpload.value.match(/[\/\\]([\w\d\s\.\-\(\)]+)$/)[1];
        customText.innerHTML = fileUpload.value;
    } else {
        customText.innerHTML = "";
    }
};

function uploadFile(evt) {
    evt.preventDefault();
    previewFile();
    var contents;
    var f = evt.target.files[0];
    
    if (f) {
        var reader = new FileReader();
        reader.onload = function (e) {
            contents = e.target.result.split("\r\n");
            preview = document.getElementById('test');
            alert("Got the file name: " + f.name + "contents: "
            + contents[0]);
            // preview.innerHTML = e.target.result;

            fetch(`${SERVER_URI}/input-file`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({contents})
            })
            .then(() =>
                {
                    // alert("Entered the server");
            })
            .catch(() => 
                {
                    alert("Did not enter the server");
            })
        }
        reader.readAsText(f);      
    }
    else {
        alert("Failed to load file");
    }
    
    // const circuit = await resp.json();
}

// Generate button
function sendNext(event) {
    event.preventDefault();
}
